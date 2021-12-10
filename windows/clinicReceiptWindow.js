/**
 * Clinic Recipt Browser Window
 **/
const path = require('path');
const {
  BrowserWindow,
  ipcMain
} = require ('electron');

const { removeEventListeners } = require('../ipcHelper');


let win


exports.createClinicReciptWindow = function (parentWindow, invoice) {

  if (!win || win === null) {

    win = new BrowserWindow({
      height: 700,
      width: 400,
      parent: parentWindow,
      show: false,
      frame: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload_scripts/clinicReceiptPreload.js')
      }
    });

    win.loadFile(path.join(__dirname, '../views/cashier/clinic_receipt.html'));
    win.openDevTools();

    win.on('ready-to-show', () => {
			win.show();
		});

    win.on('close', () => {
      if (win !== null) {
        removeEventListeners (ipcMain, []);
        removeEventListeners (win.webContents, ["did-finish-load"]);
        win = null;
      }
    });

    win.webContents.on('did-finish-load', () => {
      win.webContents.send("clinic-invoice", invoice);
    });
  }
}
