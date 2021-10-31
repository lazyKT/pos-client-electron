/**
# Payment Summary Window at checkout
**/

const path = require("path");
const {
  BrowserWindow,
  ipcMain
} = require("electron");



let win


exports.createPaymentSummaryWindow = function (parent, args) {

  if (!win) {
    win = new BrowserWindow({
      width: 1000,
      height: 600,
      modal: true,
      parent,
      show: false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(__dirname, "../preload_scripts/paymentSummaryPreload.js")
      }
    });
  }


  win.loadFile(path.join(__dirname, "../views/cashier/payment_summary.html"));
  // win.openDevTools();

  win.once("ready-to-show", () => win.show());

  win.on("close", () => {
    if (win) win = null;
    // reset cashier window
    parent.webContents.send("reset-cashier-window", "");
  });


  win.webContents.on("did-finish-load", () => {

    /**
      IPC Messages
    **/

    ipcMain.on("close-payment-summary-window", () => {
      if (win) win.close();
    });

    win.webContents.send("cart-items", args);

  });

}
