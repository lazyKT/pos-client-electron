const { app, BrowserWindow } = require('electron');

let mainWindow

function createMainWindow() {

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  mainWindow.loadFile('views/main.html');

  mainWindow.webContents.openDevTools();
}


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
  if (process.platform === 'darwin')
    app.quit();
});


// clean up
app.on('close', () => mainWindow=null)
