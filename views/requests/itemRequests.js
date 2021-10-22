const { ipcRenderer } = require('electron');

exports.getAllItems = async function getAllItems() {
  try {
    const res = await ipcRenderer.invoke('get-all-items', '');
    console.log(res);
    return res;
  }
  catch(error) {
    console.log(error);
  }
}