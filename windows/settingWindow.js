/**
# Setting Window
**/
const path = require ("path");
const {
  BrowserWindow,
  ipcMain
} = require("electron");
const Store = require("electron-store");

const AppConfig = require("../config");


let win


exports.createSettingWindow = function () {

  if (!win) {
    win = new BrowserWindow({
      width: 500,
      height: 600,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "../preload_scripts/mainPreload.js")
      }
    });

    // local storage init
    const store = new Store();

    win.loadFile(path.join(__dirname, "../views/settings.html"));

    win.on("ready-to-show", () => win.show());

    win.on("close", () => {
      if (win) {
        removeListeners(["close-setting"]);
        unregisterEmitters();
        win = null
      }
    });


    win.webContents.on("did-finish-load", () => {

    });

    ipcMain.on("close-setting", (event, args) => {
      if (win)
        win.close();
    });
  }
}


function removeListeners (listeners) {
  try {
    listeners.forEach(
      listener => {
        let func = ipcMain.listeners(listener)[0];
        if (func)
          ipcMain.removeListener(listener, func);
      }
    )
  }
  catch (error) {
    console.error(`Error Removing Listeners at setting: ${error}`);
  }
}

function unregisterEmitters () {
  try {
    if (win)
      win.webContents.removeListener("did-finish-load", win.webContents.listeners("did-finish-load")[0]);
  }
  catch (error) {
    console.error(`Error Unregistering Emitters at setting: ${error}`);
  }
}
