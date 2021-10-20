const { app, BrowserWindow, ipcMain } = require('electron');

const { addUser, loginUser, getAllUsers } = require('./models/user.js')

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

  mainWindow.webContents.openDevTools();
  // loginModal.webContents.openDevTools();

  // when main window finished loading every dom elements
  mainWindow.webContents.on('did-finish-load', () => {
    let pageName

    // listen for ipc message from renderer process to open login window
    ipcMain.on('login', (e, _pageName) => {
      console.log('Open Login Modal!');
      // show the login window
      loginModal.show();
      // send routeName to LoginModal. Upon Successful login, the LoginModal will redirect to new page based on the page name
      pageName = _pageName;
    });


    /*
    ------^ re-use the above function instead
    */
    // ipcMain.on('inventory', (e, arg) => {
    //   console.log('My Inventory');
    //   redirectToNewPage('inventory');
    // });

    // after the successful user login or cancel login, main process receives 'dismiss-login-modal' message
    ipcMain.on('dismiss-login-modal', () => {
      // dismiss login modal
      loginModal.hide();
    });


    // renderer process requesting login to register new user
    ipcMain.on('login-request', (e, args) => {
      console.log(args);
      const { username, password} = args;

      const loginResponse = loginUser({username, password});
      console.log('pageName', pageName);
      if (loginResponse.status === 200) {
        loginModal.hide();
        redirectToNewPage(pageName);
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

    // main process receives ipc message to open create new data modal
    ipcMain.on('create-modal', (e, windowType) => {
      if (windowType === 'user') {
        // open create new user window
      }
    })

  });
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
