/**
 receipt window
 */

 const path = require("path");
 const {
   BrowserWindow,
   ipcMain
 } = require("electron");
 
 
 let win
 
 
 exports.createReceiptWindow = function receiptWindow(parentWindow, from) {
 
   win = new BrowserWindow({
     width: 400,
     height: 500,
     parent: parentWindow,
     modal: true,
     show: false,
     frame: false,
     webPreferences: {
       contextIsolation: true,
       nodeIntegration: false,
       preload: path.join(__dirname, "../preload_scripts/receiptPreload.js")
     }
   });
 
   // page to redirect after successful login
   pageName = from
 
   win.loadFile(path.join(__dirname, "../views/cashier/receipt.html"));
 
   win.once("ready-to-show", () => win.show());
 
   win.on("close", () => {
 
     win = null
   });
}