console.log('Edit Or Show Item Scripts');

const cancelButton = document.getElementById('dismiss-window');
const editButton = document.getElementById('edit-item');
const errorDiv = document.getElementById('error');
const detailButton = document.getElementById('')

if (editButton) editButton.style.display = 'none'; // hide the edit button on the first load

window.editContentAPI.receive('response-item-data', data => {

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

// dismiss/close form window
cancelButton.addEventListener('click', () => {
  window.editContentAPI.send('dismiss-form-window', '');
})


// edit/update user
editButton.addEventListener('click', async e => {

  e.preventDefault();

  const id = document.getElementById('item-id')?.value;
  const description = document.getElementById('description')?.value;
  const location = document.getElementById('location')?.value;
  try {

    if (!id || id === '' || !description || description === '' || !location || location === '')
      throw new Error("Missing Required Fields");


    const response = await window.editContentAPI.invoke ("edit-item", {id, description, location});

    const { status, data, error } = response;

    if ( data && status === 200) {
      // update opreration successful
      // inform the main process that new data update is done
      window.editContentAPI.send('item-form-data-finish', {method: 'UPDATE', data, type: 'item'});
    }
    else {
      showErrorMessage(error);
    }
  }
  catch(error) {
    console.log('Error Fetching Update Item Response', error);
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