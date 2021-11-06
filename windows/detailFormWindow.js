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

const {createSubItemEditForm} = require("../views/inventory/edit_detail_item.js");

let win


exports.createDetailFormWindow = function createDetailFormWindow(parentWindow, contents) {

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

  win.on("close", () => {
    if(win) {
      removeListeners(["dismiss-form-window", "open-details"]);
      unregisterEmitters();
      win = null;
    }
  });

  win.webContents.on("did-finish-load", () => {
    win.webContents.send("reload-data", contents);

    ipcMain.on('dismiss-form-window', () => {
      /**
      *** upon the window close, remove all the existing handlers to prevent second handler registration error in the future
      **/
      ipcMain.removeHandler("item-details-edit"); // remove existing handler\
      if(win) win.close();
    });

    // ipcMain.on("open-details", (event, args) => {
    //   console.log(args);
    //   win.loadFile(path.join(__dirname, "../views/inventory/med_details.html"));
    //   win.webContents.send("reload-data", args);
    // });

    // ipcMain.handle("request-med-id", (event, args) => {
    //   return "1234";
    // })

   });
 }

 function removeListeners (listeners) {
   try {
     listeners.forEach (
       listener => {
         const func = ipcMain.listeners(listener)[0];
         if (func) {
           ipcMain.removeListener(listener, func);
         }
       }
     );
   }
   catch (error) {
     console.error("Error removing listeners from ItemEditWindow", error);
   }
 }


 function unregisterEmitters () {
   try {
     if (win) {
         win.webContents.removeListener("did-finish-load", win.webContents.listeners("did-finish-load")[0]);
     }
   }
   catch (error) {
     console.error("Error removing Emitters", error);
   }
 }
