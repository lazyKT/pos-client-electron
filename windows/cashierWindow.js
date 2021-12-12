const path = require('path');
const {
  BrowserWindow,
  ipcMain
} = require('electron');

const { createReceiptWindow } = require("./receiptWindow");
const { removeEventListeners } = require("../ipcHelper.js");

let win

exports.createCashierWindow = function createCashierWindow(name, id) {

  if (!win) {
    win = new BrowserWindow({
      width: 1200,
      height: 1000,
      show: false,
      fullscreen: true,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: true,
        preload: path.join(__dirname, "../preload_scripts/cashierPreload.js")
      }
    });

    win.loadFile(path.join(__dirname, "../views/cashier/cashier.html"));

    //win.openDevTools();

    win.once('ready-to-show', () => {
      win.maximize();
      win.show();
    });

    win.on('close', () => {
      if (win) {
        removeEventListeners(ipcMain, ["cashier-close", "show-receipt"]);
        removeEventListeners(win.webContents, ["dom-ready"]);
        win = null;
      }
    });


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
