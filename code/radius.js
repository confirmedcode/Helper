const Logger = require("shared/logger");

const dgram = require("dgram");
const radius = require("radius");
const accounting = require("./accounting");

const RADIUS_SECRET = "confirmed9182381283JiJsaiwj1";

const accountingHandlers = {
  "Start": (attributes) => {
  },
  "Interim-Update": (attributes) => {
  },
  "Stop": (attributes) => {
    // console.log("Stop received");
    const clientId = attributes["User-Name"];
    const sessionId = attributes["Acct-Session-Id"];
    const outputOctets = attributes["Acct-Output-Octets"];
    const inputOctets = attributes["Acct-Input-Octets"];
    accounting.finish(clientId, sessionId, inputOctets, outputOctets);
  },
};

const radiusHandlers = {
  "Accounting-Request": (attributes) => {
    const statusType = attributes["Acct-Status-Type"];

    const handler = accountingHandlers[statusType];
    if (handler !== undefined) {
      handler(attributes);
    }
  },
};

const server = dgram.createSocket("udp4");
server.on("message", (msg, rinfo) => {
  const packet = radius.decode({packet: msg, secret: RADIUS_SECRET});
  const response = radius.encode_response({
    packet: packet,
    code: "Accounting-Response",
    secret: RADIUS_SECRET,
  });
  server.send(response, 0, response.length, rinfo.port, rinfo.address, (err) => {
    if (err) {
      Logger.error("ERROR - Error sending response: " + err);
    }
  });

  const handler = radiusHandlers[packet.code];
  if (handler !== undefined) {
    handler(packet.attributes);
  }
});

module.exports = server;