const ConfirmedError = require("shared/error");
const Logger = require("shared/logger");

// Middleware
const { query, check } = require("express-validator/check");
const validateCheck = require("../middleware/validate-check.js");

// Models
const { User } = require("shared/models");
const { Certificate } = require("shared/models");

// Constants
const EXPIRED_THROTTLE_KBPS = process.env.EXPIRED_THROTTLE_KBPS;
const OVERAGE_THROTTLE_KBPS = process.env.OVERAGE_THROTTLE_KBPS;
const REVOKED_THROTTLE_KBPS = 50;
const SUPER_OVERAGE_THROTTLE_KBPS = 100;
const THROTTLE_LIMIT_GIGABYTES = process.env.THROTTLE_LIMIT_GIGABYTES;
const THROTTLE_LIMIT_MEGABYTES = 1024 * THROTTLE_LIMIT_GIGABYTES;
const ONE_TERABYTE_IN_MEGABYTES = 1 * 1024 * 1024;

// Routes
const router = require("express").Router();

/*********************************************
 *
 * Bandwidth Check for VPN Throttling
 *
 *********************************************/

router.get("/bandwidth-restriction",
[
  query("client_id"),
  validateCheck
],
(request, response, next) => {  
  const clientId = request.values.client_id;
  return Certificate.checkRevoked(clientId)
  .then( isRevoked => {
    if (isRevoked) {
      response.json({
        "ratelimit_kbps": REVOKED_THROTTLE_KBPS
      });
      throw new ConfirmedError(400, 10, "Revoked certificate: " + clientId);
    }
    return User.hasActiveSubscription(clientId);
  })
  .then( hasActiveSubscription => {
    if (hasActiveSubscription != true) {
      response.json({
        "ratelimit_kbps": EXPIRED_THROTTLE_KBPS
      });
      throw new ConfirmedError(400, 6, "No active subscriptions: " + clientId);
    }
    return User.getMonthlyUsage(clientId);
  })
  .then( usageMegabytes => {
    if (usageMegabytes > ONE_TERABYTE_IN_MEGABYTES) { // protect other users from abusive bandwidth usage
      return response.json({
        "ratelimit_kbps": SUPER_OVERAGE_THROTTLE_KBPS
      });
    }
    else if (usageMegabytes > THROTTLE_LIMIT_MEGABYTES) {
      return response.json({
        "ratelimit_kbps": OVERAGE_THROTTLE_KBPS
      });
    }
    else {
      return response.json({
        "throttle": false
      });
    }
  })
  .catch( error => {
    next(error);
  });
});

module.exports = router;