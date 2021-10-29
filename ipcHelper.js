/**
 handle ipc main events
 */

const { ipcMain } = require("electron");
const { createLoginWindow, closeLoginWindow } = require("./windows/loginWindow.js")


ipcMain.on("login", (e, from) => {
  console.log("login request received")
  createLoginWindow();
});
