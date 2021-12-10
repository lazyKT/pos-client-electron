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

const { removeEventListeners } = require("../ipcHelper.js");


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

    win.loadFile(path.join(__dirname, "../views/settings.html"));

    win.on("ready-to-show", () => win.show());

    win.on("close", () => {
      if (win) {
        removeEventListeners(ipcMain, ["close-setting"]);
        win = null
      }
    });


    ipcMain.on("close-setting", (event, args) => {
      if (win)
        win.close();
    });
  }
}
