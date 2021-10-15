// helper functions
const container = document.getElementById('register-user');
const mainPage = document.getElementById('main-container');

// if admin user login is successful, redirect into admin pannel
exports.redirectToAdminPannel = async function redirectToAdminPannel(pannelName) {
  try {
    mainPage.style.display = 'none';
    if (pannelName === 'user-register') {
      const response = await fetch('register/register.html');
      const content = await response.text()
      console.log(content);

      const registerNode = document.createElement('div');
      registerNode.setAttribute('class', 'container');
      registerNode.innerHTML = content;
      container.appendChild(registerNode);
    }
  }
  catch (error) {
    console.log(error);
  }
}
