/*
 * Create New User
 **/
console.log('user_regis.js running...');

const { ipcRenderer } = require('electron');

const { createNewUser } = require('../requests/userRequests.js')

// DOM Nodes
const cancelBtn = document.getElementById('dismiss-window');
const createBtn = document.getElementById('create-user');


// close create user window
cancelBtn.addEventListener('click', () => {
  ipcRenderer.send('dismiss-form-window', '');
});


createBtn.addEventListener('click', async (e) => {
  // prevent default behaviour on form submit
  e.preventDefault();

  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!username && username === '' || !email && email === '' || !password && password === '')
    return;

  try {
    // make create new user request to main process
    const response = await createNewUser({username, email, password});

    console.log(response);
    if (response === 201) {
      // inform the main process that new data creation is done
<<<<<<< HEAD
      ipcRenderer.send('create-data-finish', 'user');
=======
      ipcRenderer.send('form-data-finish', {method: 'CREATE', data: {username}, type: 'user'});
>>>>>>> d8cfe81f5458e2d3a902a2c1acd614b691e2ae10
    }
  }
  catch (error) {
    console.log('Error Fetching Create-New-User Response', error);
  }
});
