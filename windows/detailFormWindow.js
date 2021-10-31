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
 
 
 exports.createDetailFormWindow = function createDetailFormWindow(parentWindow, type, contents) {
 
   if (!win || win === null) {
     win = new BrowserWindow ({
       width: 1000,
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
     
   }

   win.loadFile(path.join(__dirname, "../views/inventory/item_detail.html"));
   win.openDevTools();
 
 
   win.once("ready-to-show", () => win.show());
   console.log(contents);
 
   win.on("close", () => { if(win) win = null;})
 
   win.webContents.on("did-finish-load", () => {

    /**
    # GET ALL INVENTORY ITEMS
    **/
    win.webContents.send("reload-data", getAllItems());

    //response all items to renderer process
    ipcMain.handle('get-all-detail-items', (e, _) => {

     const result = getAllItems();
     return result;
    });
 
     /**
     IPC Messages
     **/

     ipcMain.on('item-detail-data', (e, req) => {
      const { id, method } = req;
      const item = getItemById(id);

      if (item) {
        ipcMain.removeHandler("get-all-detail-items");
        createEditFormWindow(win, method, item)
      }
    });
 
     /* Dimiss Window */
     ipcMain.on("dismiss-form-window", (event, args) => {
       if(win) win.close();
       ipcMain.removeHandler("get-all-detail-items");
     })
 
   });
 
 
 }