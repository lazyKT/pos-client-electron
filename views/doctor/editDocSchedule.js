// DOM Nodes
const cancelButton = document.getElementById('dismiss-window');
const editButton = document.getElementById('edit-doctor');
const errorDiv = document.getElementById('error');
let serverUrl
let workCount = 0;
let id
let scheduleHours = [];
// clean up
window.onUnload = () => window.editContentAPI.removeListeners();


window.editContentAPI.receive('response-doctor-data', async data => {
  try {

    serverUrl = localStorage.getItem("serverUrl");
    if (!serverUrl || serverUrl === null)
      throw new Error ("Erorr: failed to get server url");

    setScheduleHours();

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

editButton.addEventListener('click', () => {
  window.editContentAPI.send('dismiss-form-window', '');
});

/* get doctor list and display doctor data */
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

function checkHours(startTime, endTime)
{
  let sTime = startTime.split(' ')[1];
  let sHour = startTime.split(':')[0];


  let eTime = endTime.split(' ')[1];
  let eHour = endTime.split(':')[0];

  if(sTime == eTime)
  {
    if(eHour > sHour)
      return true;
    else
      return false;
  }
  else if(sTime == "AM" && eTime == "PM")
  {
    return true;
  }
  else
  {
    return false;
  }
}
/*set schedule hours for doctor */
function setScheduleHours(){
  for (let i = 7; i < 20; i++) {
      if (i < 12)
        scheduleHours.push(i + ':00 AM');
      else if (i === 12)
        scheduleHours.push('12:00 PM');
      else
        scheduleHours.push((i % 12) + ':00 PM');
    }
    console.log(scheduleHours);
}

/*  Adding new inputs for working hours */
async function addForm(){
  const addMore = document.getElementById('addButton');
  addMore.disabled = true;
  workCount+= 1;
  const container = document.getElementById("newContainer");
  console.log(container.childElementCount);

  let row1 = document.createElement("div");
  row1.id = "row1";
  row1.class = "row";
  row1.style="border:1px solid black;";

  let values = ["Sunday", "Monday","Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];

  let select = document.createElement("select");
  select.name = "days";
  select.id = "wdays";
  select.style= "margin:10px;";

  for (const val of values)
  {
      let option = document.createElement("option");
      option.value = values.indexOf(val);
      option.text = val.charAt(0).toUpperCase() + val.slice(1);
      select.appendChild(option);
  }

  let label = document.createElement("label");
  label.innerHTML = "Working Day:"
  label.htmlFor = "days";
  label.id = "wLabel";


  row1.appendChild(label).appendChild(select);


  row1.appendChild(document.createTextNode("Start Time"));
    let startselect = document.createElement("select");
    startselect.name = "startselect";
    startselect.id = "startselect";
    startselect.style= "margin:10px;";
    for(const hours of scheduleHours)
    {
      let option1 = document.createElement("option");
      option1.value = hours; 
      option1.text = hours;
      startselect.appendChild(option1);
    }

    row1.appendChild(startselect);

    row1.appendChild(document.createTextNode("End Time"));
    let endselect = document.createElement("select");
    endselect.name = "endselect";
    endselect.id = "endselect" ;
    endselect.style= "margin:10px;";
    for(const hours of scheduleHours)
    {
      let option2 = document.createElement("option");
      option2.value = hours; 
      option2.text = hours;
      endselect.appendChild(option2);
    }

    row1.appendChild(endselect);

  let addBtn = document.createElement('button');
  addBtn.setAttribute('class', 'btn btn-success');
  addBtn.innerHTML = 'Add';
  addBtn.style = "margin:10px; width:100px";
  row1.appendChild(addBtn);
  container.appendChild(row1);


  addBtn.addEventListener('click', e => {


  });

  addBtn.addEventListener('click', async e => {
    try {

      workingday = document.getElementById("wdays")?.value;
      workSTime = document.getElementById('startselect')?.value;
      workETime = document.getElementById('endselect')?.value;
      
      if(checkHours(workSTime, workETime))
      {
      const response = await addDoctorSchedule ( {
        doctorId : id,
        startTime : workSTime, 
        endTime : workETime,
        day : workingday
      });

      if (response && response.ok) {
        console.log("successfully added!");
        //showAlertModal(`New Schedule is successfully created!`, "New Schedule Added!", "success");
      }
      else {
        const { message } = await response.json();
        const errorMessage = message ? message : "Error: adding doctor. code 500";
        showErrorMessage(errorMessage);
      }
    }
    else
    {
      throw new Error("End Time must be Greater than Start Time");
    }
    }
    catch (error) {
      console.log(error);
      showErrorMessage(`Application Error: code 300`);
    }
    
  });

 
}

function clearDataContainer () {
  const dataContainer = document.getElementById('currentContainer');
  while (dataContainer.childElementCount > 1) {
    dataContainer.removeChild(dataContainer.lastChild);
  }
  
  showDoctor(id);
}

/*display doctor data for edit schedules*/
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

  let startTime = workingSch[i].startTime;
  let endTime = workingSch[i].endTime;
  let day = workingSch[i].day;

  let row1 = document.createElement("div");

  row1.id = "row2";
  row1.class = "row";

  let values = ["Sunday", "Monday","Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];


  row1.appendChild(document.createTextNode("Working Day:"));
  let dayLabel = document.createElement("label");
  dayLabel.innerHTML =  values[day];
  dayLabel.id = "wLabel";
  dayLabel.style = "margin:10px; background-color:#CDCFD6; width:100px; text-align: center; padding:5px;";

  row1.appendChild(dayLabel);

  row1.appendChild(document.createTextNode("Start Time:"));
  let input1 = document.createElement("label");
  input1.id = "startTime" + workCount;

  input1.style = "margin:10px; background-color:#CDCFD6; width:110px; text-align: center; padding:5px;";
  input1.innerHTML = startTime;
  
  row1.appendChild(input1);


  row1.appendChild(document.createTextNode("End Time:"));
  let input2 = document.createElement("label");
  input2.id = "endTime" + workCount;

  input2.style = "margin:10px; background-color:#CDCFD6; width:110px; text-align: center; padding:5px;";
  input2.innerHTML = endTime;


  row1.appendChild(input2);

  const removeBtn = document.createElement('button');
  removeBtn.setAttribute('class', 'btn btn-danger');
  removeBtn.innerHTML = 'Remove';
  removeBtn.style = "margin:10px; width:100px";
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
      for(i=0; i< 7; i++){
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
    
  }
  else {
    const editButton = document.getElementById("edit-doctor");
    editButton.style.display = "none";
    

  }
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

async function addDoctorSchedule(data)
{
  try {
    const response = await fetch(`${serverUrl}/api/doctors/add-schedule`, {
      method: "PUT",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      },
      body: JSON.stringify(data)

    });
    console.log(response);

    return response;
  }
  catch (error) {
    console.error(error);
  }
}
