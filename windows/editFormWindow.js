/**
 another form window to edit/show user data
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


let win


exports.createEditFormWindow = function createEditFormWindow(parentWindow, type, contents) {

  if (!win || win === null) {
    win = new BrowserWindow ({
      width: 400,
      height: 500,
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
  }


  win.loadFile(path.join(__dirname, "../views/user/edit_show_user.html"));
  // win.openDevTools();

  win.once("ready-to-show", () => win.show());

  win.on("close", () => { if(win) win = null;})

  win.webContents.on("did-finish-load", () => {

    win.webContents.send("response-user-data", {user: contents, method: type});


    /**
    IPC Messages
    **/

    /* Dimiss Window */
    ipcMain.on("dismiss-form-window", (event, args) => {
      if(win) win.close();
      ipcMain.removeHandler("edit-user"); // remove existing handler
    })


    /* Edit user */
    ipcMain.handle("edit-user", (event, args) => {
      return updateUser(args);
    });

    /* close form when the renderer process informs that the edit process is finished */
    ipcMain.on("form-data-finish", (event, args) => {
      if(win) win.close();
      ipcMain.removeHandler("edit-user"); // remove existing handler
      parentWindow.webContents.send("reload-data", getAllUsers());
    });

  });


}
