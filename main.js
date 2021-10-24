const { app, remote, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const {
  loginUser,
  getAllUsers,
  createNewUser,
  getUserById,
  updateUser,
  searchUser
} = require('./models/user.js')

const { addItem, getAllItems } = require('./models/item.js')

let mainWindow

function createMainWindow() {

  // application main window
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true, // protect against prototype pollution
      preload: path.join(__dirname, "preload_scripts/mainPreload.js") // use a preload scrip
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
  const formWindow = new BrowserWindow({
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
    console.log('did-finish-load');
    // listen for ipc message from renderer process to open login window
    ipcMain.on('login', (e, _pageName) => {
      console.log('login for pageName', _pageName);
      // show the login window
      loginModal.show();
      // send routeName to LoginModal. Upon Successful login, the LoginModal will redirect to new page based on the page name
      pageName = _pageName;
    });


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
        console.log(pageName);
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

    //response all items to renderer process
    ipcMain.handle('get-all-items', (e, _) => {

      const result = getAllItems();
      return result;
    });

    // main process receives ipc message to open create new data modal
    ipcMain.on('create-modal', (e, windowType) => {


      if (windowType === 'user') {
        // load user_create html into formWindow
        formWindow.setBackgroundColor('#FFFFFF');
        formWindow.loadFile('views/user/user_regis.html');

        // show the new data form
        formWindow.show();
        // formWindow.webContents.openDevTools(); // for debug
      }
      else if (windowType === 'inventory') {
        // load create_new_item html into formWindow
      }
    });

    // close create data window
    ipcMain.on('dismiss-form-window', () => formWindow.hide());

    // recive message from renderer process indicating that the new data creation is successfully finished
    // now can close the formWindow
    ipcMain.on('form-data-finish', (e, data) => {
      console.log('form-data-finish');
      formWindow.hide();
      // send ipc message to renderer process to reload the data
      mainWindow.webContents.send('reload-data', data);
    });


    // receive ipc message to response single user data by id
    ipcMain.on('user-data', (e, req) => {
      const { id, method } = req;

      const user = getUserById(id);

      if (user) {
        formWindow.show();
        formWindow.setBackgroundColor('#FFFFFF');
        formWindow.loadFile('views/user/edit_show_user.html');
        formWindow.openDevTools();
        // after the contents of formWindows are successfully loaded
        formWindow.webContents.on('did-finish-load', () => {
          // send user data to be shown in formWindow
          formWindow.webContents.send('response-user-data', {user, method});
        });
      }
    });

    // recieve create new user request
    ipcMain.handle('create-new-user', (e, newUser) => {
      const response = createNewUser(newUser);
      return response;
    });

    // recieve update user request
    ipcMain.handle('update-user', (e, req) => {
      return updateUser(req);
    });


    ipcMain.handle('search-data', (e, req) => {
      console.log(req);
      const { data, q } = req;

      if (data === 'user') {
        // search user
        return searchUser(q);
      }
      else if (data === 'inventory') {
        // search inventory here
      }
    });

  });
}


function redirectToNewPage(page) {
  console.log('page', page);
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
