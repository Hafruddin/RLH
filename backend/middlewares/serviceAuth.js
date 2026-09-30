// backend/middlewares/serviceAuth.js
// Service-to-service authentication for n8n, ElevenLabs, and other trusted callers.
// Header: x-mnx-service-key
// Value must match MNX_SERVICE_KEY env variable (set in your deployment provider secrets).

const SERVICE_KEY = process.env.MNX_SERVICE_KEY;

/**
 * requireServiceKey — middleware that validates x-mnx-service-key header.
 * Returns 401 if missing or invalid.
 * Safe to apply on any n8n-callable route.
 */
export function requireServiceKey(req, res, next) {
  // Skip enforcement if MNX_SERVICE_KEY is not configured (dev/local fallback)
  if (!SERVICE_KEY) {
    console.warn("[serviceAuth] MNX_SERVICE_KEY not set — skipping service auth (dev mode)");
    return next();
  }

  const provided = req.headers["x-mnx-service-key"] || "";

  if (!provided || provided !== SERVICE_KEY) {
    return res.status(401).json({
      success: false,
      errorCode: "INVALID_SERVICE_KEY",
      message: "Service authentication failed. Provide a valid x-mnx-service-key header.",
    });
  }

  next();
}
