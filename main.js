const { app, remote, BrowserWindow, ipcMain } = require('electron');

const { addUser, loginUser, getAllUsers, createNewUser } = require('./models/user.js')

let mainWindow

function createMainWindow() {

  // application main window
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    }
  });

  // login window
  const loginModal = new BrowserWindow({
    width: 400,
    height: 500,
    parent: mainWindow,
    modal: true,
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    }
  });

  // form window to create new data
  const newDataForm = new BrowserWindow({
    width: 400,
    height: 500,
    parent: mainWindow,
    modal: true,
    show: false,
    backgroundColor: '#ffffff',
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
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

      const { username, password} = args;

      const loginResponse = loginUser({username, password});

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
        // load user_create html into newDataForm
        newDataForm.setBackgroundColor('#FFFFFF');
        newDataForm.loadFile('views/user/user_regis.html');

        // show the new data form
        newDataForm.show();
        // newDataForm.webContents.openDevTools(); // for debug
      }
      else if (windowType === 'inventory') {
        // load create_new_item html into newDataForm
      }
    });

    // close create data window
    ipcMain.on('dismiss-create-window', () => newDataForm.hide());

    // recieve create new user request
    ipcMain.handle('create-new-user', (e, newUser) => {
      const response = createNewUser(newUser);
      return response;
    });

    // recive message from renderer process indicating that the new data creation is successfully finished
    // now can close the newDataForm
    ipcMain.on('create-data-finish', (e) => {
      newDataForm.hide();
      // send ipc message to renderer process to reload the data
      mainWindow.webContents.send('reload-data', 'user');
    });

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
