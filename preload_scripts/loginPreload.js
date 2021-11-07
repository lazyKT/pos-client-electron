/**
 Preload script to handle login window
 */
const {
  ipcRenderer,
  contextBridge
} = require("electron");


const ALLOWED_SEND_CHANNELS = [
  "dismiss-login-window",
  "login-request"
];


const ALLOWED_RECEIVED_CHANNELS = [
  "server-addr"
]


const ALLOWED_INVOKED_CHANNELS = [
  "login-request"
]


contextBridge.exposeInMainWorld ( "loginAPI", {
  send: (channel, data) => {
    console.log(channel, data);
    if (ALLOWED_SEND_CHANNELS.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, callback) => {
    if (ALLOWED_RECEIVED_CHANNELS.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
    else
      throw new error ("Unknown IPC Channel detected at loginAPI.receive");
  },
  invoke: async (channel, data) => {
    try {
      if (ALLOWED_INVOKED_CHANNELS.includes(channel)) {
        const response = await ipcRenderer.invoke (channel, data);

        return response;
      }
      else
        throw new Error ("Unauthorized IPC Channel Detected. Contact Application Admin!");
    }
    catch (error) {
        throw new Error (error);
    }
  }
})
