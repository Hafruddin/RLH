// utils/clerkShim.js
// Lightweight local shim for @clerk/express to avoid network calls during dev.
// Provides the same API surface (clerkMiddleware, requireAuth, getAuth)
// but simply passes through with a mock userId from headers/query.

/**
 * clerkMiddleware() — attaches req.auth with a userId
 */
export const clerkMiddleware = () => (req, _res, next) => {
  req.auth = req.auth || {
    userId:
      req.headers["x-user-id"] ||
      req.query.userId ||
      "user_patient_demo",
  };
  next();
};

/**
 * requireAuth() — ensures req.auth.userId exists
 */
export const requireAuth = () => (req, res, next) => {
  if (!req.auth?.userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  next();
};

/**
 * getAuth(req) — returns the auth object already set by clerkMiddleware
 */
export const getAuth = (req) => {
  return req.auth || { userId: null };
};
