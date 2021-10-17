// helper functions
const container = document.getElementById('register-user');
const mainPage = document.getElementById('main-container');
const contents = document.getElementById('contents');
const contentTitle = document.getElementById('content-title');

let newNode

// if admin user login is successful, redirect into admin pannel
exports.redirectToAdminPannel = async function redirectToAdminPannel(pannelName) {
  try {
    mainPage.style.display = 'none';
    contents.style.display = 'block';
    if (pannelName === 'register') {
      const response = await fetch('register/register.html');
      const newContent = await response.text()
      console.log(newContent);
      contentTitle.innerText = 'Register New Users';
      newNode = document.createElement('div');
      // registerNode.setAttribute('class', 'container-fluid');
      newNode.innerHTML = newContent;
    }

    contents.appendChild(newNode);
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
