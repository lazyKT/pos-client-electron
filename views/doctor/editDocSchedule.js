// DOM Nodes
const cancelButton = document.getElementById('dismiss-window');
const deleteButton = document.getElementById('delete-doctor');
const editButton = document.getElementById('edit-doctor');
const errorDiv = document.getElementById('error');
let serverUrl
let workCount = 0;
let id
// clean up
window.onUnload = () => window.editContentAPI.removeListeners();


window.editContentAPI.receive('response-doctor-data', async data => {
  try {

    serverUrl = localStorage.getItem("serverUrl");
    if (!serverUrl || serverUrl === null)
      throw new Error ("Erorr: failed to get server url");

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


// edit/update doctor //need to be updated - M
editButton.addEventListener('click', async e => {

  e.preventDefault();
  e.target.setAttribute("disabled", true);
  e.target.innerHTML = "Loading ...";

  try {


    const name = document.getElementById('name')?.value;
    const workingSch = document.getElementById('workingSchedule')?.value;


    //const specialization = document.getElementById('specialization')?.value;


    if (!id || id === '' || !name || name === '' ||!workingSch || workingSch === '' ) {
      throw new Error ("Missing Required Inputs");
    }

    const response = await editDoctorById(id, {
      name,
      specialization,

    });
    console.log(response);
    if (response && response.ok) {
      // update opreration successful
      // inform the main process that new data update is done
      console.log(await response.json());
      window.editContentAPI.send('doctor-form-finish');
    }
    else {
      const errorMessage = await getErrorMessageFromResponse(response);
      showErrorMessage(errorMessage);
    }
  }
  catch(error) {
    console.log('Error Fetching Update Doctor Response', error);
    showErrorMessage(error.message);
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
    // console.error(error);
    showErrorMessage(error.message);
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

/*  Adding new inputs for working hours */
async function addForm(event){
  workCount+= 1;
  const container = document.getElementById("newContainer");
  console.log(container.childElementCount);

  const row1 = document.createElement("div");
  row1.id = "row1";
  row1.class = "row";

  const values = ["Sunday", "Monday","Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];

  const select = document.createElement("select");
  select.name = "days";
  select.id = "days" +workCount;

  for (const val of values)
  {
      const option = document.createElement("option");
      option.value = values.indexOf(val);
      option.text = val.charAt(0).toUpperCase() + val.slice(1);
      select.appendChild(option);
  }

  const label = document.createElement("label");
  label.innerHTML = "Working Days: "
  label.htmlFor = "days";
  label.id = "wLabel";


  row1.appendChild(label).appendChild(select);


  row1.appendChild(document.createTextNode("Start Time"));
  let input1 = document.createElement("input");
  input1.type = "time";
  input1.name = "startTime";
  input1.id = "startTime" + workCount;
  input1.style = "margin:10px;";
  row1.appendChild(input1);


  row1.appendChild(document.createTextNode("End Time"));
  let input2 = document.createElement("input");
  input2.type = "time";
  input2.name = "endTime";
  input2.id = "endTime" + workCount;
  input2.style = "margin:10px;";

  row1.appendChild(input2);

  let removeBtn = document.createElement('button');
  removeBtn.setAttribute('class', 'btn btn-danger');
  removeBtn.innerHTML = 'Remove';
  removeBtn.style = "margin:10px;";
  row1.appendChild(removeBtn);
  container.appendChild(row1);


  removeBtn.addEventListener('click', e => {
    for(i=0; i< 6; i++){
      row1.removeChild(row1.lastChild);
    }
    console.log(row1.childElementCount);
    workCount--;

  });
}



function displayDoctorData(emp) {


  const name = document.getElementById('name');
  const container = document.getElementById('currentContainer');

  const { fullname } = emp;

  id =emp._id;
  name.innerHTML = "Edit Doctor " + emp.name + " 's Schedule";
  const workingSch = emp.workingSchedule;
  console.log(workingSch.length);
  for (let i = 0; i < workingSch.length ; i++)
  {
    const startTime = workingSch[i].startTime;
    const endTime = workingSch[i].endTime;
    const day = workingSch[i].day;

    const row1 = document.createElement("div");
    row1.id = "row2";
    row1.class = "row";


    const values = ["Sunday", "Monday","Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];

    const select = document.createElement("select");
    select.name = "days";
    select.id = "days" +workCount;

    for (const val of values)
    {
        const option = document.createElement("option");
        option.value = values.indexOf(val);
        option.text = val.charAt(0).toUpperCase() + val.slice(1);
        select.appendChild(option);
    }

    const label = document.createElement("label");
    label.innerHTML = "Working Days: ";
    label.htmlFor = "days";
    label.id = "wLabel";


    select.value = day;


    row1.appendChild(label).appendChild(select);


    row1.appendChild(document.createTextNode("Start Time"));
    let input1 = document.createElement("input");
    input1.type = "time";
    input1.name = "startTime";
    input1.id = "startTime" + workCount;
    input1.style = "margin:10px;";
    const convertedTime = moment(startTime, 'hh:mm A').format('HH:mm');

    input1.value = convertedTime;
    row1.appendChild(input1);


    row1.appendChild(document.createTextNode("End Time"));
    let input2 = document.createElement("input");
    input2.type = "time";
    input2.name = "endTime";
    input2.id = "endTime" + workCount;
    input2.style = "margin:10px;";
    const convertedTime1 = moment(endTime, 'hh:mm A').format('HH:mm');
    input2.value = convertedTime1;

    row1.appendChild(input2);

    const removeBtn = document.createElement('button');
    removeBtn.setAttribute('class', 'btn btn-danger');
    removeBtn.innerHTML = 'Remove';
    removeBtn.style = "margin:10px;";
    row1.appendChild(removeBtn);
    container.appendChild(row1);


    removeBtn.addEventListener('click', async e => {
      try {
        e.target.setAttribute("disabled", true);
        e.target.innerHTML = "Loading ...";


        const response = await deleteDoctorSchedule ( {
          doctorId : id,
          startTime,
          endTime,
          day
        });

        if (response && response.ok) {
          console.log("successfully removed!");
        }
        else {
          const { message } = await response.json();
          const errorMessage = message ? message : "Error: deleting doctor. code 500";
          showErrorMessage(errorMessage);
        }
      }
      catch (error) {
        console.log(error);
        showErrorMessage(`Application Error: code 300`);
      }
      finally {
        for(i=0; i< 6; i++){
        row1.removeChild(row1.lastChild);
        }

        workCount--;
      }



    });
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


/**
 * show appropriate error base on network response status
 * @param -> response (promise)
 * @return -> error message (string)
 **/
async function getErrorMessageFromResponse (response) {
	let errorMessage = "";
	try {
		switch (response.status) {
			case 400:
				const { message } = await response.json();
				errorMessage = message;
				break;
			case 404:
				errorMessage = "Server EndPoint Not Found!";
				break;
			case 500:
				errorMessage = "Internal Server Error";
				break;
			default:
				errorMessage = "Network Connection Error";
		}
	}
	catch (error) {
		console.error("getErrorMessageFromResponse()", error);
		errorMessage = "Application Error. Contact Administrator.";
	}

	return errorMessage;
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

/* delete doctor schedule by id */
async function deleteDoctorSchedule(data){
  try {
    const response = await fetch(`${serverUrl}/api/doctors/remove-schedule`, {
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
