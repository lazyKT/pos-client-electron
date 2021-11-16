/**
  application main window
 */
const path = require('path');
const {
  BrowserWindow,
  ipcMain,
  dialog,
  Menu,
  session
} = require('electron');

const { createLoginWindow } = require("./loginWindow.js");
const { createFormWindow } = require("./formWindow.js");
const { createEditFormWindow } = require("./editFormWindow.js");

const applicationMenu = Menu.buildFromTemplate(require('../applicationMenu.js'));
const AppConfig = require("../config");

let win


exports.createMainWindow = function createMainWindow () {

  if (!win) {
    win = new BrowserWindow({
      width: 1020,
      height: 850,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true, // protect against prototype pollution
        preload: path.join(__dirname, "../preload_scripts/mainPreload.js") // use a preload scrip
      }
    });


    win.loadFile(path.join(__dirname, "../views/main.html"));
    win.openDevTools();

    win.once("ready-to-show", () => win.show() );

    // upon close the window, set win to null and release the win object
    win.on("close", () => {
      if (win) {
        /**
        # Always clean up the listeners and event emitters
        **/
        removeListeners(["user-logout", "create-modal", "user-data", "user-logout", "logout"]);
        unregisterEmitters();
        win = null;
      }
    });


    win.webContents.on("did-finish-load", () => {

      /**
        IPC Messages
      */
      ipcMain.on("login", (e, from) => {

       createLoginWindow(win, from);
      });


      // logout request from Renderer
      ipcMain.on('logout', (e, response) => {
        e.sender.send('logout-response', 200);
      });

      /**
      ##### USER IPC CHANNELS #####
      **/

      ipcMain.on('user-logout', (e, response) => {
        win.loadFile(path.join(__dirname, "../views/main.html"));
      });


      // main process receives ipc message to open create new data modal
      ipcMain.on('create-modal', (e, windowType) => {
        createFormWindow(win, windowType);
      });


      // open edit form
      ipcMain.on("user-data", (event, args) => {
        createEditFormWindow(win, args.method, args._id);
      });

    });


    Menu.setApplicationMenu(applicationMenu);


  }
}


function setDefaultCookies () {
  const defaultCookies = { url: "app-config", server: "http://127.0.0.1:8080" };

  session.defaultSession.cookies.set(defaultCookies)
    .then(() => {
      console.log("Default Cookies Storage Success!");
    })
    .catch (err => {
      console.error("Error Setting Default Cookies. [MainWindow].\n",err);
    });
}


function getDefaultCookies () {
  session.defaultSession.cookies.get({url: "app-config"})
    .then((cookies) => {
      console.log("Cookies", cookies);
    })
    .catch(err => {
      console.error("Error Getting Default Cookies", err);
    });
}


function removeListeners (listeners) {
  try {
    listeners.forEach (
      listener => {
        const func = ipcMain.listeners(listener)[0];
        if (func) {
          ipcMain.removeListener(listener, func);
        }
      }
    );
  }
  catch (error) {
    console.error("Error removing listeners from ItemEditWindow", error);
  }
}


function unregisterEmitters () {
  try {
    if (win) {
        win.webContents.removeListener("did-finish-load", win.webContents.listeners("did-finish-load")[0]);
        ipcMain.removeHandler("request-ip");
    }
  }
  catch (error) {
    console.error("Error removing Emitters", error);
  }
}
