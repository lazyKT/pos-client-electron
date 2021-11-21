/**
 Preload script to handle select page window
 */
 const {
    ipcRenderer,
    contextBridge
  } = require("electron");
  
  
  const ALLOWED_SEND_CHANNELS = [
    "dismiss-page-selection-window",
    "page-selection-request",
    "login"
  ]
  
  
  const ALLOWED_RECEIVED_CHANNELS = [
    "server-addr"
  ]
  
  
  const ALLOWED_INVOKED_CHANNELS = [
    "page-selection-request"
  ]
  
  
  contextBridge.exposeInMainWorld ( "selectPageAPI", {
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
        throw new error ("Unknown IPC Channel detected at selectPageAPI.receive");
    },
    invoke: async (channel, data) => {
      try {
        if (ALLOWED_INVOKED_CHANNELS.includes(channel)) {
          const response = await ipcRenderer.invoke (channel, data);
  
          return response;
        }
        else
          throw new Error ("Unauthorized IPC Channel Detected selectPageAPI.invoke");
      }
      catch (error) {
          throw new Error (error);
      }
    }
  })