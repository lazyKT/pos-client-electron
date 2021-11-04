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
   getItemById,
   getDetailItemById,
   getSubItemDetailById
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
   // win.openDevTools();


   win.once("ready-to-show", () => win.show());
   console.log(contents);

   win.on("close", () => { if(win) win = null;})

   win.webContents.on("did-finish-load", () => {
       const q = getDetailItemById(contents);
       //console.log("contents11", q);
 
    win.webContents.send("response-item-detail-data", q);



     const result = getAllItems();
     return result;
    });

     /**
     IPC Messages
     **/

    ipcMain.handle('item-details-edit', (e, req) => {
        const { productId, method} = req;
        console.log("checking123", productId);
        const item = getSubItemDetailById(productId);
        console.log("check item form", item);
        return item;
    });

     /* Dimiss Window */
     ipcMain.on('dismiss-detailed-form-window', () => {
      if(win) win.close();
      /**
      *** upon the window close, remove all the existing handlers to prevent second handler registration error in the future
      **/
    
    });



 }
