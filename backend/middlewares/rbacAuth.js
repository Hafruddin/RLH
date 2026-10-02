// backend/middlewares/rbacAuth.js — Server-side Role-Based Access Control
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "medicare_nexus_super_secret_jwt_key_2026";

/**
 * Validates JWT token from Bearer header or x-user-id fallback.
 * Attaches verified user to req.user.
 */
export async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.headers["x-access-token"]) {
      token = req.headers["x-access-token"];
    }

    if (!token) {
      // Check for dev / demo header shim
      const devRole = req.headers["x-user-role"];
      const devUserId = req.headers["x-user-id"];
      if (devRole) {
        req.user = {
          userId: devUserId || `user_${devRole.toLowerCase()}_01`,
          role: devRole.toUpperCase(),
          department: req.headers["x-user-department"] || "General",
          permissions: ["ALL_DEMO_PERMISSIONS"],
          name: req.headers["x-user-name"] || `${devRole} User`,
          email: `${devRole.toLowerCase()}@medicare.com`
        };
        return next();
      }

      return res.status(401).json({
        success: false,
        errorCode: "UNAUTHENTICATED",
        message: "Authentication token missing. Please sign in.",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      userId: decoded.userId || decoded.id,
      email: decoded.email,
      role: (decoded.role || "PATIENT").toUpperCase(),
      department: decoded.department || "General",
      permissions: decoded.permissions || [],
      associatedId: decoded.associatedId || null,
      name: decoded.name || "Authenticated User"
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      errorCode: "INVALID_TOKEN",
      message: "Session token invalid or expired. Please sign in again.",
    });
  }
}

/**
 * Strict role validator.
 * Ensures the authenticated user's role matches one of the authorized roles.
 */
export function authorizeRoles(...allowedRoles) {
  const normalized = allowedRoles.map((r) => r.toUpperCase());
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        errorCode: "UNAUTHENTICATED",
        message: "Authentication required before role verification.",
      });
    }

    if (!normalized.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        errorCode: "ROLE_UNAUTHORIZED",
        message: `Forbidden: role '${req.user.role}' is not authorized to access this resource. Required roles: ${normalized.join(", ")}`,
        currentRole: req.user.role,
        requiredRoles: normalized
      });
    }

    next();
  };
}

/**
 * Enforces patient data ownership.
 * Prevents any patient from reading or updating another patient's data.
 */
export function enforcePatientOwnership(paramKey = "patientId") {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthenticated" });

    // Admins and Doctors with appropriate role can access patient data
    if (req.user.role === "ADMIN" || req.user.role === "DOCTOR") {
      return next();
    }

    if (req.user.role === "PATIENT") {
      const requestedId = req.params[paramKey] || req.query[paramKey] || req.body[paramKey];
      if (requestedId && String(requestedId) !== String(req.user.userId) && String(requestedId) !== String(req.user.associatedId)) {
        return res.status(403).json({
          success: false,
          errorCode: "CROSS_PATIENT_ACCESS_DENIED",
          message: "Security violation: You are not authorized to view or access other patients' medical records.",
        });
      }
    }

    next();
  };
}

/**
 * Department-level scope enforcement for Staff workflows.
 */
export function authorizeDepartment(...allowedDepartments) {
  const normalized = allowedDepartments.map((d) => d.toUpperCase());
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthenticated" });

    if (req.user.role === "ADMIN") return next(); // Admins oversee all departments

    const userDept = (req.user.department || "").toUpperCase();
    if (!normalized.some((d) => userDept.includes(d))) {
      return res.status(403).json({
        success: false,
        errorCode: "DEPARTMENT_UNAUTHORIZED",
        message: `Department '${req.user.department}' is not authorized for this specific workflow. Allowed: ${normalized.join(", ")}`,
      });
    }

    next();
  };
}
