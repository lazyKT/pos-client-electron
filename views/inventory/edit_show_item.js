console.log('Edit Or Show Item Scripts');

const cancelButton = document.getElementById('dismiss-window');
const editButton = document.getElementById('edit-item');
const errorDiv = document.getElementById('error');
const detailButton = document.getElementById('')

if (editButton) editButton.style.display = 'none'; // hide the edit button on the first load

window.editContentAPI.receive('response-edit-item-data', async data => {

  const { _id, method } = data;
  console.log(_id, method);
  const itemId = document.getElementById('item-id');
  const description = document.getElementById('description');
  const dateAlert = document.getElementById('dateAlert');
  const quantityAlert = document.getElementById('quantityAlert');
  const location = document.getElementById('location');

  try {
    const response = await getTagById(_id);

    if (response.ok) {
      const item = await response.json();

      itemId.value = item._id;
      description.value = item.name;
      dateAlert.value = item.expiryDateAlert;
      quantityAlert.value = item.lowQtyAlert;
      location.value = item.location;

      if (method === 'view') {
        // make inputs non-editable
        description.setAttribute('readonly', true);
        dateAlert.setAttribute('readonly', true);
        quantityAlert.setAttribute('readonly', true);
        location.setAttribute('readonly', true);
        editButton.style.display = 'none';
      }
      else if (method === 'edit') {
        // remove the readonly attributes from input
        description.removeAttribute('readonly');
        dateAlert.removeAttribute('readonly');
        quantityAlert.removeAttribute('readonly');
        location.removeAttribute('readonly');
        editButton.style.display = 'block';
      }
    }
    else {
      const { message } = await response.json();
      if (message)
        alert ("Error Fetching Category Details", message);
      else
        alert ("Error Fetching Category Details. code: 500");
    }
  }
  catch (error) {
    alert ("Error Fetching Category Details. Code: null");
  }
});

// dismiss/close form window
cancelButton.addEventListener('click', () => {
  window.editContentAPI.send('dismiss-edit-item-form-window', '');
})


// edit/update user
editButton.addEventListener('click', async e => {

  try {

    e.preventDefault();

    const id = document.getElementById('item-id')?.value;
    const description = document.getElementById('description')?.value;
    const dateAlert = document.getElementById('dateAlert')?.value;
    const quantityAlert = document.getElementById('quantityAlert')?.value;
    const location = document.getElementById('location')?.value;

    if (!id || id === '' || !description || description === '' || !dateAlert || dateAlert === '' || !quantityAlert || quantityAlert === '' || !location || location === '')
      throw new Error("Missing Required Fields");


    const response = await editTagById (id, {
      name : description,
      expiryDateAlert: dateAlert,
      lowQtyAlert: quantityAlert,
      location
    });

    if (response.ok) {
      const json = await response.json();
      console.log(json);
      window.editContentAPI.send('item-form-data-finish', {method: 'UPDATE', data: json, type: 'item'});
    }
    else {
      const { message } = await response.json();
      if (message)
        showErrorMessage(message);
      else
        showErrorMessage("Internal Server Error");
    }

    // const { status, data, error } = response;
    //
    // if ( data && status === 200) {
    //   // update opreration successful
    //   // inform the main process that new data update is done

    // }
    // else {
    //   showErrorMessage(error);
    // }
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


/***********************************************************************
####################### Network Requests ###############################
***********************************************************************/
async function getTagById (id) {
  try {
    const response = await fetch(`http://127.0.0.1:8080/api/tags/${id}`, {
      method: "GET",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      }
    });

    return response;
  }
  catch (error) {
    console.error("Error Getting Tag By Id", error);
  }
}


/** Edit/Update Tag **/
async function editTagById (id, data) {
  try {
    const response = await fetch(`http://127.0.0.1:8080/api/tags/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      },
      body: JSON.stringify(data)
    });

    return response;
  }
  catch (error) {
    console.error("Error Editing Tag By Id", error);
  }
}
