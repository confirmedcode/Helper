"use strict";

const app = require("./app.js");
const Logger = require("shared/logger");

app.listen(3000, function() {
  Logger.info("Node - Listening on port 3000");
});

const radius = require("./radius.js");
radius.on("listening", function () {
  Logger.info("Radius - Listening on port " + radius.address().port);
});
radius.bind(1813);