/* preload scripts for main browser window */
const {
  ipcRenderer,
  contextBridge,
  dialog
} = require('electron');


const ALLOWED_SEND_CHANNELS = [
  'toMain',
  'login',
  'logout',
  'create-modal',
  'user-data',
  'item-data',
  'form-data-finish',
  'export-csv'
];

const ALLOWED_RECEIVED_CHANNELS = [
  'fromMain',
  'redirect-page',
  'reload-data',
];

const ALLOWED_INVOKED_CHANNELS = [
  'get-all-users',
  'search-data',
  'get-all-items'
];

/*
 expose some of the functionalities from main process using ContextBridge.
 This approach emphasizes safety and security by limiting renderer processing to access required functions only.
 */
contextBridge.exposeInMainWorld(
  "api", {
    send: (channel, data) => {

      /*
        if the channel name used is listed in allowed received channels, send to Main Process
        otherwise, no action
        */
      if (ALLOWED_SEND_CHANNELS.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel, cb) => {

      /*
        if the channel name received is listed in allowed received channels, execute callback
        otherwise, no action
        */
      if (ALLOWED_RECEIVED_CHANNELS.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => cb(...args));
      }
    },
    invoke: async (channel, data) => {
      try {
        if (ALLOWED_INVOKED_CHANNELS.includes(channel)) {
          // console.log('channel', channel);
          // console.log('data', data);
          const response = await ipcRenderer.invoke(channel, data);

          return response;
        }
      }
      catch (error) {
        console.log(`Error invoking @ channel: ${channel}`, error);
      }
    },
    showNotification: ({type, data, method}) => {
      // console.log('show notification', type, data, method);
      if (type === 'user') {
        if (method === 'CREATE') {
          const NOTIFICATION_TITLE = 'New User Created';
          const NOTIFICATION_BODY = `New User, username : ${data.username}.`

          new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY});
        }
        else if (method === 'UPDATE') {
          const NOTIFICATION_TITLE = 'User Successfully Updated';
          const NOTIFICATION_BODY = `Updated User, username : ${data.username}.`

          new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY});
        }
      }

      else if(type === 'item') {
        if (method === 'CREATE') {
          const NOTIFICATION_TITLE = 'New Item Created';
          const NOTIFICATION_BODY = `New Item, Description : ${data.description}.`

          new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY});
        }
        else if (method === 'UPDATE') {
          const NOTIFICATION_TITLE = 'Item Successfully Updated';
          const NOTIFICATION_BODY = `Updated Item, Description : ${data.description}.`

          new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY});
        }
      }
    }
  }
);
