const path = require("path");
const {
  ipcRenderer,
  contextBridge
} = require ("electron");


const ALLOWED_RECEIVE_CHANNELS = [
  "preview-data"
];

const ALLOWED_SEND_CHANNELS = [
  "export-data"
]



contextBridge.exposeInMainWorld("previewAPI", {
  receive: (channel, callback) => {
    if (ALLOWED_RECEIVE_CHANNELS.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
    else
      throw new Error ("Unknown IPC Channel at previewAPI.recieve");
  },
  send: (channel, data) => {
    if (ALLOWED_SEND_CHANNELS.includes(channel)) {
      ipcRenderer.send("export-data", data);
    }
    else
      throw new Error ("Unknown IPC Channel at previewAPI.send");
  }
})
