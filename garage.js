const mqtt = require("mqtt");

options = {
  username: "jagan",
  password: "jagan@jagan",
};

const client = mqtt.connect("mqtt://10.10.20.75:1883", options);

/**
 * The state of the garage, defaults to closed
 * Possible states : closed, opening, open, closing
 */

var state = "closed";

client.on("connect", () => {
  client.subscribe("garage/open");
  client.subscribe("garage/close");

  // Inform controllers that garage is connected
  console.log("connecting a new client...\n");
  client.publish("garage/connected", "true");
  sendStateUpdate();
});

function sendStateUpdate() {
  console.log("sending state %s", state);
  client.publish("garage/state", state);
}

client.on("message", (topic, message) => {
  console.log("received message %s %s", topic, message);

  switch (topic) {
    case "garage/open":
      return handleOpenRequest(message);
    case "garage/close":
      return handleCloseRequest(message);
  }
});

function handleOpenRequest(message) {
  if (state !== "open" && state !== "opening") {
    console.log("Opening garage door!");
    state = "opening";
    sendStateUpdate();
  }
  setTimeout(() => {
    state = "closed";
    sendStateUpdate();
  }, 5000);
}

function handleCloseRequest(message) {
  if (state !== "closed" && state !== "closing") {
    state = "closing";
    sendStateUpdate();

    // simulate door closed after 5 seconds (would be listening to hardware)
    setTimeout(() => {
      state = "closed";
      sendStateUpdate();
    }, 5000);
  }
}

/**
 * Want to notify controller that garage is disconnected before shutting down
 */
function handleAppExit(options, err) {
  if (err) {
    console.log(err.stack);
  }

  if (options.cleanup) {
    client.publish("garage/connected", "false");
  }

  if (options.exit) {
    process.exit();
  }
}

/**
 * Handle the different ways an application can shutdown
 */
process.on(
  "exit",
  handleAppExit.bind(null, {
    cleanup: true,
  })
);
process.on(
  "SIGINT",
  handleAppExit.bind(null, {
    exit: true,
  })
);
process.on(
  "uncaughtException",
  handleAppExit.bind(null, {
    exit: true,
  })
);
