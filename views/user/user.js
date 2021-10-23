console.log('User Scripts Running..');

const { ipcRenderer } = require('electron');
const { searchUserRequest } = require('../requests/userRequests.js');


// DOM Nodes
const createUserBtn = document.getElementById('create-user');
const editUser = document.getElementById('edit-user');
const searchButton = document.getElementById('search-btn');
const cancelSearchButton = document.getElementById('cancel-search');
const searchInput = document.getElementById('search-input');

/* hide cancel search button on first load */
// cancelSearchButton.style.display = 'none';


createUserBtn.addEventListener('click', () => {
  // send request to open new user create window from main process
  // @param1 - the channel name from which the main process will recive to open the new window to create new data
  // @param2 - the data type
  sendIpcMsgToMain('create-modal', 'user');
});

/* search user on enter key pressed from keyboard */
searchInput.addEventListener('keyup', async e => {
  console.log('keyup', e.key);
  e.key === 'Enter' && await searchUser();
})

searchButton.addEventListener('click', async e => {
  await searchUser();
});


async function searchUser() {
  const q = searchInput.value;

  if (!q || q === '')
    return;

  try {
    const searchResults = await searchUserRequest(q);

    displaySearchResults(searchResults);

    cancelSearchButton.style.display = 'block';
  }
  catch (error) {
    console.log('Error Fetching Search Response', error);
  }
}


function displaySearchResults(results) {
  // get table rows from the current data table
  const oldData = document.querySelectorAll('tr');

  // excpet the table header, remove all the data
  oldData.forEach( (node, idx) =>  idx !== 0 && node.remove());

  if (results.length > 0)
    results.forEach( (result, idx) => populateUserTable(idx + 1, result));
  else
    showEmptyMessage();
}


function populateUserTable(idx, {id, username, email}) {

  /* remove the empty message box if the search results were found */
  const emptyMessageBox = document.getElementById('empty-message-box');
  if (emptyMessageBox)
    emptyMessageBox.remove();

  const userTable = document.getElementById('user-table');

  const row = userTable.insertRow(idx);
  const firstColumn = row.insertCell(0);
  const secondColumn = row.insertCell(1);
  const thirdColumn = row.insertCell(2);
  const fourthColumn = row.insertCell(3);
  firstColumn.innerHTML = id;
  secondColumn.innerHTML = username;
  thirdColumn.innerHTML = email;
  /* edit button */
  const editBtn = document.createElement('button');
  editBtn.setAttribute('class', 'btn mx-1 btn-primary');
  editBtn.setAttribute('data-id', id);
  editBtn.innerHTML = 'EDIT';
  fourthColumn.appendChild(editBtn);

  editBtn.addEventListener('click', e => {
    console.log('id', id);
    ipcRenderer.send('user-data', {id, method: 'PUT'});
  });

  /* View Details button */
  const viewBtn = document.createElement('button');
  viewBtn.setAttribute('class', 'btn mx-1 btn-info');
  viewBtn.setAttribute('data-id', id);
  viewBtn.innerHTML = 'View More Details';
  fourthColumn.appendChild(viewBtn);

  viewBtn.addEventListener('click', e => {
    ipcRenderer.send('user-data', {id, method: 'GET'});
  })
}


function showEmptyMessage() {
  const dataContainer = document.getElementById('data-container');
  const div = document.createElement('div');
  div.setAttribute('id', 'empty-message-box');
  div.setAttribute('class', 'alert alert-info');
  div.setAttribute('role', 'alert');
  div.innerHTML = `No result found related to ${searchInput.value}`;
  dataContainer.appendChild(div);
}


/* cancel search and show the original unfiltered data */
cancelSearchButton.addEventListener('click', e => {
  searchInput.value = '';
  /* remove the empty message box if the search results were found */
  const emptyMessageBox = document.getElementById('empty-message-box');
  if (emptyMessageBox)
    emptyMessageBox.remove();
  sendIpcMsgToMain('form-data-finish', {method: 'GET', type: 'user'});
});


/*
  send ipc message to Main Process
  @param1 - ipcChannelName: the channel name from which the main process will receive message
  @param2 - msg: the content (or the msg), being sent inside the ipc message
  */
function sendIpcMsgToMain(ipcChannelName, msg) {
  ipcRenderer.send(ipcChannelName, msg);
}
