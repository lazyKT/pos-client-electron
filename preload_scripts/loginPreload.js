/**
 Preload script to handle login window
 */
const {
  ipcRenderer,
  contextBridge
} = require("electron");


const ALLOWED_SEND_CHANNELS = [
  "dismiss-login-window",
];


const ALLOWED_INVOKED_CHANNELS = [
  "login-request"
]


contextBridge.exposeInMainWorld ( "loginAPI", {
  send: (channel, data) => {
    if (ALLOWED_SEND_CHANNELS.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
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
