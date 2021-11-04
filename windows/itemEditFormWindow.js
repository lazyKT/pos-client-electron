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
 
 
   win.loadFile(path.join(__dirname, "../views/inventory/edit_show_item.html"));
   win.openDevTools();
 
 
   win.once("ready-to-show", () => win.show());
 
   win.on("close", () => { if(win) win = null;})
 
   win.webContents.on("did-finish-load", () => {
 
     win.webContents.send("response-edit-item-data", {item: contents, method: type});
 
 
     /**
     IPC Messages
     **/
 
     /* Dimiss Window */
     ipcMain.on("dismiss-edit-item-form-window", (event, args) => {
       ipcMain.removeHandler("edit-item"); // remove existing handler
       if(win) win.close();
     })
 
 
     /* Edit user */
     ipcMain.handle("edit-item", (event, args) => {
       return updateItem(args);
     });
 
     /* close form when the renderer process informs that the edit process is finished */
     ipcMain.on("item-form-data-finish", (event, args) => {
       ipcMain.removeHandler("edit-item"); // remove existing handler
       if(win) win.close();
       parentWindow.webContents.send("reload-data", getAllItems());
     });
 
   });
 
 
 }
 