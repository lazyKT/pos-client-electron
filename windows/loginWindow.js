/**
 login window
 */

const path = require("path");
const {
  BrowserWindow,
  ipcMain
} = require("electron");
const { createCashierWindow } = require("./cashierWindow.js");
const { createInventoryWindow } = require("./inventoryWindow.js");
const { loginUser } = require("../models/user.js")


let win, pageName


exports.createLoginWindow = function loginWindow(parentWindow, from) {

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
      preload: path.join(__dirname, "../preload_scripts/loginPreload.js")
    }
  });

  // page to redirect after successful login
  pageName = from

  win.loadFile(path.join(__dirname, "../views/login.html"));
  // win.openDevTools(); // ## For Debug

  win.once("ready-to-show", () => win.show());

  win.on("close", () => {
    /**
    *** upon the window close, remove all the existing handlers to prevent second handler registration error in the future
    **/
    ipcMain.removeHandler("login-request");

    win = null
  });


  win.webContents.on("did-finish-load", () => {

    /**
     IPC Messages
     */
    ipcMain.on("dismiss-login-window", (e, from) => {
      /**
      *** upon the window close, remove all the existing handlers to prevent second handler registration error in the future
      **/
      ipcMain.removeHandler("login-request");

      if (win) win.close();
    });



    /** user login request */
    ipcMain.on("login-request", (event, args) => {
      try {
        const { username, status } = args;

        if (status === "success") {

          /* login success, redirect to requested page */
          if (win) win.close();

          redirectPage(parentWindow, username);
        }
      }
      catch (error) {
        console.log(error);
      }
    });

  });

}


/**
 Redirect Page after successful login
 **/
function redirectPage (parent) {
  /* redirect page */
  switch(pageName) {
    case "cashier":
      createCashierWindow();
      break;
    case "user":
      // parent.webContents.send("redirect-page", "user");
      parent.loadFile(path.join(__dirname, "../views/user/user.html"));
      break;
    case "inventory":
      createInventoryWindow();
      break;
    default:
      throw new Error("Unknown Page Route!");
  }
}

exports.closeLoginWindow = function closeLoginWindow() {
  if (win) win.close();
}
