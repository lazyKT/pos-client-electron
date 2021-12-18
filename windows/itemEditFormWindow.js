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

const { removeEventListeners } = require("../ipcHelper.js");

let win


 exports.createEditFormWindow = function createEditFormWindow(parentWindow, type, contents) {

   if (!win) {
     win = new BrowserWindow ({
       width: 550,
       height: 700,
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

     win.loadFile(path.join(__dirname, "../views/inventory/edit_show_item.html"));
     win.openDevTools();

     win.once("ready-to-show", () => win.show());

     win.on("close", () => {
       if(win) {
         removeEventListeners(ipcMain, ["dismiss-edit-item-form-window", "item-form-data-finish"]);
         removeEventListeners(win.webContents, ["did-finish-load"]);
         win = null;
       }
     })

     win.webContents.on("did-finish-load", () => {

       win.webContents.send("response-edit-item-data", {data: contents, method: type});
     });

     /* close form when the renderer process informs that the edit process is finished */
     ipcMain.on("item-form-data-finish", (event, args) => {
       parentWindow.webContents.send("reload-data", args);
       if(win) win.close();
     });

     /* Dimiss Window */
     ipcMain.on("dismiss-edit-item-form-window", (event, args) => {
       ipcMain.removeHandler("edit-item"); // remove existing handler
       if(win) win.close();
     });

   }

}
