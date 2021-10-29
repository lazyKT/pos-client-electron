console.log('Main Script Running...');
/*
 Scripts for main.html
 */

// DOM Nodes
// const registerUser = document.getElementById("user");
// const setting = document.getElementById("setting");
// const view_inventory = document.getElementById("inventory")
const logout = document.getElementById('logout');
const contents = document.getElementById('contents');
const mainPage = document.getElementById('main-container');

let newNode = null;

/* hide contents window on first load */
if(contents) contents.style.display = 'none';

// request for login window to go into new page
function requestLoginWindow(pageName) {

  window.api.send('login', pageName);
}

// recieve ipc message from main process to allow redirect
window.api.receive('redirect-page', async pageName => {
  await redirectToNewPage(pageName)
});


/*
 Redirect to New Page
 */
async function redirectToNewPage(pageName) {
  try {
    mainPage.style.display = 'none';
    contents.style.display = 'block';
    
    // IMPORTANT *** set new page filename as [pagename].html. for example inventory.html ***

    // fetch HTML data related to the page name
    const response = await fetch(`${pageName}/${pageName}.html`);

    const data = await response.text();

    newNode = document.createElement('div');

    // load newly fetched html and script inside into app content
    setInnerHTML(newNode, data);
    // console.log(newNode);
    contents.appendChild(newNode);

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
    // console.log(currentScript);
    // create new script element
    const newScript = document.createElement('script');
    // get attributes from the current script
    Array.from(currentScript.attributes).forEach( attribute => {
      // set the current script attributes to new script
      // console.log('old script attribute', attribute.name, attribute.value);
      newScript.setAttribute(attribute.name, attribute.value);
    });
    // import all functions and contents of current script into newly created script
    newScript.appendChild(document.createTextNode(currentScript.innerHTML));
    // replace the new script with current script (aka) load new script for new app content
    (currentScript.parentNode).replaceChild(newScript, currentScript);
  });
}


// fetch and fill contents into app window, based on the page name
// v---- remove the below functions now all the contents fetching will go under content-specific scripts
// async function fetchContents(dataType) {
//
//   switch (dataType) {
//     case 'user':
//       // fetch users
//       window.api.send('get-all-users', 'user');
//       break;
//     case 'inventory':
//       // fetch inventory
//       await fetchItems();
//       break;
//     case 'setting':
//       // show setting page
//       break;
//     default:
//       throw new Error('Unkown Page Name Received');
//   }
// }

// logout
function logoutToMainMenu() {
  try {
    contents.style.display = 'none';
    newNode.remove();
    newNode = null;
    mainPage.style.display = 'flex';
  }
  catch (error) {
    console.log(error);
  }
}
