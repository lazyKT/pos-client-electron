// DOM Nodes
const cancelButton = document.getElementById('dismiss-window');
const deleteButton = document.getElementById('delete-user');
const editButton = document.getElementById('edit-user');
const errorDiv = document.getElementById('error');
let serverUrl


// clean up
window.onUnload = () => window.editContentAPI.removeListeners();


window.editContentAPI.receive('response-user-data', async data => {
  try {

    serverUrl = localStorage.getItem("serverUrl");
    if (!serverUrl || serverUrl === null)
      throw new Error ("Erorr: failed to get server url");

    await showUser(data._id);

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

    const id = document.getElementById('user-id')?.value;
    const username = document.getElementById('username')?.value;
    const fName = document.getElementById('fName')?.value;
    const mobile = document.getElementById("mobile")?.value;
    const level = document.getElementById("level")?.value;

    if (!id || id === '' || !username || username === '' || !fName || fName === '' || !mobile || mobile === '' || !level || level === '')
      throw new Error("Missing Required Fields");

    const response = await editUserById(id, {
      level: parseInt(level),
      fullName: fName,
      username, mobile
    });

    if (response && response.ok) {
      // update opreration successful
      // inform the main process that new data update is done
      console.log(await response.json());
      window.editContentAPI.send('form-data-finish');
    }
    else {
      const { message } = await response.json();
      const error = message ? message : "Error editing user. code: 500";
      showErrorMessage(error);
    }
  }
  catch(error) {
    console.log('Error Fetching Update User Response', error);
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

    const id = document.getElementById("user-id")?.value;

    const response = await deleteUserById (id);

    if (response && response.ok) {
      window.editContentAPI.send('form-data-finish');
    }
    else {
      const { message } = await response.json();
      const errorMessage = message ? message : "Error: deleting user. code 500";
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


async function showUser (id) {
  try {
    const response = await getUserById(id);

    if (response && response.ok) {
      const emp = await response.json();
      console.log(emp);
      displayEmployeeData (emp);
    }
    else {
      const { message } = await response.json();
      const errorMessage = message ? message : "Error: failed to get user data. code 500";
      showErrorMessage(errorMessage);
    }
  }
  catch (error) {
    showErrorMessage(`Application Error: code 300`);
  }
}


function displayEmployeeData(emp) {

  const id = document.getElementById('user-id');
  const username = document.getElementById('username');
  const fName = document.getElementById('fName');
  const mobile = document.getElementById("mobile");
  const level = document.getElementById("level");

  const { fullName } = emp;

  id.value = emp._id;
  username.value = emp.username;
  fName.value = fullName ? fullName : "";
  mobile.value = emp.mobile;
  level.value = parseInt(emp.level);
}


function toggleInputs (method) {
  const inputs = document.querySelectorAll("input");

  inputs.forEach(
    input => {
      if (input.getAttribute("id") != "user-id") {
        if (method === "PUT")
          input.removeAttribute("readonly");
        else
          input.setAttribute("readonly", true);

      }
    }
  );

  if (method === "PUT") {
    const editButton = document.getElementById("edit-user");
    editButton.style.display = "block";
    const deleteButton = document.getElementById("delete-user");
    deleteButton.style.display = "block";
    const levelSelect = document.getElementById("level");
    levelSelect.removeAttribute("disabled");
  }
  else {
    const editButton = document.getElementById("edit-user");
    editButton.style.display = "none";
    const deleteButton = document.getElementById("delete-user");
    deleteButton.style.display = "none";
    const levelSelect = document.getElementById("level");
    levelSelect.setAttribute("disabled", true);
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


async function getUserById (id) {
  try {
    const response = await fetch(`${serverUrl}/api/employees/${id}`, {
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


async function editUserById (id, data) {
  try {
    const response = await fetch(`${serverUrl}/api/employees/${id}`, {
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


async function deleteUserById (id){
  try {
    const response = await fetch(`${serverUrl}/api/employees/${id}`, {
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
