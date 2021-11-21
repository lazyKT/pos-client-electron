/**
 receipt window
 */

 const path = require("path");
 const {
   BrowserWindow,
   ipcMain
 } = require("electron");
 const fs = require("fs");
 const os = require("os");


 let win


exports.createReceiptWindow = function (parentWindow, invoice) {

  if (!win) {
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

    win.loadFile(path.join(__dirname, "../views/cashier/receipt.html"));
    win.openDevTools();

    // win.once("ready-to-show", () => win.show());

    win.on("close", () => {
      if (win) {
        removeEventListenersFromWebContents();
        removeIPCMainListeners(["print"])
        win = null;
      }
    });

    //console.log(invoice);
    win.webContents.on("did-finish-load", () => {

      win.webContents.send("invoice", invoice);

      ipcMain.on("print", (event, doc) => {

        console.log("Printing receipt");
        const options = {
          silent: true,
          // deviceName: ''
        }

        win.webContents.print(options, (success, errorType) => {
          if (!success)
            console.log(errorType)
          win.close();
        });

        // const pdfPath = path.join(os.homedir(), 'Desktop', 'temp.pdf')
        // win.webContents.printToPDF({}).then(data => {
        //   console.log("Writing PDF ...");
        //   fs.writeFile(pdfPath, data, (error) => {
        //     if (error) throw error
        //     console.log(`Wrote PDF successfully to ${pdfPath}`)
        //     win.close();
        //   })
        // }).catch(error => {
        //   console.log(`Failed to write PDF to ${pdfPath}: `, error)
        // })
      });
    });
  }
}


function removeEventListenersFromWebContents () {
  try {
    if (win) {
        win.webContents.removeListener("did-finish-load", win.webContents.listeners("did-finish-load")[0]);
    }
  }
  catch (error) {
    console.error(`Error Removing Listeners from ReceiptWindow.\n ${error}`);
  }
}


function removeIPCMainListeners (listeners) {
  try {
    listeners.forEach(
      listener => ipcMain.removeAllListeners(listener)
    );
  }
  catch (error) {
    console.error(`Error Removing Emitters `)
  }
}
