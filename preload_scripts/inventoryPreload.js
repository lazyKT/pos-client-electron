/**
# Inventory Preload Scripts
**/

const {
  ipcRenderer,
  contextBridge
} = require("electron");


const ALLOWED_SEND_CHANNELS = [
  /** write your allowed channels herer */
  "logout",
  "item-data",
  "item-details",
  "open-export-options"
];


const ALLOWED_RECEIVED_CHANNELS = [
  /** write your allowed channels herer */
  "reload-data"
];



contextBridge.exposeInMainWorld ("inventoryAPI", {
  /**
  # Renderer will use this as ipcRenderer.send
  **/
  send: (channel, data) => {
    /*
      if the channel name sent is listed in allowed received channels, execute callback
      otherwise, throw an error
      */
    if (ALLOWED_SEND_CHANNELS.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
    else throw new Error("Unknown IPC Channels Detected in inventoryPreload.send");
  },
  /**
  # Renderer will use this as ipcRenderer.on
  **/
  receive: (channel, callback) => {
    /*
      if the channel name received is listed in allowed received channels, execute callback
      otherwise, throw an error
      */
    if (ALLOWED_RECEIVED_CHANNELS.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
    else throw new Error("Unknown IPC Channels Detected in inventoryPreload.recieve");
  },
  removeListeners: () => {
    // ipcRenderer.send("clean-up", "clean up");
    try {
      ALLOWED_RECEIVED_CHANNELS.forEach(
        channel => {
          const func = ipcRenderer.listeners(channel)[0];
          if (func) {
            console.log(`Removed listener from ${channel}`);
            ipcRenderer.removeListener(channel, func);
            // ipcRenderer.send("clean-up", channel);
          }
        }
      )
    }
    catch (error) {
      // ipcRenderer.send("clean-up", error);
      console.error("Error Removing Event Listeners from inventoryAPI\n", error);
    }
  }
});
