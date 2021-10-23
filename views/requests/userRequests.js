const { ipcRenderer } = require('electron');

exports.getAllUsers = async function getAllUsers() {
  try {
    const res = await ipcRenderer.invoke('get-all-users', '');

    return res;
  }
  catch(error) {
    console.log('Error Fetching All Uses', error);
  }
}


exports.createNewUser = async function createNewUser(newUser) {
  try {
    const response = await ipcRenderer.invoke('create-new-user', newUser);

    return response;
  }
  catch(error) {
    console.log('Error Creating New User', error);
  }
}


exports.updateUser = async function updateUser(user) {
  try {
    const response = await ipcRenderer.invoke('update-user', user);

    return response;
  }
  catch(error) {
    console.log('Error Updating User', error);
  }
}
