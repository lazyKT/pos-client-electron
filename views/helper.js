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

    // load newly fetched html and script inside into app content
    setInnerHTML(newNode, data);

    contents.appendChild(newNode);

    // fetch contents based on the page name
    await fetchContents(pageName);
  }
  catch (error) {
    console.log(error);
  }
}


// load newly fetched html and script inside into app content
function setInnerHTML(elm, html) {
  elm.innerHTML = html;

  // get the current script element from the newly fetched html content
  Array.from(elm.querySelectorAll('script')).forEach( currentScript => {
    console.log(currentScript);
    // create new script element
    const newScript = document.createElement('script');
    // get attributes from the current script
    Array.from(currentScript.attributes).forEach( attribute => {
      // set the current script attributes to new script
      newScript.setAttribute(attribute.namem, attribute.value);
    });
    // import all functions and contents of current script into newly created script
    newScript.appendChild(document.createTextNode(currentScript.innerHTML));
    // replace the new script with current script (aka) load new script for new app content
    (currentScript.parentNode).replaceChild(newScript, currentScript);
  });
}


async function fetchContents(dataType) {
  // fetch and fill contents into app window, based on the page name
  switch (dataType) {
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


exports.reloadData = async function reloadData(data) {
  try {
    // get table rows from the current data table
    const oldData = newNode.querySelectorAll('tr');
    // excpet the table header, remove all the data
    oldData.forEach( (node, idx) =>  idx !== 0 && node.remove());

    // reload the data by fetching data based on the data type, and populate the table again
    await fetchContents(data);
  }
  catch (error) {
    console.log(`Error Reloading ${data} data`, error);
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
