/*
 Scripts for main.html
 */

// DOM Nodes
// const registerUser = document.getElementById("user");
// const setting = document.getElementById("setting");
// const view_inventory = document.getElementById("inventory")
const logout = document.getElementById('logout');
const loginModal = document.getElementById('login-modal-container');
const mainPage = document.getElementById('main-container');

let newNode = null;

const printOptions = {
  name: "",
  mode: 0 // production mode
};

window.onload = () => {
  localStorage.setItem("serverUrl", "http://127.0.0.1:8080");
  localStorage.setItem("printOptions", JSON.stringify(printOptions));
  hideErrorMessage();
};


window.onUnload = () => window.api.removeListeners();


// request for login window to go into new page
function requestLoginWindow(pageName) {
  //console.log("PageName", pageName);
  if (pageName)
    showLoginModal(pageName);
  else
    showComingSoonModal();
}


async function loginUserToUserPannel(event) {
  try {
    event.preventDefault();
    toggleButtonState(event.target, "loading");
    const pageSelection = document.getElementById("content-selection")?.value;
    const username = document.getElementById("username")?.value;
    const password = document.getElementById("password")?.value;
    console.log('page selection', pageSelection);

    if (!pageSelection || pageSelection === '') {
      showErrorMessage("Please Choose Valid Page to Log in");
      return;
    }

    if (!username || username === '' || !password || password === '') {
      showErrorMessage("Invalid Credentials");
      toggleButtonState(event.target, "done");
      return;
    }

    const response = await loginUserRequest({username, password});

    if (response && response.ok) {
      const emp = await response.json();
      handleRoutesAfterLogin(event, pageSelection, emp);
    }
    else {
      const { message } = await response.json();
      const errorMessage = message ? message : "Network Connection Error!";
      showErrorMessage(errorMessage);
      (document.getElementById("password")).value = "";
    }
  }
  catch (error) {
    console.log(error);
    showErrorMessage("Application Error. Please Contact the Developers!");
  }
  finally {
    toggleButtonState(event.target, "done");
  }
}


async function handleRoutesAfterLogin (event, pageName, employee) {
  try {
    if (pageName === 'Employee' || pageName === 'Doctor' || pageName === 'Patient') {
      if (parseInt(employee.level) === 3) {
        closeLoginModal(event);
        saveInLocalStorage({name: employee.fullName, _id: employee._id});
        window.api.send("login-user", {name: employee.fullName, _id: employee._id, page: pageName});
      }
      else
        showErrorMessage("Error. Access Denied!");
    }
    else if (pageName === 'Inventory') {
      if (parseInt(employee.level) === 2 || parseInt(employee.level) === 3) {
        closeLoginModal(event);
        saveInLocalStorage({name: employee.fullName, _id: employee._id});
        window.api.send("login", {name: employee.fullName, _id: employee._id, page: pageName});
      }
      else
        showErrorMessage("Error. Access Denied!");
    }
    else if (pageName === 'Clinic' || pageName === 'Pharmacy'){
      closeLoginModal(event);
      saveInLocalStorage({name: employee.fullName, _id: employee._id});
      window.api.send("login", {name: employee.fullName, _id: employee._id, page: pageName});
    }
    else if (pageName === 'Bookings'){
      closeLoginModal(event);
      saveInLocalStorage({name: employee.fullName, _id: employee._id});
      window.api.send("login", {name: employee.fullName, _id: employee._id, page: pageName});
    }
    else {
      showComingSoonModal();
    }
  }
  catch (error) {
    throw new Error(error);
  }
}


/**
# Save User Auth Details at LocalStorage
**/
function saveInLocalStorage (user) {
  localStorage.setItem("user", JSON.stringify(user));
}


/**
# Open Login Modal
**/
function showLoginModal (pageName) {
  loginModal.style.display = "flex";
  // populate content selection tag based on pageName
  populatePageSelection (pageName);
}

function showComingSoonModal () {
  (document.getElementById('info-modal')).style.display = "flex";
}


/**
# Populate Page-Selection Select Tag based on pageName
**/
function populatePageSelection (pageName) {
  try {
    const pageSelectionSelect = document.getElementById("content-selection");
    switch (pageName) {
      case "user":
        syncOptionsForPageSelection (pageSelectionSelect, ["Doctor", "Employee", "Patient"]);
        break;
      case "bookings":
        syncOptionsForPageSelection (pageSelectionSelect, ["Bookings"]);
        break;
      case "sales":
        syncOptionsForPageSelection (pageSelectionSelect, ["Sales"]);
        break;
      case "cashier":
        syncOptionsForPageSelection (pageSelectionSelect, ["Clinic", "Pharmacy"]);
        break;
      case "service":
        syncOptionsForPageSelection (pageSelectionSelect, ["Medical Services"]);
        break;
      case "inventory":
        syncOptionsForPageSelection (pageSelectionSelect, ["Inventory"]);
        break;
      default:
        throw new Error ("Invalid Page Selection");
    }
  }
  catch (error) {

  }
}


/**
# Fill Contents options to Page Selection Tag
**/
function syncOptionsForPageSelection (parentDom, selections) {
  removeOptionsFromPageSelection (parentDom);
  selections.forEach (
    selection => {
      const option = document.createElement('option');
      option.setAttribute("value", selection);
      option.innerHTML = selection;
      parentDom.appendChild(option);
    }
  );
}


/**
# Remove Current Options from Page-Selection Select Tag
**/
function removeOptionsFromPageSelection (selectDOM) {
  while (selectDOM.childElementCount > 1) {
    selectDOM.removeChild(selectDOM.lastChild);
  }
}


function toggleButtonState (button, status) {
  if (status === 'loading') {
    button.innerHTML = "Loading ...";
    button.setAttribute("disabled", true);
  }
  else if (status === 'done') {
    button.innerHTML = "Login";
    button.removeAttribute("disabled");
  }
}


function closeLoginModal (event) {
  event.preventDefault();
  loginModal.style.display="none";
  clearInputs();
  hideErrorMessage();
}


function closeInfoModal () {
  (document.getElementById('info-modal')).style.display = 'none';
}


function clearInputs () {
  const inputs = document.querySelectorAll("input");
  inputs.forEach( i => {
    i.value = "";
  });
}


function showErrorMessage(message) {
  const errorAlert = document.getElementById("error-alert");
  errorAlert.style.display = "block";
  errorAlert.innerHTML = message;
}


function hideErrorMessage() {
  const errorAlert = document.getElementById("error-alert");
  errorAlert.style.display = "none";
}


async function loginUserRequest (user) {
  try {
    const serverUrl = localStorage.getItem("serverUrl");
    const response = await fetch(`${serverUrl}/api/employees/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept" : "application/json"
      },
      body: JSON.stringify(user)
    });

    return response;
  }
  catch (error) {
    console.error(error);
  }
}
