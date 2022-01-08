/**
 Inventory Window
 **/

 const path = require("path");
 const {
   BrowserWindow,
   ipcMain
 } = require("electron");


 const { removeEventListeners } = require("../ipcHelper.js");
 const { createBookingDetailsWindow } = require('./bookingDetailsWindow.js');
 const { createBookingListWindow } = require('./bookingListWindow.js');


 let win


 exports.createBookingsWindow = function createBookingsWindow (name, id) {

   if (!win || win === null) {
     win = new BrowserWindow({
       width: 1000,
       height: 900,
       show: false,
       // fullscreen: true,
       webPreferences: {
         nodeIntegration: false,
         contextIsolation: true, // protect against prototype pollution
         preload: path.join(__dirname, "../preload_scripts/bookingsPreload.js") // use a preload scrip
       }
     });
   }


   win.loadFile(path.join(__dirname, "../views/bookings/bookings.html"));
   win.openDevTools();

   win.once("ready-to-show", () => {
     // win.maximize();
     win.show();
   });


   win.on("close", () => {
     removeEventListeners(ipcMain, ["logout", 'open-booking-list', 'open-booking-details']);
     if (win) win = null;
   });

   /** LogOut **/
   ipcMain.on("logout", () => {
     if (win)
       win.close();
   });

   ipcMain.on('open-booking-details', (event, args) => {
     createBookingDetailsWindow(win, args.bookingId);
   });

   ipcMain.on('open-booking-list', (event, args) => {
     createBookingListWindow(win, args);
   })

 }



 /**
 # Remove Listeners from ipcMain
 **/
 function removeListeners (listeners) {
   try {
     listeners.forEach (
       listener => {
         let func = ipcMain.listeners(listener)[0];
         if (func)
           ipcMain.removeListener(listener, func);
       }
     )
   }
   catch (error) {
     console.error("Error Removing Listeners from inventoryExportWindow");
   }
 }
