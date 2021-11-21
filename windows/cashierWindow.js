const path = require('path');
const {
  BrowserWindow,
  ipcMain
} = require('electron');

const { createReceiptWindow } = require("./receiptWindow");


let win

exports.createCashierWindow = function createCashierWindow(name, id) {

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
        removeEventListeners(["cashier-close", "show-receipt"]);
        removeEmitters(["dom-ready"]);
        win = null;
      }
    });

    // win.webContents.once("did-finish-load", () => {
    //   console.log("did-finish-load");
    // });
    //
    win.webContents.once("dom-ready", () => {
      win.webContents.send("user-details", {name, id});
    });

    /**
    IPC Messages
    **/
    ipcMain.on("cashier-close", () => {
      if (win) win.close();
    });

    ipcMain.on("show-receipt", (e, data) => {
      createReceiptWindow(win, data);
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


function removeEmitters (emitters) {
  try {
    if (win) {
      emitters.forEach(
        emitter => {
          const func = win.webContents.listeners(emitter)[0];
          if (func)
            win.webContents.removeListener(emitter, func);
        }
      )
    }
  }
  catch (error) {
    console.error("Error Removing Event Emitters From CashierWindow\n", error);
  }
}
