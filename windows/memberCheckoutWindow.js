/**
# Browser Window for Member Checkout actions
**/

const path = require("path");
const {
  BrowserWindow,
  ipcMain
} = require("electron");

const {
  searchMembers,
  getMemberById
} = require("../models/member.js");


let win



exports.createMemberCheckoutWindow = function (parent) {

  if (!win) {
    win = new BrowserWindow({
      height: 500,
      width: 1000,
      modal: true,
      parent: parent,
      show: false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(__dirname, "../preload_scripts/memberCheckoutPreload.js")
      }
    });
  }


  win.loadFile(path.join(__dirname, "../views/cashier/member_checkout.html"));
  // win.openDevTools();

  win.once("ready-to-show", () => win.show());

  win.on("close", () => {
    win = null;
  });


  win.webContents.on("did-finish-load", () => {

    /**
    IPC Messages
    **/

    // close window
    ipcMain.on("close-member-window", () => {
      // remove handler
      ipcMain.removeHandler("search-members");
      if(win) win.close();
    });


    /** search members by keyword */
    ipcMain.handle("search-members", (event, args) => {
      const response = searchMembers(args);

      return response;
    });


    /** select member **/
    ipcMain.on("select-member", (event, args) => {
      const { id } = args;

      const member = getMemberById(id);

      if (!member || member === null)
        throw new Error ("Invalid Member with id" + id);

      ipcMain.removeHandler("search-members");

      if (win)  win.close();

      parent.webContents.send("member-select", member);
    });

  });

}
