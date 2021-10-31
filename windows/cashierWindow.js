const path = require('path');
const {
  BrowserWindow,
  ipcMain
} = require('electron');

const { createMemberCheckoutWindow } = require("./memberCheckoutWindow.js");


let win

exports.createCashierWindow = function createCashierWindow() {

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

  win.on('close', () => win = null);


  win.webContents.on("did-finish-load", () => {

    /**
    IPC Messages
    **/

    // open member checkout window
    ipcMain.on("member-checkout-window", (e, args) => {
      createMemberCheckoutWindow(win);
    });

  });

}


exports.closeCashierWindow = function closeCashierWindow() {
  if (win) {
    win.close();
  }
}
