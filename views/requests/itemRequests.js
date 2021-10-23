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

exports.createNewItem = async function createNewItem(newItem) {
  try {
    const response = await ipcRenderer.invoke('create-new-item', newItem);

    return response;
  }
  catch (error) {
    console.log('Error Creating New Item', error);
  }
}