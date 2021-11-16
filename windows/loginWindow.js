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
const AppConfig = require("../config");

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

  win.once("ready-to-show", () => win.show());

  win.on("close", () => {

    removeListeners(["dismiss-login-window", "login-request"]);
    removeEmitters();

    win = null
  });


  win.webContents.on("did-finish-load", () => {

    win.webContents.send("server-addr", AppConfig.serverURL);

    /**
     IPC Messages
     */
    ipcMain.on("dismiss-login-window", (e, from) => {
      if (win) win.close();
    });



    /** user login request */
    ipcMain.on("login-request", (event, args) => {
      try {
        const { name, _id, level } = args;
        if (parseInt(level) === 3) {
          /* level 3 emp has authorities on whole system */
          allowAcess(win, parentWindow, name, _id);
        }
        else if (parseInt(level) === 2) {
          /* level 2 employee cannot access manage user page **/
          if (pageName === "user") {
            send401Message(event.sender);
          }
          else {
            allowAcess(win, parentWindow, name, _id);
          }
        }
        else {
          /** level 1 employee can only access cashier **/
          if (pageName === "cashier") {
            allowAcess(win, parentWindow, name, _id);
          }
          else {
            send401Message(event.sender);
          }
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
function redirectPage (parent, name, _id) {
  /* redirect page */
  switch(pageName) {
    case "cashier":
      createCashierWindow(name, _id);
      break;
    case "user":
      parent.loadFile(path.join(__dirname, "../views/user/user.html"));
      break;
    case "inventory":
      createInventoryWindow(name, _id);
      break;
    default:
      throw new Error("Unknown Page Route!");
  }
}


function allowAcess (win, parentWindow, username, _id) {

  if (win) win.close();

  redirectPage(parentWindow, username, _id);
}


/** send permission denied message to rendere */
function send401Message (emitter) {
  emitter.send("access-denied", "You don't have permission to access the contents.");
}


/***
CLEAN UP
***/
function removeListeners (listeners) {
  try {
    listeners.forEach(
      listener => {
        const func = ipcMain.listeners(listener)[0];
        if (func)
          ipcMain.removeListener(listener, func);
      }
    )
  }
  catch (error) {
    console.error("Error Removing Event Listeners at loginWindow\n", erorr);
  }
}

function removeEmitters () {
  try {
    if (win) {
      win.webContents.removeListener("did-finish-load", win.webContents.listeners("did-finish-load")[0]);
    }
  }
  catch (error) {
    console.error("Error Removing Event Emitters at loginWindow\n", error);
  }
}
