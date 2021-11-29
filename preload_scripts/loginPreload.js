// /**
//  Preload script to handle login window
//  */
// const {
//   ipcRenderer,
//   contextBridge
// } = require("electron");
//
//
// const ALLOWED_SEND_CHANNELS = [
//   "dismiss-login-window",
//   "login-request"
// ];
//
//
// const ALLOWED_RECEIVED_CHANNELS = [
//   "server-addr",
//   "access-denied"
// ]
//
//
// contextBridge.exposeInMainWorld ( "loginAPI", {
//   send: (channel, data) => {
//     console.log(channel, data);
//     if (ALLOWED_SEND_CHANNELS.includes(channel)) {
//       ipcRenderer.send(channel, data);
//     }
//   },
//   receive: (channel, callback) => {
//     if (ALLOWED_RECEIVED_CHANNELS.includes(channel)) {
//       ipcRenderer.on(channel, (event, ...args) => callback(...args));
//     }
//     else
//       throw new error ("Unknown IPC Channel detected at loginAPI.receive");
//   },
//   removeListeners: () => {
//     try {
//       ALLOWED_RECEIVED_CHANNELS.forEach (
//         channel => {
//           const func = ipcRenderer.listeners(channel)[0];
//           console.log(channel, func);
//           if (func) {
//             ipcRenderer.removeListener(channel, func);
//             console.log(`${channel} removed from loginAPI`);
//           }
//         }
//       )
//     }
//     catch (error) {
//       console.error("Error Removing Event Listeners from loginAPI\n", error);
//     }
//   }
// })
