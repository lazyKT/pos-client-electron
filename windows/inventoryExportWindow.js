/**
# Export Data Browser Window for Inventory Data
**/
const path = require("path");
const {
  ipcMain,
  BrowserWindow
} = require("electron");
const AppConfig = require("../config");

const {
  createPreviewWindow
} = require("./previewWindow.js");

const { removeEventListeners } = require("../ipcHelper.js");


let win


exports.createInventoryExportWindow = function (parent) {
  console.log("create inventory export window");
  if (!win) {
    win = new BrowserWindow({
      width: 500,
      height: 550,
      show: false,
      parent,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(__dirname, "../preload_scripts/inventoryExportPreload.js")
      }
    });
  }


  win.loadFile(path.join(__dirname, "../views/inventory/export_data.html"));


  win.on("ready-to-show", () => win.show());

  win.on("close", () => {
    if (win) {
      removeEventListeners(ipcMain, ["close-export", "open-preview"]);
      win = null;
    }
  });

  ipcMain.on("close-export", () => {
    if (win) win.close();
  });

  ipcMain.on("open-preview", (event, args) => {
    createPreviewWindow(win, args);
    // win.close();
  })
}
