const path = require('path');
const { BrowserWindow } = require('electron');


let win

exports.createCashierWindow = function createCashierWindow() {

  win = new BrowserWindow({
    width: 800,
    height: 1200,
    show: false,
    fullscreen: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "../preload_scripts/cashierPreload.js")
    }
  });

  win.loadFile(path.join(__dirname, "../views/cashier/cashier.html"));

  // win.openDevTools();

  win.once('ready-to-show', () => {
    win.show();
  });

  win.on('close', () => win = null);

}


exports.closeCashierWindow = function closeCashierWindow() {
  if (win) {
    win.close();
  }
}
