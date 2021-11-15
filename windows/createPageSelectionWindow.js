/**
 * Select Page Window
 */

const path = require("path");
const{
    BrowserWindow,
    ipcMain
} = require("electron");

let win, pageName

exports.createPageSelectionWindow = function pageSelectionWindow(parentWindow, from) {
    
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
            preload: path.join(__dirname, "../preload_scripts/selectPage.js")
        }
    });

    //redirect to login window after choosing
    pageName = from

    win.loadFile(path.join(__dirname, "../views/selectPage.html"));

    win.once("ready-to-show", () => win.show());
}