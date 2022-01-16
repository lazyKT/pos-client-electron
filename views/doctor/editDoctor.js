// DOM Nodes
const cancelButton = document.getElementById('dismiss-window');
const deleteButton = document.getElementById('delete-doctor');
const editButton = document.getElementById('edit-doctor');
const errorDiv = document.getElementById('error');
let serverUrl


// clean up
window.onUnload = () => window.editContentAPI.removeListeners();


window.editContentAPI.receive('response-doctor-data', async data => {
  try {

    serverUrl = localStorage.getItem("serverUrl");
    if (!serverUrl || serverUrl === null)
      throw new Error ("Erorr: failed to get server url");
    await displaySpecialization();
    await showDoctor(data._id);
    

    toggleInputs(data.method);
  }
  catch (error) {

  }
});

// dismiss/close form window
cancelButton.addEventListener('click', () => {
  window.editContentAPI.send('dismiss-form-window', '');
})


// edit/update doctor
editButton.addEventListener('click', async e => {

  e.preventDefault();
  e.target.setAttribute("disabled", true);
  e.target.innerHTML = "Loading ...";

  try {

    const id = document.getElementById('id')?.value;
    const dId = document.getElementById('doctorId')?.value;
    const name = document.getElementById('name')?.value;
    const specialization = document.getElementById('specialSelect')?.value;
    

    if (!id || id === '' ||!dId || dId === '' ||!name || name === '' ||!specialization || specialization === '' ) {
      throw new Error ("Missing Required Inputs");
    }

    const response = await editDoctorById(id, {
      name,
      specialization
    
    });
    console.log(response);
    if (response && response.ok) {
      // update opreration successful
      // inform the main process that new data update is done
      console.log(await response.json());
      window.editContentAPI.send('doctor-form-finish');
    }
    else {
      const { message } = await response.json();
      const error = message ? message : "Error editing doctor. code: 500";
      showErrorMessage(error);
    }
  }
  catch(error) {
    console.log('Error Fetching Update Doctor Response', error);
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

    const response = await deleteDoctorById (id);

    if (response && response.ok) {
      window.editContentAPI.send('doctor-form-finish');
    }
    else {
      const { message } = await response.json();
      const errorMessage = message ? message : "Error: deleting doctor. code 500";
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


async function showDoctor (id) {
  try {
    const response = await getDoctorById(id);

    if (response && response.ok) {
      const emp = await response.json();
      //console.log(emp);
      displayDoctorData (emp);
    }
    else {
      const { message } = await response.json();
      const errorMessage = message ? message : "Error: failed to get doctor data. code 500";
      showErrorMessage(errorMessage);
    }
  }
  catch (error) {
    console.error(error);
    //showErrorMessage(`Application Error: code 300`);
  }
}


async function displayDoctorData(emp) {

  const id = document.getElementById('id');
  const dId = document.getElementById('doctorId');
  const name = document.getElementById('name');
  const specialization = document.getElementById('specialSelect');

  
  const { fullname } = emp;

  id.value = emp._id;
  dId.value = emp.doctorId;
  name.value = emp.name;

  specialization.value = emp.specialization;
  
  
}

async function displaySpecialization()
{
  try{

    specialsList = [];
    const response = await fetchSpecializations();

    if (response && response.ok) {
      const emps = await response.json();

      for(let i=0; i < emps.length ; i++)
      {
        specialsList.push(emps[i]['name']);
      }
      //console.log(specialsList);

    }
    else {
      const { message } = await response.json();
      const errorMessage = message ? message : "Error Reloading Data. code 500";
      console.log(errorMessage);
    }
    
    const specialContainer = document.getElementById("specialcontainer");
    let select = document.createElement("select");
    select.name = "specialSelect";
    select.id = "specialSelect";
    select.style=" width:210px; height:30px;";
    
    for (const val of specialsList)
    {
        let option = document.createElement("option");
        option.value = val;
        //console.log(val);
        option.text = val.charAt(0).toUpperCase() + val.slice(1);
        select.appendChild(option);
    }
    
    
 
    specialContainer.appendChild(select);

  }

  catch (error) {
    console.log(error);
    
  }

}


function toggleInputs (method) {
  const inputs = document.querySelectorAll("input");

  inputs.forEach(
    input => {
      if (input.getAttribute("id") != "id" && input.getAttribute("id") != "doctorId"
          && input.getAttribute("id") != "specialization") {
        if (method === "PUT")
          input.removeAttribute("readonly");
        else
          input.setAttribute("readonly", true);

      }
    }
  );

  if (method === "PUT") {
    const editButton = document.getElementById("edit-doctor");
    editButton.style.display = "block";
    const deleteButton = document.getElementById("delete-doctor");
    deleteButton.style.display = "block";
  }
  else {
    const editButton = document.getElementById("edit-doctor");
    editButton.style.display = "none";
    const deleteButton = document.getElementById("delete-doctor");
    deleteButton.style.display = "none";

  }
}

/* To convert the input data to yyyy-mm-dd format*/
function formatDate(input) {
    console.log(input);
    var d = new Date(input),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
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

/* get doctors data by id*/
async function getDoctorById (id) {
  try {
    const response = await fetch(`${serverUrl}/api/doctors/${id}`, {
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

/* edit doctor data by id*/
async function editDoctorById (id, data) {
  try {
    const response = await fetch(`${serverUrl}/api/doctors/${id}`, {
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

/* delete doctor data by id */
async function deleteDoctorById (id){
  try {
    const response = await fetch(`${serverUrl}/api/doctors/${id}`, {
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

/**
# Fetch Specializations with Pagination Properties
**/
async function fetchSpecializations () {
  try {
    
    let url = `${serverUrl}/api/specialization?`;

    

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept" : "application.json"
      }
    });

    return response;
  }
  catch (error) {
    console.error("Error Getting  Specializations/n", error);
  }
}
