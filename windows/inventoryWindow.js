/**
 Inventory Window
 **/

const path = require("path");
const {
  BrowserWindow,
  ipcMain
} = require("electron");

const {
  createEditFormWindow
 } = require("./itemEditFormWindow.js");

const {
  createDetailFormWindow
} = require("./detailFormWindow.js");

const {
  createInventoryExportWindow
} = require("./inventoryExportWindow.js");

const AppConfig = require("../config.js");


let win


exports.createInventoryWindow = function createInventoryWindow () {

  if (!win || win === null) {
    win = new BrowserWindow({
      width: 1200,
      height: 900,
      show: false,
      // fullscreen: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true, // protect against prototype pollution
        preload: path.join(__dirname, "../preload_scripts/inventoryPreload.js") // use a preload scrip
      }
    });
  }


  win.loadFile(path.join(__dirname, "../views/inventory/inventory.html"));
  // win.openDevTools();

  win.once("ready-to-show", () => {
    win.show();
  });


  win.on("close", () => {
    removeListeners(["logout", "item-data", "item-details", "export-data"]);
    unregisterEmitters();
    if (win) win = null;
  });


  win.webContents.on("did-finish-load", () => {

    /** LogOut **/
    ipcMain.on("logout", () => {
      ipcMain.removeHandler("get-all-items");
      if (win)
        win.close();
        ipcMain.removeHandler("get-all-items");
        ipcMain.removeHandler("edit-item");
    });



    /**
    # See Med Tag
    **/
    ipcMain.on('item-data', (e, req) => {
      createEditFormWindow(win, req.type, req.data);
    });

    /**
    # See Medicines
    **/
    ipcMain.on('item-details', (e, req) => {
      createDetailFormWindow(win, req);
    });


    /**
    # Open Export Options Window
    **/
    ipcMain.on("open-export-options", (e, args) => {
      createInventoryExportWindow (win);
    });


    // /**
    // # Monitor Clean Up Events ** For Dev Env **
    // **/
    // ipcMain.on("clean-up", (e, args) => {
    //   console.log(`[Inventory API] ${args} has been cleaned up.`);
    // });


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
