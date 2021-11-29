const loadingSpinner = document.getElementById("loading-spinner");
let serverUrl, empName
let reloadStatus = "ready";



window.onload = async () => {

  try {

    window.api.send("remove-login-event");

    loadDataFromLocalStorage();
    displayLoginInformation();

    await reloadData();
  }
  catch (error) {
    console.error(error);
    showErrorMessage(error);
  }
  finally {
    loadingSpinner.style.display = "none";
  }
}


/**
# Load Datasource From LocalStorage
**/
function loadDataFromLocalStorage () {
  // get server URL
  serverUrl = localStorage.getItem("serverUrl");
  if (!serverUrl || serverUrl === null)
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


window.onUnload = () => window.api.removeListeners();


window.api.receive('reload-data', async (data) => {

  console.log("reload-data from ipc", reloadStatus);
  if (reloadStatus === 'ready') {
      await reloadData();
  }
});

/** open create user form window  */
const createUser = () => {
  window.api.send('create-modal', 'user');
}


const logout = () => {
  clearUserLocalStorageData();
  window.api.send('user-logout');
}

function clearUserLocalStorageData () {
  localStorage.removeItem("user");
}

async function reloadData() {

  console.log("reload-data", reloadStatus);
  if (reloadStatus === "reloading")
    return;

  reloadStatus = "reloading";

  try {

    clearDataContainer();

    // reload the data by fetching data based on the data type, and populate the table again
    const response = await fetchEmployees();

    if (response && response.ok) {
      const emps = await response.json();

      // if (emps.length === 0)
      //   showEmptyMessage();
      // else
      emps.forEach( (emp, idx) => populateUserTable(emp, idx + 1));

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


function populateUserTable(empData, idx=1) {
  const { _id, username, mobile, level } = empData;
  const userTable = document.getElementById('user-table');

  const row = userTable.insertRow(idx);
  const firstColumn = row.insertCell(0);
  const secondColumn = row.insertCell(1);
  const thirdColumn = row.insertCell(2);
  const forthColumn = row.insertCell(3);
  const fifthColumn = row.insertCell(4);

  firstColumn.innerHTML = _id;
  secondColumn.innerHTML = username;
  thirdColumn.innerHTML = mobile;
  forthColumn.innerHTML = level;
  /* edit button */
  const editBtn = document.createElement('button');
  editBtn.setAttribute('class', 'btn mx-1 btn-primary');
  editBtn.setAttribute('data-id', _id);
  editBtn.innerHTML = 'EDIT';
  fifthColumn.appendChild(editBtn);
  //
  editBtn.addEventListener('click', e => {
    window.api.send('user-data', {_id, method: 'PUT'});
  });
  /* View Details button */
  const viewBtn = document.createElement('button');
  viewBtn.setAttribute('class', 'btn mx-1 btn-info');
  viewBtn.setAttribute('data-id', _id);
  viewBtn.innerHTML = 'View More Details';
  fifthColumn.appendChild(viewBtn);

  viewBtn.addEventListener('click', e => {
    window.api.send('user-data', {_id, method: 'GET'});
  })
}

function onKeyUp(event) {
  if (event.key === 'Enter')
      filterUsers(event);
}


/* filter user data */
async function filterUsers (event) {
  const q = document.getElementById('search-input').value;

  if (!q || q === '')
    return;

  const searchButton = document.getElementById("search-btn");
  toggleLoadingButton(searchButton, state="loading");

  clearDataContainer();

  try {
    const response = await searchEmployees(q);

    if (response && response.ok) {
      const results = await response.json();
      displayFilteredResults(results);
    }
    else {
      const { message } = await response.json();
      const errMessage = message ? message : "Error: Network Connection. code 500";
      showErrorMessage(errMessage);
    }

  }
  catch (error) {
      showErrorMessage(error);
  }
  finally {
    toggleLoadingButton(searchButton, state="ready");
  }
}


/** display search results */
function displayFilteredResults(results) {
  // get table rows from the current data table
  const oldData = document.querySelectorAll('tr');

  // clearDataContainer();

  if (results.length > 0)
    results.forEach( (result, idx) => populateUserTable(result, idx + 1));
  else
    showEmptyMessage();
}


/** reset filters */
const resetFilter =  () => {
  const searchInput = document.getElementById('search-input');
  searchInput.value = '';

  /* remove the empty message box if the search results were found */
  const emptyMessageBox = document.getElementById('empty-message-box');
  if (emptyMessageBox)
    emptyMessageBox.remove();

  // window.api.send('form-data-finish', {method: 'GET', type: 'user'});
  reloadData();
}


/** show this emoty message if the results are empty */
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


function showErrorMessage (message) {
  const dataContainer = document.getElementById('data-container');
  const div = document.createElement('div');
  div.setAttribute('id', 'error-message-box');
  div.setAttribute('class', 'alert alert-danger');
  div.setAttribute('role', 'alert');
  div.innerHTML = message;
  dataContainer.appendChild(div);
}


function showAlertModal(msg) {

  const alertModal = document.getElementById("alert-modal");
  alertModal.style.display = "flex";

  const modalContent = document.getElementById("alert-modal-content");
  const modalContentHeader = document.getElementById("alert-modal-header");
  modalContentHeader.style.background = "dodgerblue";

  modalContentHeader.innerHTML = "Info Alert!";
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


function toggleLoadingButton (button, originalText, state) {
  if (state === "loading") {
    button.innerHTML = "Loading ...";
    button.setAttribute("disabled", true);
  }
  else {
    button.innerHTML = button.getAttribute("name");
    button.removeAttribute("disabled");
  }
}


async function fetchEmployees () {
  try {
    const response = await fetch(`${serverUrl}/api/employees?limit=0`, {
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


async function searchEmployees (q) {
  try {
    const response = await fetch(`${serverUrl}/api/employees/search?q=${q}`, {
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
