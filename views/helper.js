// helper functions
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
exports.redirectToAdminPannel = async function redirectToAdminPannel(pageName) {
  try {
    mainPage.style.display = 'none';
    contents.style.display = 'block';
    contentTitle.innerText = 'Pharmacy';

    // IMPORTANT *** set new page filename as [pagename].html. for example inventory.html ***

    // fetch HTML data related to the page name
    const response = await fetch(`${pageName}/${pageName}.html`);

    const data = await response.text();

    newNode = document.createElement('div');

    newNode.innerHTML = data;

    contents.appendChild(newNode);

    // fetch contents based on the page name
    await fetchContents(pageName);
  }
  catch (error) {
    console.log(error);
  }
}


async function fetchContents(pageName) {
  // fetch and fill contents into app window, based on the page name
  switch (pageName) {
    case 'user':
      // fetch users
      await fetchUsers();
      break;
    case 'inventory':
      // fetch inventory
      break;
    case 'setting':
      // show setting page
      break;
    default:
      throw new Error('Unkown Page Name Received');
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
