const { io } = require("socket.io-client");

//...
// const socket = io(process.env.REACT_APP_URL, {
//   transports: ["websocket", "polling"],
//   withCredentials: true,
//   reconnection: true,
//   reconnectionAttempts: Infinity,
//   reconnectionDelay: 100,
//   reconnectionDelayMax: 200,
// });
const socket = io();

export default socket;
