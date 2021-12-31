/**
# Booking Details Window where one can view/edit/delete a particular booking
**/

const {
  ipcMain,
  BrowserWindow
} = require('electron');
const path = require('path');

const { removeEventListeners } = require("../ipcHelper.js");


let win


exports.createBookingDetailsWindow = function (parent, bookingId) {
  if (!win || win === null) {

    win = new BrowserWindow({
      width: 600,
      height: 1000,
      show: false,
      parent,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload_scripts/bookingDetailsPreload.js')
      }
    });


    win.loadFile(path.join(__dirname, '../views/bookings/booking_details.html'));
    win.openDevTools();

    win.on('ready-to-show', () => win.show());

    win.on('close', () => {
      removeEventListeners(win.webContents, ['did-finish-load']);
      if (win) win = null;
    });

    win.webContents.on('did-finish-load', () => {
      win.webContents.send('bookingId', bookingId);
    });

  }
}
