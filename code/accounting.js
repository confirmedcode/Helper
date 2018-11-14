const ConfirmedError = require("shared/error");
const Logger = require("shared/logger");

// Models
const { User } = require("shared/models");

const ONE_MEGABYTE_IN_BYTES = 1048576;

module.exports = {
  finish(clientId, sessionId, inputOctets, outputOctets) {
    var id = clientId;
    if (id.startsWith("CN=")) {
      id = id.slice(3);
    }
    // write to database
    return User.updateUserUsageById(id, (inputOctets/ONE_MEGABYTE_IN_BYTES + outputOctets/ONE_MEGABYTE_IN_BYTES))
      .catch( error => {
        Logger.error("Error updating client " + id + " usage: " + error.message + " stack: " + error.stack);
      });
  }
};