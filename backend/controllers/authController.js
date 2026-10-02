// backend/controllers/authController.js — Unified Role Authentication
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "medicare_nexus_super_secret_jwt_key_2026";

// Built-in hardcoded fallback users to ensure immediate hackathon & offline reliability
export const DEMO_USERS = [
  {
    userId: "P-101",
    email: "patient@medicare.com",
    password: "password123",
    name: "Harsh Tripathi",
    role: "PATIENT",
    department: "Patient Care",
    associatedId: "P-101",
    permissions: ["READ_OWN_RECORDS", "BOOK_APPOINTMENT", "VIEW_JOURNEY", "REQUEST_EMERGENCY"],
    redirectUrl: "/patient/dashboard"
  },
  {
    userId: "DOC-01",
    email: "doctor@medicare.com",
    password: "password123",
    name: "Dr. Sarah Johnson",
    role: "DOCTOR",
    department: "Cardiology",
    associatedId: "DOC-01",
    permissions: ["OPD_CONSULTATION", "ORDER_DIAGNOSTICS", "REQUEST_ADMISSION", "REQUEST_SURGERY", "VIEW_ASSIGNED_PATIENTS"],
    redirectUrl: "/doctor/dashboard"
  },
  {
    userId: "ADM-01",
    email: "admin@medicare.com",
    password: "password123",
    name: "Hospital Operations Supervisor",
    role: "ADMIN",
    department: "Hospital Operations",
    associatedId: "ADM-01",
    permissions: ["MANAGE_BEDS", "MANAGE_STAFF", "MANAGE_OT", "APPROVE_RECOMMENDATIONS", "RESOLVE_CONFLICTS", "VIEW_AUDIT_LOGS", "RUN_SIMULATION"],
    redirectUrl: "/admin/dashboard"
  },
  {
    userId: "N-07",
    email: "nurse@medicare.com",
    password: "password123",
    name: "Nurse Sarah Jenkins (N-07)",
    role: "STAFF",
    department: "Nursing",
    associatedId: "N-07",
    permissions: ["TASK_INBOX", "BED_CLEANING", "PATIENT_TRANSFER", "DEPARTMENT_OPERATIONS"],
    redirectUrl: "/staff/dashboard"
  },
  {
    userId: "LAB-01",
    email: "lab@medicare.com",
    password: "password123",
    name: "Lab Specialist Kumar",
    role: "STAFF",
    department: "Laboratory",
    associatedId: "LAB-01",
    permissions: ["LAB_TESTS", "UPLOAD_REPORTS", "TASK_INBOX"],
    redirectUrl: "/staff/dashboard"
  },
  {
    userId: "PHARM-01",
    email: "pharmacy@medicare.com",
    password: "password123",
    name: "Lead Pharmacist Priya",
    role: "STAFF",
    department: "Pharmacy",
    associatedId: "PHARM-01",
    permissions: ["DISPENSE_MEDICATION", "INVENTORY_CHECK", "TASK_INBOX"],
    redirectUrl: "/staff/dashboard"
  },
  {
    userId: "CLEAN-01",
    email: "cleaning@medicare.com",
    password: "password123",
    name: "Sanitation Team Rajesh",
    role: "STAFF",
    department: "Bed Cleaning",
    associatedId: "CLEAN-01",
    permissions: ["CLEAN_BED", "VERIFY_BED", "TASK_INBOX"],
    redirectUrl: "/staff/dashboard"
  },
  {
    userId: "TRF-01",
    email: "transfer@medicare.com",
    password: "password123",
    name: "Orderly Transport Escort",
    role: "STAFF",
    department: "Transfer",
    associatedId: "TRF-01",
    permissions: ["PATIENT_TRANSIT", "CONFIRM_ARRIVAL", "TASK_INBOX"],
    redirectUrl: "/staff/dashboard"
  }
];

function getRedirectForRole(role) {
  switch (String(role).toUpperCase()) {
    case "PATIENT":
      return "/patient/dashboard";
    case "DOCTOR":
      return "/doctor/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    case "STAFF":
      return "/staff/dashboard";
    default:
      return "/";
  }
}

/**
 * Generates signed JWT payload ensuring role consistency.
 */
function createToken(user) {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      permissions: user.permissions || [],
      associatedId: user.associatedId || null,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/**
 * Unified Login API endpoint.
 * Returns role, department, permissions, JWT token, and verified redirectUrl.
 */
export async function login(req, res) {
  try {
    const { email, password, role } = req.body || {};

    if (!email && !role) {
      return res.status(400).json({
        success: false,
        message: "Email or target role is required.",
      });
    }

    // 1. Check database if connected
    let user = null;
    try {
      if (email) {
        user = await User.findOne({ email: email.toLowerCase() });
      } else if (role) {
        user = await User.findOne({ role: role.toUpperCase() });
      }
    } catch (e) {
      console.warn("DB user query fallback:", e.message);
    }

    // 2. Check DEMO_USERS fallback
    if (!user) {
      if (email) {
        user = DEMO_USERS.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
      }
      if (!user && role) {
        user = DEMO_USERS.find(
          (u) => u.role.toUpperCase() === role.toUpperCase()
        );
      }
    }

    if (!user) {
      // Create guest patient session if neither email nor recognized demo role matches
      user = {
        userId: `P-${Date.now().toString().slice(-4)}`,
        name: email ? email.split("@")[0] : "Guest Patient",
        email: email || "guest@medicare.com",
        role: "PATIENT",
        department: "Patient Care",
        permissions: ["READ_OWN_RECORDS", "BOOK_APPOINTMENT", "VIEW_JOURNEY"],
        associatedId: `P-${Date.now().toString().slice(-4)}`,
      };
    }

    const token = createToken(user);
    const redirectUrl = getRedirectForRole(user.role);

    return res.json({
      success: true,
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        permissions: user.permissions,
        associatedId: user.associatedId,
      },
      redirectUrl,
    });
  } catch (err) {
    console.error("Auth login error:", err);
    return res.status(500).json({ success: false, message: "Internal authentication error" });
  }
}

/**
 * Returns current authenticated user state from verified JWT.
 */
export async function getMe(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthenticated session" });
    }

    const redirectUrl = getRedirectForRole(req.user.role);
    return res.json({
      success: true,
      user: req.user,
      redirectUrl,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * Switch role for testing/demo evaluation.
 * Returns new signed token with requested role and appropriate redirect URL.
 */
export async function switchRole(req, res) {
  try {
    const { targetRole, department } = req.body || {};
    const normalizedRole = (targetRole || "ADMIN").toUpperCase();

    const targetUser = DEMO_USERS.find((u) => u.role === normalizedRole) || {
      userId: `user_${normalizedRole.toLowerCase()}_01`,
      email: `${normalizedRole.toLowerCase()}@medicare.com`,
      name: `${normalizedRole} Demo Session`,
      role: normalizedRole,
      department: department || "General",
      permissions: ["ALL_PERMISSIONS"],
      associatedId: `ID-${normalizedRole}`,
    };

    const token = createToken(targetUser);
    const redirectUrl = getRedirectForRole(targetUser.role);

    return res.json({
      success: true,
      token,
      user: targetUser,
      redirectUrl,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Role switch failed" });
  }
}

/**
 * Returns list of demo users across all 4 roles for instant evaluation.
 */
export function getDemoUsers(req, res) {
  return res.json({
    success: true,
    users: DEMO_USERS.map(({ password, ...u }) => u),
  });
}
