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

let win


exports.createFormWindow = function createFormWindow(parentWindow, content) {

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
  win.loadFile(path.join(__dirname, "../views/user/user_regis.html"));
  win.openDevTools();


  win.once("ready-to-show", () => win.show());

  win.on("close", () => win = null);


  win.webContents.on("did-finish-load", () => {

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

  })

}


exports.closeFormWindow = function closeFormWindow() {
  if (win) win.close();
}
