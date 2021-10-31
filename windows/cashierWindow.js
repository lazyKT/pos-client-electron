const path = require('path');
const {
  BrowserWindow,
  ipcMain
} = require('electron');

const { createMemberCheckoutWindow } = require("./memberCheckoutWindow.js");
const { createPaymentSummaryWindow } = require("./PaymentSummaryWindow.js");


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
    ipcMain.on("cashier-close", () => {
      if (win) win.close();
    })

    // open member checkout window
    ipcMain.on("member-checkout-window", (event, args) => {
      createMemberCheckoutWindow(win);
    });

    // open payment summary window
    ipcMain.on("open-payment-summary", (event, args) => {
      createPaymentSummaryWindow(win, args);
    });

  });

}


exports.closeCashierWindow = function closeCashierWindow() {
  if (win) {
    win.close();
  }
}
