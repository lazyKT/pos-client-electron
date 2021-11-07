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
  // win.openDevTools();


  win.on("ready-to-show", () => win.show());

  win.on("close", () => {
    if (win) {
      removeListeners(["close-export", "open-preview"]);
      unregisterEmitters();
      win = null;
    }
  });

  win.webContents.on("did-finish-load", () => {
    win.webContents.send("server-addr", AppConfig.serverURL);
  });


  ipcMain.on("close-export", () => {
    if (win) win.close();
  });

  ipcMain.on("open-preview", (event, args) => {
    createPreviewWindow(win, args);
    // win.close();
  })
}


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
    console.error("Error Removing Listeners from inventoryExportWindow", error);
  }
}


function unregisterEmitters () {
  try {
    if (win) {
        win.webContents.removeListener("did-finish-load", win.webContents.listeners("did-finish-load")[0]);
        // win.webContents.removeListener()
    }
  }
  catch (error) {
    console.error("Error removing Emitters", error);
  }
}
