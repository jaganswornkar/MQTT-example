const mqtt = require("mqtt");

options = {
  username: "jagan",
  password: "jagan@jagan",
};
var userId = 0;
const client = mqtt.connect("mqtt://10.10.20.75:1883", options);

client.on("connect", () => {
  console.log("new client connected!");
  client.publish('garage/connected',"new Client!")
});


setTimeout(()=>{process.exit(1);},5000)
client.on("message", function (topic, message, packet) {
  console.log(topic,message)
});
 