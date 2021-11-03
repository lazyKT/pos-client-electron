const {
  app,
  BrowserWindow
} = require('electron');
const path = require('path');

const { createMainWindow } = require("./windows/mainWindow.js");
const { createCashierWindow } = require("./windows/cashierWindow.js");


app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    // if app is already open, do not start the new instance
    if (BrowserWindow.getAllWindows().length === 0)
      createMainWindow();
  });
});


app.on('all-window-closed', () => {
  // if all the app's windows are closed, quit the app
  if (process.platform !== 'darwin')
    app.quit();
});
