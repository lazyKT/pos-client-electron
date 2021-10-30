console.log('Edit Or Show Item Scripts');

const { ipcRenderer } = require('electron');
const { updateItem } = require('../requests/itemRequests.js');

// DOM Nodes
const cancelButton = document.getElementById('dismiss-window');
const editButton = document.getElementById('edit-item');

if (editButton) editButton.style.display = 'none'; // hide the edit button on the first load

ipcRenderer.on('response-item-data', (e, data) => {
  
  const { item, method } = data;
  const itemId = document.getElementById('item-id');
  const description = document.getElementById('description');
  const location = document.getElementById('location');
  itemId.setAttribute('readonly', true); // user id is not an editable field
  itemId.value = item.id;
  description.value = item.description;
  location.value = item.location;

  if (method === 'GET') {
    // make inputs non-editable
    description.setAttribute('readonly', true);
    location.setAttribute('readonly', true);
  }
  else if (method === 'PUT') {
    // remove the readonly attributes from input
    description.removeAttribute('readonly');
    location.removeAttribute('readonly');
    editButton.style.display = 'block';
  }
});


// edit/update user
editButton.addEventListener('click', async e => {

  e.preventDefault();

  const id = document.getElementById('item-id')?.value;
  const description = document.getElementById('description')?.value;
  const location = document.getElementById('location')?.value;

  if (!id || id === '' || !description || description === '' || !location || location === '')
    return;

  try {
    const response = await updateItem({id, description, location});

    const { status, data } = response;

    if ( data && status === 200) {
      // update opreration successful
      // inform the main process that new data update is done
      ipcRenderer.send('form-data-finish', {method: 'UPDATE', data, type: 'item'});
    }
  }
  catch(error) {
    console.log('Error Fetching Update User Response', error);
  }
});


// dismiss/close form window
cancelButton.addEventListener('click', () => {
  ipcRenderer.send('dismiss-form-window', '');
})
