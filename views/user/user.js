const loadingSpinner = document.getElementById("loading-spinner");
let serverUrl
let reloadStatus = "ready";


(async function() {
  window.api.send("app-config", "ip");
})(window)


window.api.receive("app-config-response", async addr => {
  try {
    serverUrl = addr;
    
    await reloadData({});
  }
  catch (error) {
    console.error(error);
    alert ("Error Fetching Users. code 300");
  }
  finally {
    loadingSpinner.style.display = "none";
  }
});

window.api.receive('reload-data', async (data) => {

  console.log("reload-data from ipc", reloadStatus);
  if (reloadStatus === 'ready') {
      await reloadData(data);
  }
});

/** open create user form window  */
const createUser = () => {
  window.api.send('create-modal', 'user');
}


const logout = () => {
  window.api.send('user-logout');
}

async function reloadData(data) {

  console.log("reload-data", reloadStatus);
  if (reloadStatus === "reloading")
    return;
  
  reloadStatus = "reloading";

  try {
    const { type, _data, method } = data;

    // get table rows from the current data table
    const oldData = document.querySelectorAll('tr');

    // excpet the table header, remove all the data
    oldData.forEach( (node, idx) =>  idx !== 0 && node.remove());

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

      if (message) {

      }
      else {

      }
    }
  }
  catch (error) {
    console.log(error);
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
    // window.api.send('user-data', {_id, method: 'PUT'});
    showAlertModal("Coming Soon!");
  });
  /* View Details button */
  const viewBtn = document.createElement('button');
  viewBtn.setAttribute('class', 'btn mx-1 btn-info');
  viewBtn.setAttribute('data-id', _id);
  viewBtn.innerHTML = 'View More Details';
  fifthColumn.appendChild(viewBtn);

  viewBtn.addEventListener('click', e => {
    // window.api.send('user-data', {_id, method: 'GET'});
    showAlertModal("Coming Soon!");
  })
}

function onKeyUp(event) {
  if (event.key === 'Enter')
      filterUsers();
}


/* filter user data */
const filterUsers = async () => {
  const q = document.getElementById('search-input').value;

  if (!q || q === '')
    return;

  try {
      const response = await fetch(`http://127.0.0.1:8080/api/employees/search?q=${q}`, {
        method: "GET",
        headers: {
          "Content-Type" : "application/json",
          "Accept" : "application/json"
        }
      });


      if (response.ok) {
        const results = await response.json();
        displayFilteredResults(results);
      }

  }
  catch (error) {
      console.log('Error filtering user data', error);
  }
}


/** display search results */
function displayFilteredResults(results) {
  // get table rows from the current data table
  const oldData = document.querySelectorAll('tr');

  // get rid of the empty-message-box if avaialble
  const emptyMessageBox = document.getElementById('empty-message-box');
  if (emptyMessageBox) emptyMessageBox.remove();

  // excpet the table header, remove all the data
  oldData.forEach( (node, idx) =>  idx !== 0 && node.remove());

  if (results.length > 0)
    results.forEach( (result, idx) => populateUserTable(result, idx + 1));
  else
    showEmptyMessage();
}


/** reset filters */
const resetFilter =  () => {
  console.log("reset filter");
  const searchInput = document.getElementById('search-input');
  searchInput.value = '';

  /* remove the empty message box if the search results were found */
  const emptyMessageBox = document.getElementById('empty-message-box');
  if (emptyMessageBox)
    emptyMessageBox.remove();

  // window.api.send('form-data-finish', {method: 'GET', type: 'user'});
  reloadData({method: 'GET', type: 'user'});
}


/** show this emoty message if the results are empty */
const showEmptyMessage = () => {
  const searchInput = document.getElementById('search-input');
  const dataContainer = document.getElementById('data-container');
  const div = document.createElement('div');
  div.setAttribute('id', 'empty-message-box');
  div.setAttribute('class', 'alert alert-info');
  div.setAttribute('role', 'alert');
  div.innerHTML = `No result found related to ${searchInput.value}`;
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


async function fetchEmployees () {
  try {
    const response = await fetch(`${serverUrl}/api/employees`, {
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
