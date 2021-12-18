/**
  another window to edit/show medicines
**/
 const path = require("path");
 const {
   BrowserWindow,
   ipcMain
 } = require("electron");
 const {
   updateItem,
   getAllItems,
   getItemById,
   getDetailItemById,
   getSubItemDetailById
 } = require("../models/item.js");
 const { removeEventListeners } = require("../ipcHelper.js");

let win


exports.createDetailFormWindow = function createDetailFormWindow(parentWindow, contents) {

  if (!win) {
   win = new BrowserWindow ({
     width: 1100,
     height: 800,
     parent: parentWindow,
     modal: true,
     show: false,
     backgroundColor: '#ffffff',
     webPreferences: {
       contextIsolation: true,
       nodeIntegration: false,
       preload: path.join(__dirname, "../preload_scripts/invDetailPreload.js")
     }
   });

   win.loadFile(path.join(__dirname, "../views/inventory/item_detail.html"));
   // win.openDevTools();

   win.once("ready-to-show", () => win.show());

   win.on("close", () => {
     if(win) {
       removeEventListeners(ipcMain, ["dismiss-form-window", "open-details"]);
       removeEventListeners(win.webContents, ["did-finish-load"]);
       win = null;
     }
   });

   win.webContents.on("did-finish-load", () => {
     win.webContents.send("reload-data", contents);
   });

   ipcMain.on('dismiss-form-window', () => {
     if(win) win.close();
   });

  }
}
