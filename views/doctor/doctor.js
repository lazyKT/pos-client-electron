let reloadStatus = "ready";
// for pagination
let limit = 10;
let page = 1;
let order = 1;

let sort = 'fullname';
let  totalDoctors, numPages;
let serverURL, empName;
let filtering = false;
let counter = 1;


let workCount = 0;
let scheduleHours = [];
// DOM Nodes
window.onload = async () => {

  try {
    const loadingSpinner = document.getElementById("loading-spinner");

    loadDataFromLocalStorage();
    displayLoginInformation();
    displaySpecialization();
    setScheduleHours();



    await reloadData({});
    await createPaginationButtons();
  }
  catch (error) {
    showAlertModal(error.message, "Error!", "error");
  }
}

/**
# Load Datasource From LocalStorage
**/
function loadDataFromLocalStorage () {
  // get server URL

  serverURL = localStorage.getItem("serverUrl");

  if (!serverURL || serverURL === null)
    throw new Error ("Application Error: Failed to get Server URL.");

  const emp = JSON.parse(localStorage.getItem("user"));
  if (!emp || emp === null || !emp.name || emp.name === null)
    throw new Error ("Application Error: Failed to fetch Login User!");
  empName = emp.name;
}


/**
# Display Header Infomation: Login Name & Login Time
**/
function displayLoginInformation () {
  const loginName = document.getElementById("login-name");
  loginName.innerHTML = empName;

  const loginTime = document.getElementById("login-time");
  const now = new Date();
  loginTime.innerHTML = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
}



window.api.receive('reload-data', async (data) => {

  console.log("reload-data from ipc", reloadStatus);
  if (reloadStatus === 'ready') {
      await reloadData();
  }
});

function refreshPage () {
  window.location.reload();
}


/**
# Change Number of Items to show in one page
**/
async function changeNumPerPage (num) {
  try {
    limit = parseInt(num);
    console.log(limit);
    await reloadData({});

    await createPaginationButtons();
  }
  catch (error) {
    console.log(error);
    showAlertModal ("Error Changing Number Of Items Per Page. code null", "Application Error! Contact Developer!", "error");
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
async function addForm(event){
  workCount+= 1;
  const container = document.getElementById("container1");
  console.log(container.childElementCount);

  let row1 = document.createElement("div");
    row1.id = "row"+ workCount;
    row1.class = "row";

    let values = ["Sunday", "Monday","Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
 
    let select = document.createElement("select");
    select.name = "days";
    select.id = "days" +workCount;
    select.style= "margin:10px;";
 
    for (const val of values)
    {
        let option = document.createElement("option");
        option.value = values.indexOf(val);
        option.text = val.charAt(0).toUpperCase() + val.slice(1);
        select.appendChild(option);
    }
 
    let label = document.createElement("label");

    label.innerHTML = "Working Days: "
    label.htmlFor = "days";
    label.id = "wLabel";


    row1.appendChild(label).appendChild(select);


    
    row1.appendChild(document.createTextNode("Start Time"));
    let startselect = document.createElement("select");
    startselect.name = "startselect";
    startselect.id = "startselect" + workCount;
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
    endselect.id = "endselect" + workCount;
    endselect.style= "margin:10px;";
    for(const hours of scheduleHours)
    {
      let option2 = document.createElement("option");
      option2.value = hours; 
      option2.text = hours;
      endselect.appendChild(option2);
    }

    row1.appendChild(endselect);

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


function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    let dropdowns = document.getElementsByClassName("dropdown-content");
    let i;
    for (i = 0; i < dropdowns.length; i++) {
      let openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}


/***
# Search Input OnChange Event
***/
async function onKeyUp(event) {
  if (event.key === 'Enter')
      filterDoctors(event);
}



function populateDoctorTable(empData, idx=1) {
  const { _id,doctorId, name, specialization, starttime, endtime } = empData;
  const doctorTable = document.getElementById('doctor-table');

  const row = doctorTable.insertRow(idx);
  const firstColumn = row.insertCell(0);
  const secondColumn = row.insertCell(1);
  const thirdColumn = row.insertCell(2);
  const forthColumn = row.insertCell(3);

  firstColumn.innerHTML = doctorId;
  secondColumn.innerHTML = name;
  thirdColumn.innerHTML = specialization;

  const actionDiv = document.createElement('div');

  /* edit button */
  const editBtn = document.createElement('button');
  editBtn.setAttribute('class', 'btn mx-1 btn-primary');
  editBtn.setAttribute('data-id', _id);
  editBtn.innerHTML = '<i class="fas fa-pen"></i>';
  forthColumn.appendChild(editBtn);
  //
  editBtn.addEventListener('click', e => {
    window.api.send('doctor-data', {_id, method: 'PUT'});
  });
  /* View Details button */
  const viewBtn = document.createElement('button');
  viewBtn.setAttribute('class', 'btn  btn-info');
  viewBtn.setAttribute('data-id', _id);
  viewBtn.innerHTML = '<i class="fas fa-info-circle"></i>';
  forthColumn.appendChild(viewBtn);

  viewBtn.addEventListener('click', e => {
    window.api.send('doctor-data', {_id, method: 'GET'});
  })
  /* Work Schedule Edit button */
  const scheduleBtn = document.createElement('button');
  scheduleBtn.setAttribute('class', 'btn mx-1 btn-secondary');
  scheduleBtn.setAttribute('data-id', _id);
  scheduleBtn.innerHTML = '<i class="far fa-calendar-alt"></i>';
  forthColumn.appendChild(scheduleBtn);

  scheduleBtn.addEventListener('click', e => {
    window.api.send('doctor-schedule-data', {_id, method: 'PUT'});
  })



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
      console.log(specialsList);

    }
    else {
      const { message } = await response.json();
      const errorMessage = message ? message : "Error Reloading Data. code 500";
      showEmptyMessage(errorMessage);
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
        console.log(val);
        option.text = val.charAt(0).toUpperCase() + val.slice(1);
        select.appendChild(option);
    }
    
 
    specialContainer.appendChild(select);

  }

  catch (error) {
    console.log(error);
    showEmptyMessage("Error Showing Specializations Data. code 300");
  }

}


/* filter doctor data */
async function filterDoctors () {
  const q = document.getElementById('search-input').value;

  if (!q || q === '')
     return;

  try {
    filtering = true;
    const response = await searchDoctors(q);


    if (response && response.ok) {
      const doctor = await response.json();
      if (doctor.length === 0) {
        // show empty message
        showEmptyMessage(q);
      }
      else{
        displayFilteredResults(doctor);
      }
      totalDoctors = doctor.length
      numPages = Math.floor(totalDoctors/limit) + 1
      await createPaginationButtons();
    }
    else {
      const { message } = await response.json();
      if (message)
        showAlertModal(`Error Searching Doctors`, message, "error");
      else
        showAlertModal("Error Searching Doctors. Code : 500", "Network Connection Error", "error");
    }
    // displayFilteredResults(results);
  }
  catch (error) {
    console.log('Error filtering doctor data', error);
  }
 };



 /* reset filter */
async function resetFilter () {
  filtering = false;
  const searchInput = document.getElementById('search-input');
  searchInput.value = '';

  /* remove the empty message box if the search results were found */
  const emptyMessageBox = document.getElementById('empty-message-box');
  if (emptyMessageBox)
   emptyMessageBox.remove();

  // window.api.send('form-data-finish', {method: 'GET', type: 'user'});
  reloadData({method: 'GET', type: 'doctor'});
  await createPaginationButtons();
};



/*Reload doctor data*/
async function reloadData() {

  if (reloadStatus === "reloading")
    return;

  reloadStatus = "reloading";

  try {

    clearDataContainer();
    
    
    // reload the data by fetching data based on the data type, and populate the table again
    const response = await fetchDoctors();

    if (response && response.ok) {
      const emps = await response.json();

      emps.forEach( (emp, idx) => populateDoctorTable(emp, idx + 1));

    }
    else {
      const { message } = await response.json();
      const errorMessage = message ? message : "Error Reloading Data. code 500";
      showEmptyMessage(errorMessage);
    }

   
  }
  catch (error) {
    console.log(error);
    showEmptyMessage("Error Reloading Data. code 300");
  }
  finally {
    reloadStatus = "ready";
  }
}


/**
# Display Search Results
**/

function displayFilteredResults(results) {
  // get table rows from the current data table
  const oldData = document.querySelectorAll('tr');

  clearDataContainer();

  if (results.length > 0)
    results.forEach( (result, idx) => populateDoctorTable(result, idx + 1));
  else
    showEmptyMessage();
}


//** show this empty message if the results are empty */
function showEmptyMessage () {
  clearDataContainer();
  const searchInput = document.getElementById('search-input');
  const dataContainer = document.getElementById('data-container');
  const div = document.createElement('div');
  div.setAttribute('id', 'empty-message-box');
  div.setAttribute('class', 'alert alert-info');
  div.setAttribute('role', 'alert');
  div.innerHTML = `No result found related to ${searchInput.value}`;
  dataContainer.appendChild(div);
}

function clearDataContainer () {
  const dataContainer = document.getElementById('data-container');
  while (dataContainer.childElementCount > 1) {
    dataContainer.removeChild(dataContainer.lastChild);
  }
  
  
  reloadDataTable();
}

/** clear old table contents to make room for new contents */
function reloadDataTable () {
  // get table rows from the current data table
  const oldData = document.querySelectorAll('tr');

  // excpet the table header, remove all the data
  oldData.forEach( (node, idx) =>  idx !== 0 && node.remove());
}

/**
# Error Message Box
**/
function showErrorMessage (msg) {
  const div = document.createElement("div");
  div.setAttribute("class", "alert alert-danger");
  div.setAttribute("role", "alert");
  div.setAttribute("id", "tag-error-box");
  div.innerHTML = msg;
  const dataContainer = document.getElementById('data-container');
  dataContainer.appendChild(div);

  if (loadingSpinner) loadingSpinner.style.display = "none";
  pagination.style.display = "none";
}


/**
# Remove Error/Empty MessageBoxes
**/
function removeMessageBoxes () {
  // get rid of the empty-message-box if avaialble
  const emptyMessageBox = document.getElementById('empty-message-box');
  if (emptyMessageBox) emptyMessageBox.remove();

  const errorMessageBox = document.getElementById("tag-error-box");
  if (errorMessageBox) errorMessageBox.remove();
}


const logout = () => {
  clearUserLocalStorageData();
  window.api.send('logout');
}

function clearUserLocalStorageData () {
  localStorage.removeItem("user");
}



/***********************************************************************
############################ PAGINATION ################################
***********************************************************************/
async function createPaginationButtons () {
  try {

    const response = await getDoctorsCount();
    if (response && response.ok) {
      if (!filtering && limit !== 0) {
        const count = await response.json();

        totalDoctors = parseInt(count.count);

        numPages = totalDoctors%limit === 0 ? totalDoctors/limit : Math.floor(totalDoctors/limit) + 1;

      }

      if (limit === 0) {

        removePaginationItems();

      }
      else {
        displayPagination();
      }
    }
    else {
      const { message } = await response.json();
      const errMessage = message ? message : "Network Connection Error!";
      showAlertModal(`Error Searching Doctors`, message, "error");
    }
  }
  catch (error) {
    console.log(error);
    showAlertModal(`Error Searching Doctors`, "Application Error! Contact Developer!", "error");
  }
}



async function displayPagination () {
  // populate pagination elements here
  const pagination = document.getElementById('pagination2');
  //console.log(pagination);
  removePaginationItems();

  for (let i = 0; i < numPages; i++) {
    const li = document.createElement("li");
    li.setAttribute("class", "page-item");
    li.setAttribute("id", `page-num-${i+1}`);
    li.setAttribute("data-type", "pagination");
    li.innerHTML = `<a class="page-link" href="#">${i + 1}</a>`;
    if (i === 0)
      li.classList.add("active");
    pagination.insertBefore(li, pagination.children[pagination.childElementCount - 1]);

    /** on click event on pagination elements */
    li.addEventListener("click", async (event) => {
      try {
        page = i+1;
        await reloadData({});
        (pagination.querySelectorAll("li")).forEach(
          p => p.classList.remove("active")
        );
        li.classList.add("active");

        togglePaginationButtons();
      }
      catch (error) {
        showAlertModal("Error Performing Click on Pagination Items", "Application Error! Contact Developer!", "error");
      }
    });

  }

  togglePaginationButtons();
}




// Remove paginations when the page re-load
function removePaginationItems () {
  const items = document.querySelectorAll("li");
  items.forEach(
    li => {
      // console.log(li.dataset.type);
      if (li.dataset.type === "pagination")
        li.remove();
    }
  )
}


/** handle pagination next button click events */
async function nextPaginationClick (event) {
  try {
    console.log(page, numPages);
    if (page && page < numPages) {
      page += 1;
      await reloadData({});
      (pagination.querySelectorAll("li")).forEach(
        p => p.classList.remove("active")
      );
      (document.getElementById(`page-num-${page}`)).classList.add("active");

      togglePaginationButtons();
    }
  }
  catch (error) {
    console.error ("Error Performing Click on Pagination Next Button");
  }
}

/** handle pagination previous button click events */
async function prevPaginationClick (event) {
  try {
    if (page && page > 1) {
      page -= 1;
      await reloadData({});
      (pagination.querySelectorAll("li")).forEach(
        p => p.classList.remove("active")
      );
      (document.getElementById(`page-num-${page}`)).classList.add("active");

      togglePaginationButtons();
    }
    else {
      event.target.setAttribute("aria-disabled", true);
      event.target.parentNode.classList.add("disabled");
    }
  }
  catch (error) {
    console.error ("Error Performing Click on Pagination Next Button");
  }
}


/** Toggle Pagination Buttons State **/
function togglePaginationButtons () {
  /**
  # disable/enable next/prev pagination buttons
  **/
  if (page === 1) {
    // disable prev buttons, enable next buttons
    (document.getElementById("previous")).classList.add("disabled");
    (document.getElementById("previous")).children[0].setAttribute("aria-disabled", true);
    (document.getElementById("next")).classList.remove("disabled");
    (document.getElementById("next")).children[0].removeAttribute("aria-disabled");
  }
  else if (page === numPages) {
    // disable next buttons, enable prev buttons
    (document.getElementById("next")).classList.add("disabled");
    (document.getElementById("next")).children[0].setAttribute("aria-disabled", true);
    (document.getElementById("previous")).classList.remove("disabled");
    (document.getElementById("previous")).children[0].removeAttribute("aria-disabled");
  }
  else {
    // enable both next/prev buttons
    (document.getElementById("previous")).classList.remove("disabled");
    (document.getElementById("previous")).children[0].removeAttribute("aria-disabled");
    (document.getElementById("next")).classList.remove("disabled");
    (document.getElementById("next")).children[0].removeAttribute("aria-disabled");
  }
}



/***********************************************************************
################## CREATE NEW Doctors TAB ###################
***********************************************************************/



/**
# Set Minimun Expiry Date to next five months
**/
function setMinAge (input) {
  const today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth()+1; //January is 0 so need to add 1 to make it 1!
  let yyyy = today.getFullYear();
  if(dd<10){
    dd='0'+dd
  }
  if(mm<10){
    mm='0'+mm
  }
  let minDate = yyyy+'-'+mm+'-'+dd;
  input.setAttribute("max", minDate);
  }

function validateTime(time)
{

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

/**
# Create Doctor
**/
async function createDoctor(event) {
  try {
    // prevent default behaviour on form submit
    let workingschedule =[];
    let z = 0;
    event.preventDefault();
    const container = document.getElementById('container1');
    const child = container.children;
    console.log(child.length);
    for (let i = 1; i <= child.length; i++)
    {

      workingday = document.getElementById("days" + i)?.value;
      workSTime = document.getElementById('startselect' + i)?.value;
      workETime = document.getElementById('endselect' + i)?.value;
      
      console.log(workSTime);


      if(!checkHours(workSTime, workETime))
      {
       throw new Error("End Time must be Greater than Start Time");
      }


      workingschedule.push({startTime : workSTime , endTime : workETime , day : workingday});
      // console.log(workingSch);
      // workingschedule.push(workSch);

    }
    console.log(workingschedule);


    const name = document.getElementById('fullname').value;
    const specialization = document.getElementById('specialSelect').value;
    //const workingDays = "[1, 2, 3, 4, 5]";
    if (!name || name === ''|| !specialization || specialization === ''|| !workingschedule || workingschedule === '' ) {
      throw new Error ("Missing Required Inputs");
    }

    const data = {
      name,
      specialization,
      workingSchedule : workingschedule
    }
    console.log(data);
    const response = await fetch(`${serverURL}/api/doctors`, {
      method: "POST",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      },
      body: JSON.stringify(data)
    });
    if (response && response.ok) {
      const doctor = await response.json();
      console.log(doctor);
      showAlertModal(`${name}, is successfully created!`, "New Doctor Created!", "success");
      // clear form input
      clearFormInputs();
      await reloadData({});
      createPaginationButtons();
    }
    else {
      const { message } = await response.json();
      const errMessage = message ? `Error Creating New Doctor. ${message}`
                            : "Error Creating New Doctor. code 300";

      showAlertModal(errMessage, "Error", "error");
    }
  }
  catch (error) {
    console.log('Error Fetching Create-New-Doctor Response', error);
    showAlertModal(error.message, "Error", "error");
  }
}


// clear create doctors form inputs
function clearFormInputs () {
  (document.getElementById('fullname')).value = '';
 
  const container = document.getElementById('container1');

  let child = container.lastChild; 

  while (child) {
            container.removeChild(child);
            child = container.lastChild;
          }
}


function showAlertModal(msg, header, type) {

  const alertModal = document.getElementById("alert-modal");
  alertModal.style.display = "flex";

  const modalContent = document.getElementById("alert-modal-content");
  const modalContentHeader = document.getElementById("alert-modal-header");

  if (type === "success")
    modalContentHeader.style.background = "green";
  else {
    modalContentHeader.style.background = "red";
  }

  modalContentHeader.innerHTML = header;
  modalContentHeader.style.color = "white";

  const message = document.getElementById("my-alert-modal-message");
  message.innerHTML = msg;
}


function removeAlertModal (e) {
  e.preventDefault();
  const alertModal = document.getElementById("alert-modal");
  if (alertModal)
    alertModal.style.display = "none";
}



/***********************************************************************
####################### Network Requests ###############################
***********************************************************************/



async function getDoctorsCount () {
  try {
    const response = await fetch(`${serverURL}/api/doctors/count`, {
      method: "GET",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      }
    });

    return response;
  }
  catch (error) {
    console.error (`Error Creating Pagination Buttons: Get Tag Count`);
  }
}


/**
# Fetch Doctors with Pagination Properties
**/
async function fetchDoctors () {
  try {
    let url = `${serverURL}/api/doctors?page=${page}&limit=${limit}&order=${order}&sort=${sort}`;

    if (limit === 0)
      url = `${serverURL}/api/doctors?limit=0&order=${order}&sort=${sort}`;

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
    console.error("Error Getting  Doctors/n", error);
  }
}


/** Search Doctors by Keyword **/
async function searchDoctors (q) {
  try {
    const response = await fetch(`${serverURL}/api/doctors/search?q=${q}`, {
      method: "GET",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      }
    });

    return response;
  }
  catch (error) {
    console.error(`Error Search Doctors: ${error}`);
  }
}

async function getSpecialsCount () { 
  try {
    const response = await fetch(`${serverURL}/api/specialization/count`, {
      method: "GET",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      }
    });

    return response;
  }
  catch (error) {
    console.error (`Error Creating Pagination Buttons: Get Specializations Count`);
  }
}

/**
# Fetch Specializations with Pagination Properties
**/
async function fetchSpecializations () {
  try {
    limit = 30;
    let url = `${serverURL}/api/specialization?page=${page}&limit=${limit}&order=${order}&sort=${sort}`;

    if (limit === 0)
      url = `${serverURL}/api/specialization?limit=0&order=${order}&sort=${sort}`;

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

async function createSpecials()
{
  try
  {
    const name = document.getElementById('specialName').value;
    const remarks = document.getElementById('remarks').value;
    
    if (!name || name === '' || !remarks || remarks === '') {
      throw new Error ("Missing Required Inputs");
    }

    const data = {
      name,
      remarks
    }

    const response = await fetch(`${serverURL}/api/specialization`, {
      method: "POST",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      },
      body: JSON.stringify(data)
    });
    if (response && response.ok) {
      const specialization = await response.json();
      showAlertModal(`${name}, is successfully created!`, "New Specialization Created!", "success");
      // clear form input
      (document.getElementById('specialName')).value = '';
      (document.getElementById('remarks')).value = '';
      if((document.getElementById('specialSelect')) != null)
      {
        const specialselect = document.getElementById('specialcontainer');
        while (specialselect.childElementCount > 2) {
          specialselect.removeChild(specialselect.lastChild);
        }

      }
      await displaySpecialization();

    }
    else {
      const { message } = await response.json();
      const errMessage = message ? `Error Creating New Specialization. ${message}`
                            : "Error Creating New Specialization. code 300";

      showAlertModal(errMessage, "Error", "error");
    }
  }
  catch (error) {
    console.log('Error Fetching Create-New-Specialization Response', error);
    showAlertModal(error.message, "Error", "error");
  }

}


/***********************************************************************
####################### Clean up EventListeners ########################
***********************************************************************/

window.onUnload = () => window.api.removeListeners();