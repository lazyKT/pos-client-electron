/**
  Preload Scripts for member checkout actions
**/

const {
  ipcRenderer,
  contextBridge
} = require("electron");



const ALLOWED_SEND_CHANNELS  = [

];


const ALLOWED_RECEIVED_CHANNELS = [

];


const ALLOWED_INVOKED_CHANNELS = [

];



contextBridge.exposeInMainWorld ( "memberCheckoutAPI", {
  /**
  ipcRenderer.send
  **/
  send: (channel, date) => {
    if (ALLOWED_SEND_CHANNELS.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
    else throw new Error("Unknown Channel Detected in memberCheckoutAPI.send");
  },
  /**
  ipcRenderer.recieve
  **/
  receive: (channel, callback) => {
    if (ALLOWED_RECEIVED_CHANNELS.includes(channel)) {
      ipcRenderer.on( (channel, ...args) => callback(...args));
    }
    else throw new Error("Unknown Channel Detected in memberCheckoutAPI.receive");
  },
  /**
  ipcRenderer.invoke
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
    else throw new Error("Unknown Channel Detected in memberCheckoutAPI.invoke");
  }
});
