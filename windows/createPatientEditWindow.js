/**
 another form window to edit/show patient data
 **/
const path = require("path");
const {
  BrowserWindow,
  ipcMain
} = require("electron");
const {
  updateUser,
  getAllUsers,
} = require("../models/user.js");

const { removeEventListeners } = require("../ipcHelper.js");


let win


exports.createPEditWindow = function createPEditWindow(parentWindow, type, contents) {

  if (!win || win === null) {
    win = new BrowserWindow ({
      width: 550,
      height: 700,
      parent: parentWindow,
      modal: true,
      show: false,
      backgroundColor: '#ffffff',
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(__dirname, "../preload_scripts/editFormPreload.js")
      }
    });


    win.loadFile(path.join(__dirname, "../views/user/editPatient.html"));
    //win.openDevTools();


    win.once("ready-to-show", () => win.show());

    win.on("close", () => {
      if(win) {
        removeEventListeners(ipcMain, ["dismiss-form-window", "from-data-finish","patient-form-finish"]);
        removeEventListeners(win.webContents, ["did-finish-load"]);
        win = null;
      }
    })

    win.webContents.on("did-finish-load", () => {
      win.webContents.send("response-patient-data", {_id: contents, method: type});
    });


    /**
    IPC Messages
    **/

    /* Dimiss Window */
    ipcMain.on("dismiss-form-window", (event, args) => {
      if(win) win.close();
      ipcMain.removeHandler("edit-patient"); // remove existing handler
    })

    /* close form when the renderer process informs that the edit process is finished */
    ipcMain.on("patient-form-finish", (event, args) => {
      if(win) win.close();
      parentWindow.webContents.send("reload-data");
    });
  }

}
