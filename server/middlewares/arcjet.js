import arcjet, { detectBot, shield, tokenBucket, validateEmail } from "@arcjet/node";

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = typeof forwarded === "string" ? forwarded.split(",")[0].trim() : req.socket?.remoteAddress;
  return ip || "127.0.0.1";
};

const aj = arcjet({
  key: process.env.ARCJET_KEY || "",
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({ mode: "LIVE", allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:MONITOR"] }),
    tokenBucket({
      mode: "LIVE",
      interval: 10,
      refillRate: 5,
      capacity: 20,
      key: (req) => `rate-limit:${getClientIp(req)}`,
    }),
  ],
});

export const arcjetMiddleware = async (req, res, next) => {
  if (!process.env.ARCJET_KEY) {
    return next();
  }

  try {
    const decision = await aj.protect(req, { requested: 1, user: req.user?.id || undefined });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ success: false, message: "Too many requests. Please try again shortly." });
      }

      if (decision.reason.isBot()) {
        return res.status(403).json({ success: false, message: "Bot activity detected." });
      }

      return res.status(403).json({ success: false, message: "Request blocked by security policy." });
    }

    if (decision.ip?.isHosting()) {
      return res.status(403).json({ success: false, message: "Forbidden IP address." });
    }

    return next();
  } catch (error) {
    console.error("Arcjet middleware error:", error);
    return next();
  }
};

export const emailValidationRule = (email) =>
  validateEmail({
    mode: "LIVE",
    email,
  });

export default arcjet;
