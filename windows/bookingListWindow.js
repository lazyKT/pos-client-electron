/**
 # Booking List Window filtered by doctor and date time
 **/
const path = require('path');
const {
  BrowserWindow,
  ipcMain
} = require('electron');

const { removeEventListeners } = require("../ipcHelper.js");


let win


exports.createBookingListWindow = function (parent, filter) {

  if (!win || win === null) {

    win = new BrowserWindow({
      width: 700,
      height: 600,
      show: false,
      parent: parent,
      modal: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload_scripts/bookingListPreload.js')
      }
    });

    win.loadFile(path.join(__dirname, "../views/bookings/booking_list.html"));
    // win.openDevTools();

    win.on('ready-to-show', () => win.show());

    win.on('close', () => {
      if (win) {
        removeEventListeners(win.webContents, ['did-finish-load']);
        removeEventListeners(ipcMain, ['close-booking-list']);
        win = null;
      }
    })

    win.webContents.on('did-finish-load', () => {
      win.webContents.send('filter', filter);
    });

    ipcMain.on('close-booking-list', () => win.close());
  }
}
