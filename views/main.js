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


window.onload = () => {
  localStorage.setItem("serverUrl", "http://127.0.0.1:8080");
  console.log("Local Storage Saved");
  hideErrorMessage();
};


window.onUnload = () => window.api.removeListeners();


// request for login window to go into new page
function requestLoginWindow(pageName) {
  //console.log("PageName", pageName);
  if (pageName === "user") {
    loginModal.style.display = "flex";
  }
  else {
    window.api.send('login', pageName);
  }
}


async function loginUserToUserPannel(event) {
  try {
    event.preventDefault();
    toggleButtonState(event.target, "loading");
    const username = document.getElementById("username")?.value;
    const password = document.getElementById("password")?.value;

    if (!username || username === '' || !password || password === '') {
      showErrorMessage("Invalid Credentials");
      toggleButtonState(event.target, "done");
      return;
    }

    const response = await loginUserRequest({username, password});

    if (response && response.ok) {
      const emp = await response.json();
      if (parseInt(emp.level) === 3) {
        // success
        closeLoginModal(event);
        window.api.send("login-user", {name: emp.fullName, id: emp._id});
      }
      else {
        // access denied
        showErrorMessage("Error. Access Denied!");
        return;
      }
    }
    else {
      const { message } = await response.json();
      const errorMessage = message ? message : "Network Connection Error!";
      showErrorMessage(errorMessage);
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
