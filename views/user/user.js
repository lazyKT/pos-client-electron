console.log('User Scripts Running..');

/*
  create userRenderer property and assign to the global window object
 */
// console.log(this, this === window);
userRenderer = {
  /* fetch all user data */
  loadUserData: async function loadUserData() {
    console.log('load user data');
    try {
      const response = await window.api.invoke('get-all-users');

      return response;
    }
    catch (error) {
      console.log('Error fetching all users', error);
    }
  },
  /* create new user */
  createUser: function createUser() {
    window.api.send('create-modal', 'user');
  },
  onKeyUp: function onKeyUp(event) {
    if (event.key === 'Enter')
      window.userRenderer.filterUsers();
  },
  /* filter user data */
  filterUsers: async function filterUsers() {
    const q = document.getElementById('search-input').value;

    if (!q || q === '')
      return;

    try {
        const results = await window.api.invoke('search-data', {data: 'user', q});
        console.log(results);
        window.userRenderer.displayFilteredResults(results);
    }
    catch (error) {
        console.log('Error filtering user data', error);
    }
  },
  /* reset filter */
  resetFilter: function resetFilter() {
    const searchInput = document.getElementById('search-input');
    searchInput.value = '';

    /* remove the empty message box if the search results were found */
    const emptyMessageBox = document.getElementById('empty-message-box');
    if (emptyMessageBox)
      emptyMessageBox.remove();

    window.api.send('form-data-finish', {method: 'GET', type: 'user'});
  },
  /* reload data after every mutation event on user data */
  reloadData: async function reloadData(newData) {
    try {
      const { type, data, method } = newData;

      // get table rows from the current data table
      const oldData = newNode.querySelectorAll('tr');
      console.log('oldData'. oldData);
      // excpet the table header, remove all the data
      oldData.forEach( (node, idx) =>  idx !== 0 && node.remove());

      // reload the data by fetching data based on the data type, and populate the table again
      const users = await window.userRenderer.loadUserData();

      users.forEach( user => window.userRenderer.populateUserTable(user));

      if (method === 'CREATE' || method === 'UPDATE')
        window.api.showNotification(newData);

    }
    catch (error) {
      console.log(`Error Reloading ${newData.type} data`, error);
    }
  },
  /* display filtered results */
  displayFilteredResults: function displayFilteredResults(results) {
    // get table rows from the current data table
    const oldData = document.querySelectorAll('tr');

    // get rid of the empty-message-box if avaialble
    const emptyMessageBox = document.getElementById('empty-message-box');
    if (emptyMessageBox) emptyMessageBox.remove();

    // excpet the table header, remove all the data
    oldData.forEach( (node, idx) =>  idx !== 0 && node.remove());

    if (results.length > 0)
      results.forEach( (result, idx) => window.userRenderer.populateUserTable(result, idx + 1));
    else
      window.userRenderer.showEmptyMessage();
  },
  /* display the user data in the table */
  populateUserTable: function populateUserTable({id, username, email}, idx=1) {
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
      window.api.send('user-data', {id, method: 'PUT'});
    });
    /* View Details button */
    const viewBtn = document.createElement('button');
    viewBtn.setAttribute('class', 'btn mx-1 btn-info');
    viewBtn.setAttribute('data-id', id);
    viewBtn.innerHTML = 'View More Details';
    fourthColumn.appendChild(viewBtn);

    viewBtn.addEventListener('click', e => {
      window.api.send('user-data', {id, method: 'GET'});
    })
  },
  showEmptyMessage: function () {
    const searchInput = document.getElementById('search-input');
    const dataContainer = document.getElementById('data-container');
    const div = document.createElement('div');
    div.setAttribute('id', 'empty-message-box');
    div.setAttribute('class', 'alert alert-info');
    div.setAttribute('role', 'alert');
    div.innerHTML = `No result found related to ${searchInput.value}`;
    dataContainer.appendChild(div);
  }
};


/* this IIFE will run whenever the user page contents are loaded */
(async function(window) {
  const users = await window.userRenderer.loadUserData();

  users.forEach( user => window.userRenderer.populateUserTable(user));
})(window);


window.api.receive('reload-data', async data => {
  console.log(data);
  await window.userRenderer.reloadData(data);
})

//
// const { ipcRenderer } = require('electron');
// const { searchUserRequest } = require('../requests/userRequests.js');
//
//
// DOM Nodes
// const createUserBtn = document.getElementById('create-user');
// const editUser = document.getElementById('edit-user');
// const searchButton = document.getElementById('search-btn');
// const cancelSearchButton = document.getElementById('cancel-search');
// const searchInput = document.getElementById('search-input');
// //
// // /* hide cancel search button on first load */
// // // cancelSearchButton.style.display = 'none';
// //
// //
// createUserBtn.addEventListener('click', () => {
//   // send request to open new user create window from main process
//   // @param1 - the channel name from which the main process will recive to open the new window to create new data
//   // @param2 - the data type
//   // sendIpcMsgToMain('create-modal', 'user');
//   console.log('create user');
// });
//
// /* search user on enter key pressed from keyboard */
// searchInput.addEventListener('keyup', async e => {
//   console.log('keyup', e.key);
//   e.key === 'Enter' && await searchUser();
// })
//
// searchButton.addEventListener('click', async e => {
//   await searchUser();
// });
//
//
// async function searchUser() {
//   const q = searchInput.value;
//
//   if (!q || q === '')
//     return;
//
//   try {
//     const searchResults = await searchUserRequest(q);
//
//     displaySearchResults(searchResults);
//
//     cancelSearchButton.style.display = 'block';
//   }
//   catch (error) {
//     console.log('Error Fetching Search Response', error);
//   }
// }
//
//
// function displaySearchResults(results) {
//   // get table rows from the current data table
//   const oldData = document.querySelectorAll('tr');
//
//   // excpet the table header, remove all the data
//   oldData.forEach( (node, idx) =>  idx !== 0 && node.remove());
//
//   if (results.length > 0)
//     results.forEach( (result, idx) => populateUserTable(idx + 1, result));
//   else
//     showEmptyMessage();
// }
//
//
// function populateUserTable(idx, {id, username, email}) {
//
//   /* remove the empty message box if the search results were found */
//   const emptyMessageBox = document.getElementById('empty-message-box');
//   if (emptyMessageBox)
//     emptyMessageBox.remove();
//
//   const userTable = document.getElementById('user-table');
//
//   const row = userTable.insertRow(idx);
//   const firstColumn = row.insertCell(0);
//   const secondColumn = row.insertCell(1);
//   const thirdColumn = row.insertCell(2);
//   const fourthColumn = row.insertCell(3);
//   firstColumn.innerHTML = id;
//   secondColumn.innerHTML = username;
//   thirdColumn.innerHTML = email;
//   /* edit button */
//   const editBtn = document.createElement('button');
//   editBtn.setAttribute('class', 'btn mx-1 btn-primary');
//   editBtn.setAttribute('data-id', id);
//   editBtn.innerHTML = 'EDIT';
//   fourthColumn.appendChild(editBtn);
//
//   editBtn.addEventListener('click', e => {
//     console.log('id', id);
//     ipcRenderer.send('user-data', {id, method: 'PUT'});
//   });
//
//   /* View Details button */
//   const viewBtn = document.createElement('button');
//   viewBtn.setAttribute('class', 'btn mx-1 btn-info');
//   viewBtn.setAttribute('data-id', id);
//   viewBtn.innerHTML = 'View More Details';
//   fourthColumn.appendChild(viewBtn);
//
//   viewBtn.addEventListener('click', e => {
//     ipcRenderer.send('user-data', {id, method: 'GET'});
//   })
// }
//
//
// function showEmptyMessage() {
//   const dataContainer = document.getElementById('data-container');
//   const div = document.createElement('div');
//   div.setAttribute('id', 'empty-message-box');
//   div.setAttribute('class', 'alert alert-info');
//   div.setAttribute('role', 'alert');
//   div.innerHTML = `No result found related to ${searchInput.value}`;
//   dataContainer.appendChild(div);
// }
//
//
// /* cancel search and show the original unfiltered data */
// cancelSearchButton.addEventListener('click', e => {
//   searchInput.value = '';
//   /* remove the empty message box if the search results were found */
//   const emptyMessageBox = document.getElementById('empty-message-box');
//   if (emptyMessageBox)
//     emptyMessageBox.remove();
//   sendIpcMsgToMain('form-data-finish', {method: 'GET', type: 'user'});
// });
//
//
// /*
//   send ipc message to Main Process
//   @param1 - ipcChannelName: the channel name from which the main process will receive message
//   @param2 - msg: the content (or the msg), being sent inside the ipc message
//   */
// function sendIpcMsgToMain(ipcChannelName, msg) {
//   ipcRenderer.send(ipcChannelName, msg);
// }
