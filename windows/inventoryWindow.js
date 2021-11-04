/**
 Inventory Window
 **/

const path = require("path");
const {
  BrowserWindow,
  ipcMain
} = require("electron");
const {
  getAllItems,
  getItemById
} = require("../models/item.js");

const {
  createEditFormWindow
 } = require("./itemEditFormWindow.js");

const {
  createDetailFormWindow
} = require("./detailFormWindow.js");


let win


exports.createInventoryWindow = function createInventoryWindow () {

  if (!win || win === null) {
    win = new BrowserWindow({
      width: 1000,
      height: 800,
      show: false,
      fullscreen: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true, // protect against prototype pollution
        preload: path.join(__dirname, "../preload_scripts/inventoryPreload.js") // use a preload scrip
      }
    });
  }


  win.loadFile(path.join(__dirname, "../views/inventory/inventory.html"));
  //win.openDevTools();


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
    win.webContents.send("reload-data", getAllItems());

    //response all items to renderer process
    ipcMain.handle('get-all-items', (e, _) => {

     const result = getAllItems();
     return result;
    });

    ipcMain.on('item-data', (e, req) => {
      const { id, method } = req;
      const item = getItemById(id);

      if (item) {
        createEditFormWindow(win, method, item)
      }
    });

    ipcMain.on('item-details', (e, req) => {
      const {id, method} = req;
      const item = getItemById(id);

      if(item) {
        //ipcMain.removeHandler("get-all-items");
        createDetailFormWindow(win, method, item)
        
      }
    });


  });
}


exports.closeInventoryWindow = function closeInventoryWindow() {
  if(win){
  win.close();
  ipcMain.removeHandler("get-all-items");
  }
}
