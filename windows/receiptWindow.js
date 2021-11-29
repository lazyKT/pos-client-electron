/**
 receipt window
 */

 const path = require("path");
 const {
   BrowserWindow,
   ipcMain,
   dialog
 } = require("electron");
 const fs = require("fs");
 const os = require("os");

 const { removeEventListeners } = require("../ipcHelper.js");


 let win


exports.createReceiptWindow = function (parentWindow, invoice) {

  if (!win) {
    win = new BrowserWindow({
      width: 400,
      height: 500,
      parent: parentWindow,
      show: false,
      frame: false,
      webPreferences: {
       contextIsolation: true,
       nodeIntegration: false,
       preload: path.join(__dirname, "../preload_scripts/receiptPreload.js")
      }
    });

    win.loadFile(path.join(__dirname, "../views/cashier/receipt.html"));
    // win.openDevTools();

    // win.once("ready-to-show", () => win.show());

    win.on("close", () => {
      if (win) {
        removeEventListeners(win.webContents, ["did-finish-load"]);
        removeEventListeners(ipcMain, ["print"])
        win = null;
      }
    });

    //console.log(invoice);
    win.webContents.on("did-finish-load", () => {

      win.webContents.send("invoice", invoice);

      ipcMain.on("print", (event, printer) => {
        // console.log("printer", printer);
        // console.log(win.webContents.getPrinters());

        if ((findPrinters(win.webContents.getPrinters(), printer)).length > 0) {
          // console.log('printer found', printer);
          const options = {
            silent: true,
            deviceName: printer
          }

          win.webContents.print(options, (success, errorType) => {
            if (!success) {
              console.error("Printing Erorr:", errorType);
              dialog.showMessageBox({
                  title : "Printing Receipt",
                  message: `Error: ${errorType}`
              })
                .then (() => {
                  win.close();
                });
            }
            else
              win.close();
          });
        }
        else {
          dialog.showMessageBox({
            title : "Printing Receipt",
            message: `Error: Printer, ${printer} not found!`
        })
          .then (() => {
            win.close();
          });
        }

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



function findPrinters (printerList, receiptPrinterName) {
  const printers = printerList.filter(p => p.name === receiptPrinterName);

  return printers;
}
