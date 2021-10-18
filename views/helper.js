// helper functions
const { getAllItems } = require('./requests/itemRequests.js');
const { getAllUsers } = require('./requests/userRequests.js');


// DOM Nodes
const container = document.getElementById('register-user');
const mainPage = document.getElementById('main-container');
const contents = document.getElementById('contents');
const contentTitle = document.getElementById('content-title');

let newNode

// fetch users from main process and render in the renderer process
function fetchUsers() {
  getAllUsers() // fetch users from main process
    .then(users => {
      users.forEach( user => {
        populateUserTable(user);
      });
    })
    .catch(error => console.log(error));
}

function fetchItems() {
  getAllItems() // fetch users from main process
    .then(items => {
      items.forEach( item => {
        populateItemTable(item);
      });
    })
    .catch(error => console.log(error));
}

function populateItemTable({id, description, expireDate, quantity}) {
  const itemTable = document.getElementById('item-table');
  const row = itemTable.insertRow(id);
  const firstColumn = row.insertCell(0);
  const secondColumn = row.insertCell(1);
  const thirdColumn = row.insertCell(2);
  const fourthColumn = row.insertCell(3);
  const fifthColumn = row.insertCell(4);
  firstColumn.innerHTML = id;
  secondColumn.innerHTML = description;
  thirdColumn.innerHTML = expireDate;
  fourthColumn.innerHTML = quantity;
  fifthColumn.innerHTML = '<div><button class="mx-1 action-button">Edit</button>' +
    '<button class="mx-1 action-button">Delete</button></div>'
  
}

function populateUserTable({id, username}) {
  const userTable = document.getElementById('user-table');
  const row = userTable.insertRow(id);
  const firstColumn = row.insertCell(0);
  const secondColumn = row.insertCell(1);
  const thirdColumn = row.insertCell(2);
  firstColumn.innerHTML = id;
  secondColumn.innerHTML = username;
  thirdColumn.innerHTML = '<div><button class="mx-1 action-button">Edit</button>' +
    '<button class="mx-1 action-button">Delete</button></div>'
}

// if admin user login is successful, redirect into admin pannel
exports.redirectToAdminPannel = function redirectToAdminPannel(pannelName) {
  try {
    mainPage.style.display = 'none';
    contents.style.display = 'block';
    contentTitle.innerText = 'Pharmacy';
    // console.log('state'. document.readyState);
    if (pannelName === 'user') {
      fetch('user/user.html') // fetch
        .then(res => res.text()) // convert to HTML
        .then(newContent => { // ready
          // console.log('content', newContent);
          // console.log('state'. document.readyState);
          newNode = document.createElement('div');
          // registerNode.setAttribute('class', 'container-fluid');
          newNode.innerHTML = newContent;

          contents.appendChild(newNode);
          fetchUsers();
          // populateUserTable({id: 4, username: 'admininstrator'});
        })
        .catch(error => {
          console.log(error);
        })
    }
    else if (pannelName === 'setting') {
      fetch(`${pannelName}/${pannelName}.html`) // fetch
        .then(res => res.text()) // convert to HTML
        .then(newContent => { // ready
          console.log('content', newContent);
          // console.log('state'. document.readyState);
          newNode = document.createElement('div');
          // registerNode.setAttribute('class', 'container-fluid');
          newNode.innerHTML = newContent;

          contents.appendChild(newNode);
          // populateUserTable({id: 4, username: 'admininstrator'});
        })
        .catch(error => {
          console.log(error);
        })
    }
    else if(pannelName === 'inventory'){
      fetch(`${pannelName}/${pannelName}.html`) // fetch
        .then(res => res.text()) // convert to HTML
        .then(newContent => { // ready
          newNode = document.createElement('div');
          // registerNode.setAttribute('class', 'container-fluid');
          newNode.innerHTML = newContent;

          contents.appendChild(newNode);
          fetchItems();
          // populateUserTable({id: 4, username: 'admininstrator'});
        })
        .catch(error => {
          console.log(error);
        })
      // const response = await fetch('inventory/inventory.html');
      // const newcontent = await response.text()
      // console.log(newcontent);
      // contentTitle.innerText = 'My Inventory';
      // const inventoryNode = document.createElement('div');
      // inventoryNode.innerHTML = newcontent;
      // contents.appendChild(inventoryNode);
    }
  }
  catch (error) {
    console.log(error);
  }
}


exports.logoutToMainMenu = async function logoutToMainMenu() {
  try {
    contents.style.display = 'none';
    contents.removeChild(newNode);
    mainPage.style.display = 'flex';
  }
  catch (error) {
    console.log(error);
  }
}
