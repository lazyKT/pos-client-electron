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

    const mainMenuURL = path.join(__dirname, "../views/main.html");
    const userMangementURL = path.join(__dirname, "../views/user/user.html");


    win.loadFile(mainMenuURL);

    win.once("ready-to-show", () => win.show() );

    // upon close the window, set win to null and release the win object
    win.on("close", () => {
      if (win) {
        /**
        # Always clean up the listeners and event emitters
        **/
        removeListeners(["login", "login-user", "user-logout", "create-modal", "user-data", "user-logout", "logout"]);
        unregisterEmitters();
        win = null;
      }
    });


    /**
    # When the window changes the file to load page
    **/
    win.webContents.on("did-navigate", (event, url) => {

      /** if the current page is Main Menu, listen for user login event and remove once done " **/
      if (url.split("://")[1] === mainMenuURL) {

        ipcMain.once("login-user", (e, args) => {
          win.loadFile(userMangementURL);
        });
      }
    });

    /**
      IPC Messages
    */
    ipcMain.on("login", (e, from) => {
      console.log("ipcMain.on('login')");
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
      win.loadFile(mainMenuURL);
    });


    // main process receives ipc message to open create new data modal
    ipcMain.on('create-modal', (e, windowType) => {
      createFormWindow(win, windowType);
    });


    // open edit form
    ipcMain.on("user-data", (event, args) => {
      createEditFormWindow(win, args.method, args._id);
    });


    Menu.setApplicationMenu(applicationMenu);


  }
}


function removeListeners (listeners) {
  try {
    listeners.forEach (
      listener => {
        ipcMain.removeAllListeners([listener]);
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
        win.webContents.removeListener("did-navigate", win.webContents.listeners("did-navigate")[0]);
    }
  }
  catch (error) {
    console.error("Error removing Emitters", error);
  }
}
