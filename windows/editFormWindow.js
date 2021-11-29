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


    win.loadFile(path.join(__dirname, "../views/user/edit_show_user.html"));


    win.once("ready-to-show", () => win.show());

    win.on("close", () => {
      if(win) {
        removeEventListeners(["dismiss-form-window", "from-data-finish"]);
        removeEventEmitters(["did-finish-load"]);
        win = null;
      }
    })

    win.webContents.on("did-finish-load", () => {

      win.webContents.send("response-user-data", {_id: contents, method: type});

      /**
      IPC Messages
      **/

      /* Dimiss Window */
      ipcMain.on("dismiss-form-window", (event, args) => {
        if(win) win.close();
        ipcMain.removeHandler("edit-user"); // remove existing handler
      })

      /* close form when the renderer process informs that the edit process is finished */
      ipcMain.on("form-data-finish", (event, args) => {
        if(win) win.close();
        parentWindow.webContents.send("reload-data");
      });

    });

  }

}


function removeEventListeners (listeners) {
  try {
    listeners.forEach(
      listener => {
        const func = ipcMain.listeners(listener)[0];
        if (func)
          ipcMain.removeListener(listener, func);
      }
    )
  }
  catch (error) {
    console.error("Erorr Removing Event Listeners from editFormWindow.\n", error);
  }
}


function removeEventEmitters (emitters) {
  try {
    emitters.forEach(
      emitter => {
        if (win) {
          const func = win.webContents.listeners(emitter)[0];
          if (func)
            win.webContents.removeListener(emitter, func);
        }
      }
    )
  }
  catch (error) {
    console.error("Erorr Removing Event Emitters from editFormWindow.\n", error);
  }
}
