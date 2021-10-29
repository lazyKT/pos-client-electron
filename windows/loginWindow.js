/**
 login window
 */

const path = require("path");
const {
  BrowserWindow,
  ipcMain
} = require("electron");
const { createCashierWindow } = require("./cashierWindow.js");
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
  // win.openDevTools(); ## For Debug

  win.once("ready-to-show", () => win.show());

  win.on("close", () => win = null);


  win.webContents.on("did-finish-load", () => {

    /**
     IPC Messages
     */
    ipcMain.on("dismiss-login-window", (e, from) => {
      if (win) win.close();
      /**
      *** upon the window close, remove all the existing handlers to prevent second handler registration error in the future
      **/
      ipcMain.removeHandler("login-request");
    });



    /** user login request */
    ipcMain.handle("login-request", (event, args) => {
      try {
        const { username, password } = args;

        const loginResponse = loginUser({username, password});

        if (loginResponse.status === 200) {
          /**
          *** Remove this handler, aware that at this point, we are not in the stage of completing the full handler process,
          *** The login request is success, and now we don't want anything to return back to the renderer, so we cancel the handler.
          *** if we don't cancel the handler, the handler result is pending and somehow, considered not completed,
          *** then we we want to create another "login-request" handler, we will get an error of creating existing handler.
          **/
          ipcMain.removeHandler("login-request");

          /* login success, redirect to requested page */
          if (win) win.close();

          redirectPage(parentWindow);
        }

        // console.log("after ipcMain.removeHandler(login-request)")

        // if (loginReponse.status)
        return loginResponse;
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
      parent.webContents.send("redirect-page", "user");
      break;
    default:
      throw new Error("Unknown Page Route!");
  }
}

exports.closeLoginWindow = function closeLoginWindow() {
  if (win) win.close();
}
