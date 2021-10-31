/**
 Form Window
 */

const path = require("path");
const {
  BrowserWindow,
  ipcMain
} = require("electron");
const {
  createNewUser,
  getAllUsers,
} = require("../models/user.js");

let win


exports.createFormWindow = function createFormWindow(parentWindow, content) {

  win = new BrowserWindow({
    width: 400,
    height: 500,
    parent: parentWindow,
    modal: true,
    show: false,
    backgroundColor: '#ffffff',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "../preload_scripts/formPreload.js")
    }
  });


  /** load view file based on the contents type */
  // switch (content) {
  //
  //   case "user":
  //
  //     break;
  //
  //   case "item":
  //     break;
  //
  //   default: throw new Error("Unknown Contents!");
  //
  // }

  win.setBackgroundColor('#FFFFFF');
  win.loadFile(path.join(__dirname, "../views/user/user_regis.html"));
  // win.openDevTools();


  win.once("ready-to-show", () => win.show());

  win.on("close", () => win = null);


  win.webContents.on("did-finish-load", () => {

    /**
    IPC Messages
    **/

    // close create data window
    ipcMain.on ('dismiss-form-window', () => {
      /**
      *** upon the window close, remove all the existing handlers to prevent second handler registration error in the future
      **/
      ipcMain.removeHandler("create-new-user");  // <======
      if(win) win.close();
    });


    /**
    Create New User
    **/
    ipcMain.handle ("create-new-user", (event, args) => {
      try {
        const response = createNewUser(args);

        if (response == 201) {
          /**
          *** Remove this handler, aware that at this point, we are not in the stage of completing the full handler process,
          *** The create request is success, and now we don't want anything to return back to the renderer, so we cancel the handler.
          *** if we don't cancel the handler, the handler result is pending and somehow, considered not completed,
          *** then we we want to create another "login-request" handler, we will get an error of creating existing handler.
          **/
          ipcMain.removeHandler("create-new-user");  // <======

          // create user successful
          if (win) win.close();

          // send ipc message to renderer process to reload the data
          parentWindow.webContents.send("reload-data", getAllUsers());
        }

        // console.log("after ipcMain.removeHandler(create-new-user)")

        return response;
      }
      catch (error) {
        console.log(error);
      }
    })

  })

}


exports.closeFormWindow = function closeFormWindow() {
  if (win) win.close();
}
