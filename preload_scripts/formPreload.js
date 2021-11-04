/**
 Preload Script for Form Window
**/

const {
  ipcRenderer,
  contextBridge
} = require("electron");



const ALLOWED_SEND_CHANNELS = [
  "dismiss-form-window",
  "form-data-finish"
];


const ALLOWED_INVOKED_CHANNELS = [
  "create-new-user",
];


contextBridge.exposeInMainWorld ( "formAPI", {
  send: (channel, data) => {
    if (ALLOWED_SEND_CHANNELS.includes(channel)) {

      ipcRenderer.send(channel, data);
    }
    else throw new Error(`Unkown IPC Channel, ${channel} in send`);
  },
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
    else throw new Error(`Unkown IPC Channel, ${channel} in invoke`);
  }
});
