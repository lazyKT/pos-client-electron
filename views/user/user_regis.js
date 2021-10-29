/*
 * Create New User
 **/
console.log('user_regis.js running...');

// DOM Nodes
const cancelBtn = document.getElementById('dismiss-window');
const createBtn = document.getElementById('create-user');
const errorDiv = document.getElementById('error');


// close create user window
cancelBtn.addEventListener('click', () => {
  window.formAPI.send("dismiss-form-window", "");
});


createBtn.addEventListener('click', async (e) => {

  try {
    // prevent default behaviour on form submit
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!username && username === '' && !email && email === '' && !password && password === '') {
      throw new Error ("Missing Required Inputs");
    }


    // make create new user request to main process
    const response = await window.formAPI.invoke ("create-new-user", {username, email, password});

    console.log(response);
    if (response === 201) {
      // inform the main process that new data creation is done
      ipcRenderer.send('form-data-finish', {method: 'CREATE', data: {username}, type: 'user'});
    }
  }
  catch (error) {
    console.log('Error Fetching Create-New-User Response', error);
    showErorrMessage(error);
  }
});


function showErorrMessage (message) {
  let errorNode = document.createElement('div');
  errorNode.setAttribute('class', 'alert alert-danger');
  errorNode.setAttribute('role', 'alert');
  errorNode.innerHTML = message;
  errorDiv.appendChild(errorNode);
}
