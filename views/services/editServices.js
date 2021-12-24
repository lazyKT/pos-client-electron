// DOM Nodes
const cancelButton = document.getElementById('dismiss-window');
const deleteButton = document.getElementById('delete-service');
const editButton = document.getElementById('edit-service');
const errorDiv = document.getElementById('error');
let serverUrl


// clean up
window.onUnload = () => window.editContentAPI.removeListeners();


window.editContentAPI.receive('response-services-data', async data => {
  try {

    serverUrl = localStorage.getItem("serverUrl");
    if (!serverUrl || serverUrl === null)
      throw new Error ("Erorr: failed to get server url");

    await showServices(data._id);

    toggleInputs(data.method);
  }
  catch (error) {

  }
});

// dismiss/close form window
cancelButton.addEventListener('click', () => {
  window.editContentAPI.send('dismiss-form-window', '');
})


// edit/update user
editButton.addEventListener('click', async e => {

  e.preventDefault();
  e.target.setAttribute("disabled", true);
  e.target.innerHTML = "Loading ...";

  try {

    const id = document.getElementById('id')?.value;
    const sId = document.getElementById('serviceId')?.value;
    const sName = document.getElementById('servicename')?.value;
    const price = document.getElementById('price')?.value;
    const remarks= document.getElementById('remarks')?.value;

    if (!id || id === '' ||!sId || sId === '' ||!sName || sName === ''|| !price|| price === ''|| !remarks || remarks=== '' ) {
      throw new Error ("Missing Required Inputs");
    }

    const response = await editServicesById(id, {
      name : sName,
      price,
      remarks
    });
    console.log(response);
    if (response && response.ok) {
      // update opreration successful
      // inform the main process that new data update is done
      console.log(await response.json());
      window.editContentAPI.send('services-form-finish');
    }
    else {
      const { message } = await response.json();
      const error = message ? message : "Error editing services. code: 500";
      showErrorMessage(error);
    }
  }
  catch(error) {
    console.log('Error Fetching Update Services Response', error);
    showErrorMessage(`Application Error: code 300`);
  }
  finally {
    e.target.removeAttribute("disabled");
    e.target.innerHTML = "Edit";
  }
});


deleteButton.addEventListener("click", async e => {
  try {
    e.target.setAttribute("disabled", true);
    e.target.innerHTML = "Loading ...";

    const id = document.getElementById("id")?.value;

    const response = await deleteServicesById (id);

    if (response && response.ok) {
      window.editContentAPI.send('services-form-finish');
    }
    else {
      const { message } = await response.json();
      const errorMessage = message ? message : "Error: deleting services. code 500";
      showErrorMessage(errorMessage);
    }
  }
  catch (error) {
    showErrorMessage(`Application Error: code 300`);
  }
  finally {
    e.target.removeAttribute("disabled");
    e.target.innerHTML = "Delete";
  }
});


async function showServices (id) {
  try {
    const response = await getServicesById(id);

    if (response && response.ok) {
      const emp = await response.json();
      //console.log(emp);
      displayServicesData (emp);
    }
    else {
      const { message } = await response.json();
      const errorMessage = message ? message : "Error: failed to get services data. code 500";
      showErrorMessage(errorMessage);
    }
  }
  catch (error) {
    console.error(error);
    //showErrorMessage(`Application Error: code 300`);
  }
}


function displayServicesData(emp) {

  const id = document.getElementById('id');
  const sId = document.getElementById('serviceId');
  const sName = document.getElementById('servicename');
  const price = document.getElementById('price');
  const remarks = document.getElementById("remarks");
  console.log(emp);

  id.value = emp._id;
  sId.value = emp.serviceId;
  sName.value = emp.name;
  price.value = emp.price;
  remarks.value = emp.remarks;
}


function toggleInputs (method) {
  const inputs = document.querySelectorAll("input");

  inputs.forEach(
    input => {
      if (input.getAttribute("id") != "id" && input.getAttribute("id") != "serviceId") {
        if (method === "PUT")
          input.removeAttribute("readonly");
        else
          input.setAttribute("readonly", true);

      }
    }
  );

  if (method === "PUT") {
    const editButton = document.getElementById("edit-service");
    editButton.style.display = "block";
    const deleteButton = document.getElementById("delete-service");
    deleteButton.style.display = "block";
    // const genderSelect = document.getElementById("gender");
    // genderSelect.removeAttribute("disabled");
  }
  else {
    const editButton = document.getElementById("edit-service");
    editButton.style.display = "none";
    const deleteButton = document.getElementById("delete-service");
    deleteButton.style.display = "none";
    // const genderSelect = document.getElementById("gender");
    // genderSelect.setAttribute("disabled", true);
  }
}


/* Show error message */
function showErrorMessage(message) {

  // clear any error messags
  while (errorDiv.lastChild)
    errorDiv.removeChild(errorDiv.lastChild);

  let errorNode = document.createElement('div');
  errorNode.setAttribute('class', 'alert alert-danger');
  errorNode.setAttribute('role', 'alert');
  errorNode.innerHTML = message;
  errorDiv.appendChild(errorNode);
}


async function getServicesById (id) {
  try {
    const response = await fetch(`${serverUrl}/api/services/${id}`, {
      method: "GET",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      }
    });

    return response;
  }
  catch (error) {

    console.error(error);
  }
}


async function editServicesById (id, data) {
  try {
    const response = await fetch(`${serverUrl}/api/services/${id}`, {
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
    console.error(error);
  }
}


async function deleteServicesById (id){
  try {
    const response = await fetch(`${serverUrl}/api/services/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      }
    });

    return response;
  }
  catch (error) {
    console.error(error);
  }
}
