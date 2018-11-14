// Load environment
require("./config/environment.js");

// Shared
const ConfirmedError = require("shared/error");
const Logger = require("shared/logger");

// Constants
const NODE_ENV = process.env.NODE_ENV;

// Express and body parsers
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log unhandled rejections
process.on("unhandledRejection", error => {
  Logger.error(`unhandledRejection:
    ${error.stack}`);
});

// Basic Security
app.use(require("helmet")());

// Controllers
app.use("/", require("./controllers/vpn-controller.js"));

app.get("/error-test", (request, response, next) => {
  next(new ConfirmedError(500, 999, "Test alerts", "Details here"));
});

app.get("/health", function(request, response, next) {
	return response.status(200).json({
		message: "OK from Helper"
	});
});

// Log and Handle Errors
app.use((error, request, response, next) => {
  // =============== LOG ERROR ===============
  const errorString = `${request.originalUrl} - ${request.ip} - ${error.statusCode} - ${error.confirmedCode} - ${error.message} - ${error.stack}`;
  if (error.statusCode >= 400 && error.statusCode < 500) {
    Logger.info(errorString);
  }
  else {
    Logger.error(errorString);
  }
  
  if (response.headersSent) {
    Logger.info("RESPONSE ALREADY SENT");
    return;
  }
  
  // =============== ERROR RESPONSE ===============
  response.status(error.statusCode).json({
    code: error.confirmedCode,
    message: error.message
  });
});

// Handle 404 Not Found
app.use((request, response, next) => {
  Logger.info("404 NOT FOUND - " + request.originalUrl);
  return response.status(404).json({
    code: 404,
    message: "Not Found"
  });
});

module.exports = app;