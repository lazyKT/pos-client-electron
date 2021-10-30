/**
# Browser Window for Member Checkout actions
**/

const path = require("path");
const {
  BrowserWindow,
  ipcMain
} = require("electron");



let win



exports.createMemberCheckoutWindow = function (parent) {

  if (!win) {
    win = new BrowserWindow({
      height: 500,
      width: 1200,
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


  win.loadFile("../views/cashier/member_checkout.html");

  win.once("ready-to-show", () => win.show());

  win.on("close", () => { win = null; });
}
