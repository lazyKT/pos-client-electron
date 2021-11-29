/**
 Form Window
 */

const path = require("path");
const {
  BrowserWindow,
  ipcMain
} = require("electron");
const {
  createNewUser,
  getAllUsers,
} = require("../models/user.js");
const AppConfig = require("../config");

let win


exports.createFormWindow = function createFormWindow(parentWindow, content) {


  if (!win) {

    win = new BrowserWindow({
      width: 500,
      height: 600,
      parent: parentWindow,
      modal: true,
      show: false,
      backgroundColor: '#ffffff',
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(__dirname, "../preload_scripts/formPreload.js")
      }
    });

    win.setBackgroundColor('#FFFFFF');
    win.loadFile(path.join(__dirname, "../views/user/user_regis.html"));

    win.once("ready-to-show", () => win.show());

    win.on("close", () => {
      if (win) {
        removeListeners(["form-data-finish", "dismiss-form-window", "select-page"]);
        unregisterEmitters();
        win = null;
      }
    });


    win.webContents.on("did-finish-load", () => {

      /**
      IPC Messages
      **/
      win.webContents.send("app-config", AppConfig.serverURL);

      // close create data window
      ipcMain.on ('dismiss-form-window', () => {

        if(win) win.close();
      });

      ipcMain.on ("form-data-finish", (event, args) => {
        if (win) win.close();
        // reload user
        parentWindow.webContents.send("reload-data", "");
      });

    });
  }

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
