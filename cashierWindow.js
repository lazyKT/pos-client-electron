const path = require('path');
const { BrowserWindow } = require('electron');


let win

exports.createCashierWindow = function createCashierWindow() {

  win = new BrowserWindow({
    width: 800,
    height: 1200,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload_scripts/cashierPreload.js')
    }
  });

  win.loadFile('views/cashier/cashier.html');

  win.openDevTools();

  win.once('ready-to-show', () => {
    win.show();
  });

  win.on('close', () => console.log('cashier closed'));

}


exports.closeCashierWindow = function closeCashierWindow() {
  if (win) {
    win.close();
    win = null;
  }
}
