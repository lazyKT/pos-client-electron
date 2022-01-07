/**
Doctor Window
 **/

const path = require("path");
const {
  BrowserWindow,
  ipcMain
} = require("electron");
const {
  createNewUser,
  getAllUsers,
} = require("../models/user.js");



const { createDocEditWindow } = require("./createDocEditWindow.js");
const { createDocSchEditWindow } = require("./editDocSchWindow.js")


const { removeEventListeners } = require("../ipcHelper.js");


let win


exports.createDoctorWindow = function createDoctorWindow () {

  if (!win || win === null) {
    win = new BrowserWindow({
      width: 1200,
      height: 900,
      show: false,
      // fullscreen: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true, // protect against prototype pollution
        preload: path.join(__dirname, "../preload_scripts/mainPreload.js") // use a preload scrip
      }
    });
  }


  win.loadFile(path.join(__dirname, "../views/doctor/doctor.html"));
  //win.openDevTools();

  win.once("ready-to-show", () => {
    win.maximize();
    win.show();
  });


  win.on("close", () => {
    removeEventListeners(ipcMain, ["logout", "doctor-data", "item-details", "export-data","form-data-finish"]);
    if (win) win = null;
  });

  /** LogOut **/
  ipcMain.on("logout", () => {
    ipcMain.removeHandler("get-all-items");
    if (win)
      win.close();
      ipcMain.removeHandler("get-all-items");
      ipcMain.removeHandler("edit-item");
  });


  ipcMain.on("doctor-data", (event, args) => {
        createDocEditWindow(win, args.method, args._id);
      });

  ipcMain.on("doctor-schedule-data", (event, args) => {
        createDocSchEditWindow(win, args.method, args._id);
      });

  ipcMain.on ("form-data-finish", (event, args) => {
      if (win) win.close();
      // reload user
    parentWindow.webContents.send("reload-data", "");
    });

}


/**
# Remove Listeners from ipcMain
**/
function removeListeners (listeners) {
  try {
    listeners.forEach (
      listener => {
        let func = ipcMain.listeners(listener)[0];
        if (func)
          ipcMain.removeListener(listener, func);
      }
    )
  }
  catch (error) {
    console.error("Error Removing Listeners from inventoryExportWindow");
  }
}
