/*
 * Create New Item
 
console.log('item_regis.js running...');

const { ipcRenderer } = require('electron');

const { createNewItem } = require('../requests/itemRequests.js')

// DOM Nodes
const cancelBtn = document.getElementById('dismiss-window');
const createBtn = document.getElementById('create-item');


// close create user window
cancelBtn.addEventListener('click', () => {
  ipcRenderer.send('dismiss-form-window', '');
});


createBtn.addEventListener('click', async (e) => {
  // prevent default behaviour on form submit
  e.preventDefault();

  const description = document.getElementById('description').value;
  const expireDate = document.getElementById('expireDate').value;
  const quantity = document.getElementById('quantity').value;
  const location = document.getElementById('location').value;

  if (!description && description === '' || !expireDate && expireDate === '' || !quantity && quantity === '' || !location && location === '')
    return;

  try {
    // make create new item request to main process
    const response = await createNewItem({description, expireDate, quantity, location});
    
    if (response === 201) {
      // inform the main process that new data creation is done
      ipcRenderer.send('form-data-finish', {method: 'CREATE', data: {description}, type: 'item'});
    }
  }
  catch (error) {
    console.log('Error Fetching Create-New-Item Response', error);
  }
});
*/
