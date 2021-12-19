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

const { removeEventListeners } = require("../ipcHelper.js");

let win


exports.createPFormWindow = function createPFormWindow(parentWindow, content) {


  if (!win) {

    win = new BrowserWindow({
      width: 500,
      height: 700,
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
    win.loadFile(path.join(__dirname, "../views/user/patient_regis.html"));

    win.once("ready-to-show", () => win.show());

    win.on("close", () => {
      if (win) {
        removeEventListeners(ipcMain, ["form-data-finish", "dismiss-form-window", "select-page"]);
        win = null;
      }
    });

    /**
    IPC Messages
    **/
    // close create data window
    ipcMain.on ('dismiss-form-window', () => {

      if(win) win.close();
    });

    ipcMain.on ("form-data-finish", (event, args) => {
      if (win) win.close();
      // reload user
      parentWindow.webContents.send("reload-data", "");
    });
  }
}
