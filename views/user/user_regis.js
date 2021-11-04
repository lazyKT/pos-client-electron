/*
 * Create New User
 **/

// DOM Nodes
const cancelBtn = document.getElementById('dismiss-window');
const createBtn = document.getElementById('create-user');
const errorDiv = document.getElementById('error');

document.getElementById('username').focus();

// close create user window
cancelBtn.addEventListener('click', () => {
  window.formAPI.send("dismiss-form-window", "");
});


createBtn.addEventListener('click', async (e) => {
  try {
    // prevent default behaviour on form submit
    e.preventDefault();

    const username = document.getElementById('username').value;
    const mobile = document.getElementById('mobile').value;
    const password = document.getElementById('password').value;
    const accLevel = document.getElementById('acc-lvl').value;

    if (!username && username === '' && !email && email === '' && !password && password === '') {
      throw new Error ("Missing Required Inputs");
    }

    const data = {
      username,
      mobile,
      password,
      level: accLevel
    }

    console.log(data);

    const response = await fetch("http://127.0.0.1:8080/api/employees", {
      method: "POST",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      },
      body: JSON.stringify(data)
    });
    console.log(response);

    if (response.ok) {
      const json = await response.json();
      console.log(json);
      window.formAPI.send('form-data-finish', {method: 'CREATE', data: {username}, type: 'user'});
    }
    else {
      const status = response.status;
      if (status === 400)
        showErorrMessage("user already exists");
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
