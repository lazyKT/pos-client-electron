const { ipcRenderer } = require('electron');

exports.getAllUsers = async function getAllUsers() {
  try {
    const res = await ipcRenderer.invoke('get-all-users', '');
    console.log(res);
    return res;
  }
  catch(error) {
    console.log(error);
  }
}
