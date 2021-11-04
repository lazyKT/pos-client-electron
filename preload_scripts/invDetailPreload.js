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
<<<<<<< HEAD
    "dismiss-detailed-form-window",
    "item-detail-data"
=======
    "dismiss-form-window",
    "item-detail-data",
    "get-all-detail-items",
    "item-details-edit"
>>>>>>> 7cb88df272b4ef24e8c0c6c5ec9a09820c2720e9
  ];

  const ALLOWED_INVOKED_CHANNELS = [
    /** write your allowed channels herer */
    "get-all-detail-items",
    "item-details-edit"
  ];


  const ALLOWED_RECEIVED_CHANNELS = [
    /** write your allowed channels herer */
    "reload-data",
    "response-item-detail-data",
    "response-subItem-detail-data"
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
      if (ALLOWED_RECEIVED_CHANNELS.includes(channel)) {
        console.log("receive 123123");
        ipcRenderer.on(channel, (event, ...args) => callback(...args));
      }
      else throw new Error("Unknown IPC Channels Detected in inventoryDetailPreload.recieve");
    },
    /**
    # Renderer will use this as ipcRenderer.on
    **/
    invoke: async (channel, data) => {
      if (ALLOWED_INVOKED_CHANNELS.includes(channel)) {
        try {
          const response = await ipcRenderer.invoke(channel, data);
<<<<<<< HEAD

=======
          console.log("invoke 123123");
>>>>>>> 7cb88df272b4ef24e8c0c6c5ec9a09820c2720e9
          return response;
        }
        catch (error) {
          console.log(error);
        }
      }
      else throw new Error("Unknown IPC Channels Detected in inventoryDetailPreload.invoke");
    }
  });
