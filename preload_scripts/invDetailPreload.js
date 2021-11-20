/**
# Detail Inventory Preload Scripts
**/

const {
    ipcRenderer,
    contextBridge
  } = require("electron");


  const ALLOWED_SEND_CHANNELS = [
    /** write your allowed channels here */
    "dismiss-form-window",
  ];


  const ALLOWED_RECEIVED_CHANNELS = [
    /** write your allowed channels here */
    "reload-data"
  ];



  contextBridge.exposeInMainWorld ("detailInventoryAPI", {
    /**
    # Renderer will use this as ipcRenderer.send
    **/
    send: (channel, data) => {
      /*
        if the channel name sent is listed in allowed received channels, execute callback
        otherwise, throw an error
        */
      console.log("cahnnel", channel);
      if (ALLOWED_SEND_CHANNELS.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
      else throw new Error("Unknown IPC Channels Detected in inventoryDetailPreload.send");
    },
    /**
    # Renderer will use this as ipcRenderer.on
    **/
    receive: (channel, callback) => {
      /*
        if the channel name received is listed in allowed received channels, execute callback
        otherwise, throw an error
        */
      console.log(channel);
      if (ALLOWED_RECEIVED_CHANNELS.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => callback(...args));
      }
      else throw new Error("Unknown IPC Channels Detected in inventoryDetailPreload.recieve");
    },
    removeListeners: () => {
      try {
        ALLOWED_RECEIVED_CHANNELS.forEach(
          channel => {
            const func = ipcRenderer.listeners(channel)[0];
            if (func)
              ipcRenderer.removeListener(channel, func);
          }
        )
      }
      catch (error) {
        console.error("Error Remove Event Listeners at detailInventoryAPI");
      }
    }
  });
