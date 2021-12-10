/**
 * Clinic Recipt Browser Window
 **/
const path = require('path');
const os = require('os');
const fs = require('fs');
const {
  BrowserWindow,
  ipcMain,
  dialog
} = require ('electron');

const { removeEventListeners } = require('../ipcHelper');


let win


exports.createClinicReciptWindow = function (parentWindow, invoice) {

  const PRINT_MODE_PRODUCTION = 0;
  const PRINT_MODE_TEST = 1;

  if (!win || win === null) {

    win = new BrowserWindow({
      height: 700,
      width: 400,
      parent: parentWindow,
      show: false,
      frame: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload_scripts/clinicReceiptPreload.js')
      }
    });

    win.loadFile(path.join(__dirname, '../views/cashier/clinic_receipt.html'));
    win.openDevTools();

    win.on('close', () => {
      if (win !== null) {
        removeEventListeners (ipcMain, ["print-clinic-invoice"]);
        removeEventListeners (win.webContents, ["did-finish-load"]);
        win = null;
      }
    });

    win.webContents.on('did-finish-load', () => {
      win.webContents.send("clinic-invoice", invoice);


      ipcMain.on("print-clinic-invoice", (event, printOptions) => {
        console.log(printOptions);
        const { name, mode } = printOptions;

        if (mode === PRINT_MODE_TEST) {
          // test mode : print to PDF file
          const pdfPath = path.join(os.homedir(), 'Desktop', 'temp.pdf');
          win.webContents.printToPDF({}).then(data => {
            console.log("Writing PDF ...");
            fs.writeFile(pdfPath, data, (error) => {
              if (error) throw error
              console.log(`Wrote PDF successfully to ${pdfPath}`)
              win.close();
            })
          }).catch(error => {
            console.log(`Failed to write PDF to ${pdfPath}: `, error)
          });
        }
        else if (mode === PRINT_MODE_PRODUCTION) {
          // print with printer
          if ((findPrinters(win.webContents.getPrinters(), name)).length > 0) {
            // console.log('printer found', printer);
            const options = {
              silent: true,
              deviceName: name
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
              message: `Error: Printer, ${name} not found!`
          })
            .then (() => {
              win.close();
            });
          }
        }
        else {
          throw new Error ("Invalid Print Mode!");
        }

      });

    });

  }
}


function findPrinters (printerList, receiptPrinterName) {
  const printers = printerList.filter(p => p.name === receiptPrinterName);

  return printers;
}
