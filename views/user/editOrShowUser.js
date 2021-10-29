// DOM Nodes
const cancelButton = document.getElementById('dismiss-window');
const editButton = document.getElementById('edit-user');
const errorDiv = document.getElementById('error');

if (editButton) editButton.style.display = 'none'; // hide the edit button on the first load

window.editContentAPI.receive('response-user-data', data => {

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

// dismiss/close form window
cancelButton.addEventListener('click', () => {
  window.editContentAPI.send('dismiss-form-window', '');
})


// edit/update user
editButton.addEventListener('click', async e => {

  e.preventDefault();

  const id = document.getElementById('user-id')?.value;
  const username = document.getElementById('username')?.value;
  const email = document.getElementById('email')?.value;
  try {

    if (!id || id === '' || !username || username === '' || !email || email === '')
      throw new Error("Missing Required Fields");


    const response = await window.editContentAPI.invoke ("edit-user", {id, username, email});

    const { status, data, error } = response;

    if ( data && status === 200) {
      // update opreration successful
      // inform the main process that new data update is done
      window.editContentAPI.send('form-data-finish', {method: 'UPDATE', data, type: 'user'});
    }
    else {
      showErrorMessage(error);
    }
  }
  catch(error) {
    console.log('Error Fetching Update User Response', error);
    showErrorMessage(error);
  }
});

/* Show error message */
function showErrorMessage(message) {
  let errorNode = document.createElement('div');
  errorNode.setAttribute('class', 'alert alert-danger');
  errorNode.setAttribute('role', 'alert');
  errorNode.innerHTML = message;
  errorDiv.appendChild(errorNode);
}
