//patient with menu tabs
let reloadStatus = "ready";
// for pagination
let limit = 10;
let page = 1;
let order = 1;


let  totalPatients, numPages; //M - removed medTags, totalTags,
let serverURL, empName;
let filtering = false;
//let pagination, previous, next,loadingSpinner;


// DOM Nodes
window.onload = async () => {

  try {
    const loadingSpinner = document.getElementById("loading-spinner");
    // pagination = document.getElementById("pagination");
    // previous = document.getElementById("previous");
    next = document.getElementById("next");
    const inputBOD = document.getElementById("inputBOD");

    setMinAge(inputBOD); 

    loadDataFromLocalStorage();
    displayLoginInformation();

    await reloadData({});
    await createPaginationButtons();
  }
  catch (error) {
    showErrorMessage(error);
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





/***
# Search Input OnChange Event
***/
async function onKeyUp(event) {
  if (event.key === 'Enter')
      filterPatients(event);
}


function populatePatientTable(empData, idx=1) {
  const { _id,patientId, fullname, age, gender, mobile, address, allergies } = empData;
  const patientTable = document.getElementById('patient-table');

  const row = patientTable.insertRow(idx);
  const firstColumn = row.insertCell(0);
  const secondColumn = row.insertCell(1);
  const thirdColumn = row.insertCell(2);
  const forthColumn = row.insertCell(3);
  const fifthColumn = row.insertCell(4);
  //const sixthColumn = row.insertCell(5);
  const seventhColumn = row.insertCell(5);

  firstColumn.innerHTML = patientId;
  secondColumn.innerHTML = fullname;
  thirdColumn.innerHTML = age;
  forthColumn.innerHTML = gender;
  fifthColumn.innerHTML = mobile;
  //sixthColumn.innerHTML = address;
  
  /* edit button */
  const editBtn = document.createElement('button');
  editBtn.setAttribute('class', 'btn mx-1 btn-primary');
  editBtn.setAttribute('data-id', _id);
  editBtn.innerHTML = '<i class="fas fa-pen"></i>';
  seventhColumn.appendChild(editBtn);
  //
  editBtn.addEventListener('click', e => {
    window.api.send('patient-data', {_id, method: 'PUT'});
  });
  /* View Details button */
  const viewBtn = document.createElement('button');
  viewBtn.setAttribute('class', 'btn mx-1 btn-info');
  viewBtn.setAttribute('data-id', _id);
  viewBtn.innerHTML = '<i class="fas fa-info-circle"></i>';
  seventhColumn.appendChild(viewBtn);

  viewBtn.addEventListener('click', e => {
    window.api.send('patient-data', {_id, method: 'GET'});
  })
}


/* filter user data */
async function filterPatients () {
  const q = document.getElementById('search-input').value;

  if (!q || q === '')
     return;

  try {
    filtering = true;
    const response = await searchPatients(q);

    if (response && response.ok) {
      const patient = await response.json();
      if (patient.length === 0) {
        // show empty message
        showEmptyMessage(q);
      }
      else{
        displayFilteredResults(patient);
      }
      totalPatients = patient.length
      numPages = Math.floor(totalPatients/limit) + 1
      await createPaginationButtons();
    }
    else {
      const { message } = await response.json();
      if (message)
        showAlertModal(`Error Searching Patients`, message, "error");
      else
        showAlertModal("Error Searching Patients. Code : 500", "Network Connection Error", "error");
    }
    // displayFilteredResults(results);
  }
  catch (error) {
    console.log('Error filtering inventory data', error);
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
  reloadData({method: 'GET', type: 'patient'});
  await createPaginationButtons();
};



/*Reload patient data*/
async function reloadData() {

  console.log("reload-data", reloadStatus);
  //showErrorMessage(reloadStatus);
  if (reloadStatus === "reloading")
    return;

  reloadStatus = "reloading";

  try {

    clearDataContainer();

    // reload the data by fetching data based on the data type, and populate the table again
    const response = await fetchPatients();

    if (response && response.ok) {
      const emps = await response.json();

      // if (emps.length === 0)
      //   showEmptyMessage();
      // else
      
      emps.forEach( (emp, idx) => populatePatientTable(emp, idx + 1));

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
/** display search results */
function displayFilteredResults(results) {
  // get table rows from the current data table
  const oldData = document.querySelectorAll('tr');

  clearDataContainer();

  if (results.length > 0)
    results.forEach( (result, idx) => populatePatientTable(result, idx + 1));
  else
    showEmptyMessage();
}


//** show this empty message if the results are empty */
function showEmptyMessage () {
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

  loadingSpinner.style.display = "none";
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

    const response = await getPatientsCount();
    if (response && response.ok) {
      if (!filtering && limit !== 0) {
        const count = await response.json();

        totalPatients = parseInt(count.count);

        numPages = totalPatients%limit === 0 ? totalPatients/limit : Math.floor(totalPatients/limit) + 1;
   
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
      showAlertModal(`Error Searching Patients`, message, "error");
    }
  }
  catch (error) {
  	console.log(error);
    showAlertModal(`Error Searching Patients`, "Application Error! Contact Developer!", "error");
  }
}



async function displayPagination () {
  // populate pagination elements here
  const pagination = document.getElementById('pagination2');
  console.log(pagination);
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
################## CREATE NEW PATIENTS TAB ###################
***********************************************************************/



/**
# Set Minimun Expiry Date to next five months // M - check if needed 
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

function calculateAge(input)
{
  const today = new Date();
  const birthDate = new Date(input);
  let age = today.getFullYear() - birthDate.getFullYear();
  console.log(age);
  let m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) 
    {
        age--;
    }
    return age;
}



/**
# Create or Add Medicines
**/
async function createPatient(event) {
  try {
    // prevent default behaviour on form submit
    event.preventDefault();

    const fullname = document.getElementById('fullname').value;
    const dob = document.getElementById('inputBOD').value;
    console.log(dob);
    const age = calculateAge(dob);
    console.log(age);
    const gender = document.getElementById('gender').value;
    const mobile = document.getElementById('mobile').value;
    const address = document.getElementById('address').value;
    const allergies = document.getElementById('allergies').value;

    if (!fullname || fullname === ''|| !age || age === ''|| !gender || gender === '' || !mobile || mobile === '' || !address || address === '' || !allergies || allergies === '') {
      throw new Error ("Missing Required Inputs");
    }

    const data = {
      fullname,
      gender,
      age,
      mobile,
      address,
      allergies
    }

    const response = await fetch(`${serverURL}/api/patients`, {
      method: "POST",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      },
      body: JSON.stringify(data)
    });

    if (response && response.ok) {
      const json = await response.json();
      window.api.send('form-data-finish', {method: 'CREATE', data: {fullname}, type: 'patient'});
    }
    else {
      const { message } = await response.json();
      const errMessage = message ? `Error Creating New Patient. ${message}`
                            : "Error Creating New Patient. code 300";

      showErorrMessage(errMessage);
    }
  }
  catch (error) {
    console.log('Error Fetching Create-New-Patient Response', error);
    //showErorrMessage(error);
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



async function getPatientsCount () { //M - need to update API
  try {
    const response = await fetch(`${serverURL}/api/patients/count`, {
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


async function fetchPatients () {
  try {
    const response = await fetch(`${serverURL}/api/patients`, {
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

/** Search Meds Patients by Keyword **/
async function searchPatients (q) {
  try {
    const response = await fetch(`${serverURL}/api/patients/search?q=${q}`, {
      method: "GET",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      }
    });

    return response;
  }
  catch (error) {
    console.error(`Error Search Patients: ${error}`);
  }
}


/***********************************************************************
####################### Clean up EventListeners ########################
***********************************************************************/

window.onUnload = () => window.api.removeListeners();
