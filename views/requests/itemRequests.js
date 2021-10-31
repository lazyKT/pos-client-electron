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

exports.getAllDetailItems = async function getAllDetailItems() {
  try {
    const res = await ipcRenderer.invoke('get-all-detail-items', '');
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

exports.updateItem = async function updateItem(item) {
  try {
    const response = await ipcRenderer.invoke('update-item', item);

    return response;
  }
  catch(error) {
    console.log('Error Updating item', error);
  }
}


exports.searchItemRequest = async function searchItem(q) {
  try {
    const response = await ipcRenderer.invoke('search-data', {data: 'item', q});

    return response;
  }
  catch(error) {
    console.log('Error Searching item', error);
  }
}