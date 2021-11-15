const path = require('path');
const {
  BrowserWindow,
  ipcMain
} = require('electron');

const AppConfig = require("../config");



let win

exports.createCashierWindow = function createCashierWindow() {

  if (!win) {
    win = new BrowserWindow({
      width: 1200,
      height: 1000,
      show: false,
      // fullscreen: true,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: true,
        preload: path.join(__dirname, "../preload_scripts/cashierPreload.js")
      }
    });

    win.loadFile(path.join(__dirname, "../views/cashier/cashier.html"));

    win.openDevTools();

    win.once('ready-to-show', () => {
      win.show();
    });

    win.on('close', () => {
      if (win) {
        removeEventListeners(["cashier-close"]);
        removeEmitters();
        win = null;
      }
    });


    win.webContents.on("did-finish-load", () => {
      /** send serverURL to cashier render process */
      win.webContents.send("ip-address", AppConfig.serverURL);
    });

    /**
    IPC Messages
    **/
    ipcMain.on("cashier-close", () => {
      if (win) win.close();
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
    console.error("Error Removing Event Listeners From CashierWindow\n", error);
  }
}


function removeEmitters () {
  try {
    if (win) {
      win.webContents.removeListener("did-finish-load", win.webContents.listeners("did-finish-load")[0]);
    }
  }
  catch (error) {
    console.error("Error Removing Event Emitters From CashierWindow\n", error);
  }
}
