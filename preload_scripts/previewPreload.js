const path = require("path");
const {
  ipcRenderer,
  contextBridge
} = require ("electron");


const ALLOWED_RECEIVE_CHANNELS = [
  "preview-data"
];

const ALLOWED_SEND_CHANNELS = [
  "export-data-after-preview"
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
      console.log(channel);
      ipcRenderer.send(channel, data);
    }
    else
      throw new Error ("Unknown IPC Channel at previewAPI.send");
  },
  removeListeners: () => {
    try {
      ALLOWED_RECEIVE_CHANNELS.forEach(
        channel => {
          const func = ipcRenderer.listeners(channel)[0];
          if (func)
            ipcRenderer.removeListener(channel, func);
        }
      )
    }
    catch (error) {
      console.error("Error Remove Event Listeners at previewAPI.");
    }
  }
})
