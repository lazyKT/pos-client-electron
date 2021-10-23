console.log('Edit Or Show User Scripts');

const { ipcRenderer } = require('electron');
const { updateUser } = require('../requests/userRequests.js');

// DOM Nodes
const cancelButton = document.getElementById('dismiss-window');
const editButton = document.getElementById('edit-user');

if (editButton) editButton.style.display = 'none'; // hide the edit button on the first load

ipcRenderer.on('response-user-data', (e, data) => {
  console.log(data);
  const { user, method } = data;
  const userId = document.getElementById('user-id');
  const username = document.getElementById('username');
  const email = document.getElementById('email');
  userId.setAttribute('readonly', true); // user id is not an editable field
  userId.value = user.id;
  username.value = user.username;
  email.value = user.email;

  if (method === 'GET') {
    // make inputs non-editable
    username.setAttribute('readonly', true);
    email.setAttribute('readonly', true);
  }
  else if (method === 'PUT') {
    // remove the readonly attributes from input
    username.removeAttribute('readonly');
    email.removeAttribute('readonly');
    editButton.style.display = 'block';
  }
});


// edit/update user
editButton.addEventListener('click', async e => {

  e.preventDefault();

  const id = document.getElementById('user-id')?.value;
  const username = document.getElementById('username')?.value;
  const email = document.getElementById('email')?.value;

  if (!id || id === '' || !username || username === '' || !email || email === '')
    return;

  try {
    const response = await updateUser({id, username, email});

    const { status, data } = response;

    if ( data && status === 200) {
      // update opreration successful
      // inform the main process that new data update is done
      ipcRenderer.send('form-data-finish', {method: 'UPDATE', data, type: 'user'});
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
