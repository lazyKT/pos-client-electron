/**
# Preload scripts for PaymentSummaryWindow
**/

const {
  ipcRenderer,
  contextBridge
} = require("electron");



const ALLOWED_SEND_CHANNELS = [
  "close-payment-summary-window"
];


const ALLOWED_RECEIVED_CHANNELS = [
  "cart-items"
];


const ALLOWED_INVOKED_CHANNELS = [

];



contextBridge.exposeInMainWorld ("paymentAPI", {
  /**
  ipcRenderer.send
  **/
  send: (channel, data) => {
    if (ALLOWED_SEND_CHANNELS.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
    else throw new Error("Unknown Channel Detected in paymentAPI.send");
  },
  /**
  ipcRenderer.recieve
  **/
  receive: (channel, cb) => {
    if (ALLOWED_RECEIVED_CHANNELS.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => cb(...args));
    }
    else throw new Error ("Unkown IPC Channels detected at chashierAPI.reciee");
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
    else throw new Error("Unknown Channel Detected in paymentAPI.invoke");
  }
})
