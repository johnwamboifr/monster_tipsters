import jwt from "jsonwebtoken";
import db from "../models/index.js";
import { canAccessPlan, normalizePlanName } from "../utils/planEntitlements.js";

const { Users } = db;

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["x-auth-token"] || req.headers.authorization;
  console.log("Access denied", authHeader)

  if (!authHeader) {
    return res.status(403).json({
      success: false,
      message: "Access denied. You must be authenticated.",
    });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7, authHeader.length)
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "sangkiplaimportantkey");
    const user = await Users.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token - user not found",
      });
    }

    req.user = {
      id: user.id,
      userType: user.userType,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
    };
    next();
  } catch (error) {
    let message = "Invalid token";

    if (error instanceof jwt.TokenExpiredError) {
      message = "Token expired";
    } else if (error instanceof jwt.JsonWebTokenError) {
      message = "Malformed token";
    }

    return res.status(401).json({
      success: false,
      message: `${message}. Please log in again.`,
    });
  }
};

export const verifyTokenAndAuthorization = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      await verifyToken(req, res, () => {});

      if (!req.user) {
        return res.status(403).json({
          success: false,
          message: "Access denied. No user provided.",
        });
      }

      if (allowedRoles.length === 0) {
        return next();
      }

      if (!allowedRoles.includes(req.user.userType)) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient privileges.",
          requiredRoles: allowedRoles,
          yourRole: req.user.userType,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
};

const roleCheck = (requiredRole) => verifyTokenAndAuthorization([requiredRole]);

export const isAdmin = roleCheck("admin");
export const isUser = roleCheck("client");
export const isVip = roleCheck("vip");

export const requirePlanAccess = (requiredPlan) => {
  return async (req, res, next) => {
    try {
      await verifyToken(req, res, () => {});

      if (!req.user) {
        return res.status(403).json({ success: false, message: "Access denied. No user provided." });
      }

      const userType = String(req.user.userType || "client").toLowerCase();
      const userPlan = userType === "admin" ? "GOLD" : userType === "vip" ? "GOLD" : userType === "premium" ? "SILVER" : "FREE";
      const normalizedRequired = normalizePlanName(requiredPlan || "FREE");

      if (!canAccessPlan(userPlan, normalizedRequired)) {
        return res.status(403).json({
          success: false,
          message: `This premium content requires ${normalizedRequired} access.`,
          requiredPlan: normalizedRequired,
          currentPlan: userPlan,
        });
      }

      return next();
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
};

export default {
  verifyToken,
  verifyTokenAndAuthorization,
  isAdmin,
  isUser,
  isVip,
  requirePlanAccess,
};
