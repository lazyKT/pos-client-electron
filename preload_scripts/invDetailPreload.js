/**
# Detail Inventory Preload Scripts
**/

const {
    ipcRenderer,
    contextBridge
  } = require("electron");


  const ALLOWED_SEND_CHANNELS = [
    /** write your allowed channels herer */
    "item-details",
    "dismiss-detailed-form-window",
    "item-detail-data"
  ];

  const ALLOWED_INVOKED_CHANNELS = [
    /** write your allowed channels herer */
    "get-all-detail-items"
  ];


  const ALLOWED_RECEIVED_CHANNELS = [
    /** write your allowed channels herer */
    "reload-data",
    "response-item-details-data"
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
    /**
    # Renderer will use this as ipcRenderer.on
    **/
    invoke: async (channel, data) => {
      if (ALLOWED_INVOKED_CHANNELS.includes(channel)) {
        try {
          const response = await ipcRenderer.invoke(channel, data);

          return response;
        }
        catch (error) {
          console.log(error);
        }
      }
      else throw new Error("Unknown IPC Channels Detected in inventoryPreload.invoke");
    }
  });
