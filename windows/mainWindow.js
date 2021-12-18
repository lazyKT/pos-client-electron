/**
  application main window
 */
const path = require('path');
const {
  BrowserWindow,
  ipcMain,
  dialog,
  Menu,
  session
} = require('electron');

const { createPFormWindow } = require("./newPatientFormWindow.js");
const { createPEditWindow } = require("./createPatientEditWindow.js");
const { createPatientWindow } = require("./PatientWindow.js");
const { createCashierWindow } = require("./cashierWindow.js");
const { createInventoryWindow } = require("./inventoryWindow.js");
const { createFormWindow } = require("./formWindow.js");

const { createEditFormWindow } = require("./editFormWindow.js");
const { createClinicCashierWindow } = require("./clinicCashierWindow.js");


const userMangementURL = path.join(__dirname, "../views/user/user.html");
const patientMgmtURL = path.join(__dirname, "../views/user/patient2.html");

const applicationMenu = Menu.buildFromTemplate(require('../applicationMenu.js'));
const AppConfig = require("../config");
const { createPageSelectionWindow } = require('./createPageSelectionWindow.js');


let win


exports.createMainWindow = function createMainWindow () {

  if (!win) {
    win = new BrowserWindow({
      width: 1020,
      height: 850,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true, // protect against prototype pollution
        preload: path.join(__dirname, "../preload_scripts/mainPreload.js") // use a preload scrip
      }
    });

    const mainMenuURL = path.join(__dirname, "../views/main.html");
    
    //

    win.loadFile(mainMenuURL);
    // win.openDevTools();

    win.once("ready-to-show", () => win.show() );

    // upon close the window, set win to null and release the win object
    win.on("close", () => {
      if (win) {
        /**
        # Always clean up the listeners and event emitters
        **/
        removeListeners(["login", "login-user", "user-logout", "create-modal","create-modal2",  "user-data", "user-logout", "logout"]);
        win = null;
      }
    });

    /**
      IPC Messages
    */
    ipcMain.on("login", (e, args) => {
      openWindow(args);
    });


    ipcMain.on("login-user", (e, args) => {
      
        //win.loadFile(patientMgmtURL);
      loadUserWindows(args);
     //createPatientWindow(win, windowType);
      
    });


    // logout request from Renderer
    ipcMain.on('logout', (e, response) => {
      e.sender.send('logout-response', 200);
    });

    /**
    ##### USER IPC CHANNELS #####
    **/

    ipcMain.on('user-logout', (e, response) => {
      win.loadFile(mainMenuURL);
    });


    // main process receives ipc message to open create new data modal
    ipcMain.on('create-modal', (e, windowType) => {
      createFormWindow(win, windowType);
    });

    ipcMain.on('create-modal2', (e, windowType) => {
      createPFormWindow(win, windowType);
    });


    // open edit form
    ipcMain.on("user-data", (event, args) => {
      createEditFormWindow(win, args.method, args._id);
    });

    


    Menu.setApplicationMenu(applicationMenu);


  }
}


function openWindow ({name, _id, page}) {
  switch (page) {
    case 'Pharmacy' :
      createCashierWindow(name, _id);
      break;
    case 'Clinic' :
      createClinicCashierWindow(name, _id);
      break;
    case 'Inventory' :
      createInventoryWindow();
      break;
    default :
      throw new Error ('Unknown Page Name!');
  }
}
function loadUserWindows({name, _id, page})
{
  switch (page){
    case 'Doctor' :
      win.loadFile(userMangementURL);
      break;
    case 'Patient' :
      createPatientWindow(name, _id);
      break;
    case 'Employee' :
      win.loadFile(userMangementURL);
      break;
    default :
      throw new Error('Unknown Page Name!');

  }
}


function removeListeners (listeners) {
  try {
    listeners.forEach (
      listener => {
        ipcMain.removeAllListeners([listener]);
      }
    );
  }
  catch (error) {
    console.error("Error removing listeners from ItemEditWindow", error);
  }
}
