const { app, BrowserWindow, ipcMain } = require('electron');

const { addUser, loginUser, getAllUsers } = require('./models/user.js')

const { addItem, getAllItems } = require('./models/item.js')

let mainWindow

function createMainWindow() {

  mainWindow = new BrowserWindow({
    width: 800,
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
  mainWindow.loadFile('views/main.html');
  loginModal.loadFile('views/login.html');

  mainWindow.webContents.on('did-finish-load', () => {
    let routeName
    // listen for ipc message from renderer process
    ipcMain.on('login', (e, _routeName) => {
      console.log('Open Login Modal!');
      loginModal.show();
      // send routeName to LoginModal
      routeName = _routeName;
      // mainWindow.webContents.send('route-name', routeName);
    });


    ipcMain.on('dismiss-login-modal', () => {
      console.log('dismiss login modal');
      loginModal.hide();
    });

    


    // renderer process requesting login to register new user
    ipcMain.on('login-request', (e, args) => {
      console.log(args);
      const { username, password} = args;

      const loginResponse = loginUser({username, password});
      console.log('routeName', routeName);
      if (loginResponse.status === 200) {
        loginModal.hide();
        redirectToNewPage(routeName);
      }
      e.sender.send('register-login-response', loginResponse);
    });

    // logout request from Renderer
    ipcMain.on('logout', (e, response) => {
      e.sender.send('logout-response', 200);
    })

    // reponse all users to renderer process
    ipcMain.handle('get-all-users', (e, _) => {
      const result = getAllUsers();
      return result;
    });

    //response all items to renderer process
    ipcMain.handle('get-all-items', (e, _) => {
      console.log("hi");
      const result = getAllItems();
      return result;
    });

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
