// DOM Nodes
const cancelButton = document.getElementById('dismiss-window');
const deleteButton = document.getElementById('delete-patient');
const editButton = document.getElementById('edit-patient');
const errorDiv = document.getElementById('error');
let serverUrl


// clean up
window.onUnload = () => window.editContentAPI.removeListeners();


window.editContentAPI.receive('response-patient-data', async data => {
  try {

    serverUrl = localStorage.getItem("serverUrl");
    if (!serverUrl || serverUrl === null)
      throw new Error ("Erorr: failed to get server url");

    await showPatient(data._id);

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
    const pId = document.getElementById('patientId')?.value;
    const fName = document.getElementById('fullname')?.value;
    const age = document.getElementById('age')?.value;
    const gender= document.getElementById('gender')?.value;
    const mobile = document.getElementById("mobile")?.value;
    const address = document.getElementById("address")?.value;
    const allergies= document.getElementById('allergies')?.value;

    if (!id || id === '' ||!pId || pId === '' ||!fullname || fullname === ''|| !age || age === ''|| !gender || gender === '' || !mobile || mobile === '' || !address || address === '' || !allergies || allergies === '') {
      throw new Error ("Missing Required Inputs");
    }

    const response = await editPatientById(id, {
      pId,
      fullname,
      age,
      gender,
      mobile,
      address,
      allergies
    });

    if (response && response.ok) {
      // update opreration successful
      // inform the main process that new data update is done
      console.log(await response.json());
      window.editContentAPI.send('form-data-finish');
    }
    else {
      const { message } = await response.json();
      const error = message ? message : "Error editing patient. code: 500";
      showErrorMessage(error);
    }
  }
  catch(error) {
    console.log('Error Fetching Update Patient Response', error);
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

    const response = await deletePatientById (id);

    if (response && response.ok) {
      window.editContentAPI.send('form-data-finish');
    }
    else {
      const { message } = await response.json();
      const errorMessage = message ? message : "Error: deleting patient. code 500";
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


async function showPatient (id) {
  try {
    const response = await getPatientById(id);

    if (response && response.ok) {
      const emp = await response.json();
      //console.log(emp);
      displayPatientData (emp);
    }
    else {
      const { message } = await response.json();
      const errorMessage = message ? message : "Error: failed to get patient data. code 500";
      showErrorMessage(errorMessage);
    }
  }
  catch (error) {
    console.error(error);
    //showErrorMessage(`Application Error: code 300`);
  }
}


function displayPatientData(emp) {

  const id = document.getElementById('id');
  const pId = document.getElementById('patientId');
  const fName = document.getElementById('fullname');
  const age = document.getElementById('age');
  const gender = document.getElementById("gender");
  const mobile = document.getElementById("mobile");
  const address = document.getElementById("address");
  const allergies = document.getElementById("allergies");

  const { fullName } = emp;

  id.value = emp._id;
  pId.value = emp.patientId;
  fName.value = emp.fullname;
  age.value = parseInt(emp.age);
  gender.value = emp.gender;
  mobile.value = emp.mobile;
  address.value = emp.address;
  allergies.value = emp.allergies;
}


function toggleInputs (method) {
  const inputs = document.querySelectorAll("input");

  inputs.forEach(
    input => {
      if (input.getAttribute("id") != "id") {
        if (method === "PUT")
          input.removeAttribute("readonly");
        else
          input.setAttribute("readonly", true);

      }
    }
  );

  if (method === "PUT") {
    const editButton = document.getElementById("edit-patient");
    editButton.style.display = "block";
    const deleteButton = document.getElementById("delete-patient");
    deleteButton.style.display = "block";
    const genderSelect = document.getElementById("gender");
    genderSelect.removeAttribute("disabled");
  }
  else {
    const editButton = document.getElementById("edit-patient");
    editButton.style.display = "none";
    const deleteButton = document.getElementById("delete-patient");
    deleteButton.style.display = "none";
    const genderSelect = document.getElementById("gender");
    genderSelect.setAttribute("disabled", true);
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


async function getPatientById (id) {
  try {
    const response = await fetch(`${serverUrl}/api/patients/${id}`, {
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


async function editPatientById (id, data) {
  try {
    const response = await fetch(`${serverUrl}/api/patients/${id}`, {
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


async function deletePatientById (id){
  try {
    const response = await fetch(`${serverUrl}/api/patients/${id}`, {
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
