const Logger = require("shared/logger");

// Load environment variables
require("shared/environment")([
  "COMMON",
  "HELPER"
]);

// Load database login
process.env.PG_USER = "helper";
process.env.PG_PASSWORD = process.env.PG_HELPER_PASSWORD;