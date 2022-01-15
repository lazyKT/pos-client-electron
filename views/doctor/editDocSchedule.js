// DOM Nodes
const cancelButton = document.getElementById('dismiss-window');

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

editButton.addEventListener('click', () => {
  window.editContentAPI.send('dismiss-form-window', '');
})




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

//convert time format
function timeConvert (time) {
  // Check correct time format and split into components
  time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

  if (time.length > 1) { // If time format correct
    time = time.slice (1);  // Remove full string match value
    time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
    time[0] = time[0] < 10 ? '0' + time[0] : time[0];
  }
  return time.join (''); // return adjusted time or original string
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
    select.style= "margin:10px;"
 
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
    let input1 = document.createElement("input");
    input1.type = "time";
    input1.name = "startTime";
    input1.id = "startTime";
    input1.style = "margin:10px; width:110px;";
    row1.appendChild(input1);


    row1.appendChild(document.createTextNode("End Time"));
    let input2 = document.createElement("input");
    input2.type = "time";
    input2.name = "endTime";
    input2.id = "endTime";
    input2.style = "margin:10px; width:110px;";
    
    row1.appendChild(input2);

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

        workingday = document.getElementById("wdays").value;
        workSTime = document.getElementsByName("startTime")[0].value;
        workETime = document.getElementsByName('endTime')[0].value;
        if (workETime < workSTime)
        {
          throw new Error("End Time must be Greater than Start Time");
        }
        console.log(workSTime);
        workSTime = timeConvert(workSTime);
        workETime = timeConvert(workETime);

        


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
      catch (error) {
        console.log(error);
        showErrorMessage(`Application Error: code 300`);
      }
      finally {
        // for(i=0; i< 6; i++){
        // row1.removeChild(row1.lastChild);
        // }
        // row1.style ="border:0px;"
        // console.log(row1.childElementCount);
        // workCount--;
        // clearDataContainer();
        // addMore.disabled = false;
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
 
    // let select = document.createElement("select");
    // select.name = "days";
    // select.id = "days" +workCount;
 
    // for (const val of values)
    // {
    //     let option = document.createElement("option");
    //     option.value = values.indexOf(val);
    //     option.text = val.charAt(0).toUpperCase() + val.slice(1);
    //     select.appendChild(option);
    // }
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
    //var convertedTime = moment(startTime, 'hh:mm A').format('HH:mm');

    //input1.value = startTime;
    row1.appendChild(input1);


    row1.appendChild(document.createTextNode("End Time:"));
    let input2 = document.createElement("label");
    input2.id = "endTime" + workCount;
    input2.style = "margin:10px; background-color:#CDCFD6; width:110px; text-align: center; padding:5px;";
    input2.innerHTML = endTime;
    //var convertedTime1 = moment(endTime, 'hh:mm A').format('HH:mm');
    //input2.value = endTime;

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

