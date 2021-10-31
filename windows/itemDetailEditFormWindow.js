/**
 another form window to edit/show item data
 **/
 const path = require("path");
 const {
   BrowserWindow,
   ipcMain
 } = require("electron");
 const {
   updateItem,
   getAllItems,
 } = require("../models/item.js");
 
 
 let win
 
 
 exports.createEditFormWindow = function createEditFormWindow(parentWindow, type, contents) {
 
   if (!win || win === null) {
     win = new BrowserWindow ({
       width: 400,
       height: 500,
       parent: parentWindow,
       modal: true,
       show: false,
       backgroundColor: '#ffffff',
       webPreferences: {
         contextIsolation: true,
         nodeIntegration: false,
         preload: path.join(__dirname, "../preload_scripts/editFormPreload.js")
       }
     });
     
   }
 
 
   win.loadFile(path.join(__dirname, "../views/inventory/edit_detail_item.html"));
   win.openDevTools();
 
 
   win.once("ready-to-show", () => win.show());
 
   win.on("close", () => { if(win) win = null;})
 
   win.webContents.on("did-finish-load", () => {
 
     win.webContents.send("response-item-data", {item: contents, method: type});
 
 
     /**
     IPC Messages
     **/
    ipcMain.removeHandler("get-all-detail-items");
 
     /* Dimiss Window */
     ipcMain.on("dismiss-form-window", (event, args) => {
       if(win) win.close();
       ipcMain.removeHandler("edit-detail-item"); // remove existing handler
     })
 
 
     /* Edit user */
     ipcMain.handle("edit-detail-item", (event, args) => {
       ipcMain.removeHandler("get-all-detail-items");
       return updateItem(args);
     });
 
     /* close form when the renderer process informs that the edit process is finished */
     ipcMain.on("form-data-finish", (event, args) => {
       if(win) win.close();
       ipcMain.removeHandler("edit-detail-item"); // remove existing handler
       parentWindow.webContents.send("reload-data", getAllItems());
     });
 
   });
 
 
 }