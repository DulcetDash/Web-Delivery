const io = require("socket.io-client");

//...
console.log(process.env);
const socket = io(process.env.REACT_APP_URL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 100,
  reconnectionDelayMax: 200,
});

export default socket;
