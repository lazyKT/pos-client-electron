/**
 * Select Page Window
 */

const path = require("path");
const{
    BrowserWindow,
    ipcMain
} = require("electron");
//const { createLoginWindow } = require("./loginWindow.js");

let win, pageName

exports.createPageSelectionWindow = function pageSelectionWindow(parentWindow, from) {
    
    win = new BrowserWindow({
        width: 400,
        height: 230,
        parent: parentWindow,
        modal: true,
        show: false,
        frame: false,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, "../preload_scripts/selectPagePreload.js")
        }
    });

    //redirect to login window after choosing
    pageName = from

    win.loadFile(path.join(__dirname, "../views/selectPage.html"));
    win.openDevTools();

    win.once("ready-to-show", () => win.show());

    win.on("close", () => {
        if(win){
        
        removeListeners(["select-page","dismiss-page-selection-window"]);
        unregisterEmitters();

        win = null
        }
    });

    win.webContents.on("did-finish-load", () => {

        //win.webContents.send("server-addr", AppConfig.serverURL);
        
        //ipc messages
        ipcMain.on("dismiss-page-selection-window", (e, from) => {

            //ipcMain.removeHandler("page-selection-request");

            if (win) win.close();
        });

        // //user choose page
        // ipcMain.on("login", (e, from) => {
        //     console.log(from);
        //     //createLoginWindow(win, from);
       
        // });
    });
}

exports.closePageSelectionWindow = function closePageSelectionWindow() {
    if(win) win.close();
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
          
      }
    }
    catch (error) {
      console.error("Error removing Emitters", error);
    }
  }