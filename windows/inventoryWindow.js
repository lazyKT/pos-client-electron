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
    ipcMain.removeHandler("get-all-items");
    if (win) win = null;
  });


  win.webContents.on("did-finish-load", () => {

    /**
    IPC Messages
    **/
    win.webContents.send("server-url", AppConfig.serverURL);

    /** LogOut **/
    ipcMain.on("logout", () => {
      ipcMain.removeHandler("get-all-items");
      if (win)
        win.close();
        ipcMain.removeHandler("get-all-items");
        ipcMain.removeHandler("edit-item");
    });


    /**
    # GET ALL INVENTORY ITEMS
    **/
    // win.webContents.send("reload-data", getAllItems());

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


  });
}


exports.closeInventoryWindow = function closeInventoryWindow() {
  if(win){
  win.close();
  ipcMain.removeHandler("get-all-items");
  }
}
