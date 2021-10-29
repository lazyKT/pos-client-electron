/**
  application main window
 */
const path = require('path');
const {
  BrowserWindow,
  ipcMain,
  dialog,
  Menu
} = require('electron');

const { createLoginWindow } = require("./loginWindow.js");
const { createFormWindow } = require("./formWindow.js");
const { createEditFormWindow } = require("./editFormWindow.js");
const {
  getAllUsers,
  getUserById,
  searchUser,
  exportUserCSV
} = require("../models/user.js");
const { getAllItems } = require("../models/item.js");
const applicationMenu = Menu.buildFromTemplate(require('../applicationMenu.js'));

let win


exports.createMainWindow = function createMainWindow () {
  console.log("Main Window Created")
  win = new BrowserWindow({
    width: 1000,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true, // protect against prototype pollution
      preload: path.join(__dirname, "../preload_scripts/mainPreload.js") // use a preload scrip
    }
  });


  win.loadFile(path.join(__dirname, "../views/main.html"));
  // win.openDevTools();

  win.once("ready-to-show", () => win.show() );

  // upon close the window, set win to null and release the win object
  win.on("close", () => win = null);


  win.webContents.on("did-finish-load", () => {

    /**
     IPC Messages
     */
    ipcMain.on("login", (e, from) => {

     createLoginWindow(win, from);
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
      createFormWindow(win, windowType);
    });

    // receive ipc message to response single user data by id
    ipcMain.on('user-data', (e, req) => {
      const { id, method } = req;
      const user = getUserById(id);

      if (user) {
        createEditFormWindow(win, method, user)
      }
    });

    // search data
    ipcMain.handle('search-data', (e, req) => {
      const { data, q } = req;

      if (data === 'user') {
        // search user
        return searchUser(q);
      }
      else if (data === 'inventory') {
        // search inventory here
      }
    });


    // Export CSV FIle
    ipcMain.on('export-csv', async (e, args) => {
      try {
        const dest = await dialog.showSaveDialog({
          filters: [
            { name: 'CSV files', extensions: ['csv']}
          ]
        });

        if (dest.canceled) return;

        if (args === 'user') {
          exportUserCSV(dest.filePath)
            .then(() => {
              // show info dialog after successful export
              dialog.showMessageBox ({
                title: 'CSV File Exported',
                message: `File saved in ${dest.filePath}`
              });
            })
            .catch(erorr => console.log('Error Exporting', args, 'csv file ->', error));
        }
      }
      catch(error) {
        console.log('Error Exporting', args, 'csv file ->', error);
      }
    });

  });


  Menu.setApplicationMenu(applicationMenu);

}




exports.closeMainWindow = function closeMainWindow() {
  if (win)  win.close();
}
