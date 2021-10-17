const { app, BrowserWindow, ipcMain } = require('electron');

let mainWindow
console.log('Testing Git');

function createMainWindow() {

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  const loginModal = new BrowserWindow({
    width: 400,
    height: 500,
    parent: mainWindow,
    modal: true,
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  // mainWindow.loadFile('views/register/register.html');
  mainWindow.loadFile('views/main.html')
  loginModal.loadFile('views/login.html');

  mainWindow.webContents.on('did-finish-load', () => {
    // listen for ipc message from renderer process
    ipcMain.on('login', (e, arg) => {
      console.log('Open Login Modal!');
      loginModal.show();
    });


    ipcMain.on('dismiss-login-modal', () => {
      console.log('dismiss login modal');
      loginModal.hide();
    });


    // renderer process requesting login to register new user
    ipcMain.on('register-login-request', (e, args) => {
      console.log(args);
      const { username, password } = args;
      let response
      if (username === 'admin' && password === 'admin') {
        response = {status: 200, data: {username}}
        loginModal.hide();
        redirectToNewPage('register');
      }
      else {
        response = {status: 401, message: 'Incorrect username or password!'};
      }
      e.sender.send('register-login-response', response);
    });

    // logout request from Renderer
    ipcMain.on('logout', (e, response) => {
      e.sender.send('logout-response', 200);
    })

  });

  mainWindow.webContents.openDevTools();
  // loginModal.webContents.openDevTools();
}


function redirectToNewPage(page) {
  mainWindow.webContents.send('redirect-page', page);
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
