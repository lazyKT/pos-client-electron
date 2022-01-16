/* preload scripts for bookings window */
const {
    ipcRenderer,
    contextBridge,
    dialog
  } = require('electron');


  const ALLOWED_SEND_CHANNELS = [
    'logout',
    'open-booking-details',
    'open-booking-list'
  ];

  const ALLOWED_RECEIVED_CHANNELS = [
    'redirect-page'
  ];

  /*
   expose some of the functionalities from main process using ContextBridge.
   This approach emphasizes safety and security by limiting renderer processing to access required functions only.
   */
  contextBridge.exposeInMainWorld("bookingsAPI", {
      send: (channel, data) => {
        /*
          if the channel name used is listed in allowed received channels, send to Main Process
          otherwise, no action
          */
        if (ALLOWED_SEND_CHANNELS.includes(channel)) {
          console.log(channel);
          ipcRenderer.send(channel, data);
        }
        else
          throw new Error (`Unknown IPC Channel, '${channel}' received at bookingsAPI.send`);
      },
      receive: (channel, cb) => {
        /*
          if the channel name received is listed in allowed received channels, execute callback
          otherwise, no action
          */
        if (ALLOWED_RECEIVED_CHANNELS.includes(channel)) {
          ipcRenderer.on(channel, (event, ...args) => cb(...args) );
        }
        else
          throw new Error (`Unknown IPC Channel, '${channel}' received at bookingsAPI.receive`);
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
        catch(error) {
          console.error("Error Removing Event Listeners from bookingsAPI\n", error);
        }
      }
    }
  );
