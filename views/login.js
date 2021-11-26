// console.log('external login scripts');
//
// // DOM nodes
// const username = document.getElementById('username');
// const password = document.getElementById('password');
// const loginButton = document.getElementById('login');
// const cancelButton  = document.getElementById('login-cancel');
// const errorDiv = document.getElementById('error');
// let route = null
// let serverUrl
//
//
// window.onload = () => {
//   serverUrl = localStorage.getItem("serverUrl");
// }
//
//
// window.onUnload = () => window.loginAPI.removeListeners();
//
//
// window.loginAPI.receive("access-denied", message => {
//   showErrorMessage(message);
// });
//
//
// cancelButton.addEventListener ("click", e => {
//   e.preventDefault();
//   window.loginAPI.send("dismiss-login-window");
// });
//
//
// function toggleModalButtons(show) {
//   if (show) {
//     loginButton.disabled = false;
//     loginButton.innerText = 'Login';
//     cancelButton.style.display = 'block';
//   }
//   else {
//     loginButton.disabled = true;
//     loginButton.innerText = 'Loading...';
//     cancelButton.style.display = 'none';
//   }
// }
//
//
// /** show error message */
// function showErrorMessage(msg) {
//
//   removeErrorMessage();
//
//   let errorNode = document.createElement('div');
//   errorNode.setAttribute('class', 'alert alert-danger');
//   errorNode.setAttribute('role', 'alert');
//   errorNode.setAttribute("id", "error-message-login");
//   errorNode.innerHTML = msg;
//   errorDiv.appendChild(errorNode);
// }
//
//
// function removeErrorMessage() {
//   const errorMessageAlert = document.getElementById("error-message-login");
//   if (errorMessageAlert)
//     errorMessageAlert.remove();
// }
//
//
// // user login/ response
// loginButton.addEventListener('click', async (e) => {
//   e.preventDefault();
//   console.log(username.value, password.value);
//   try {
//     if (username.value === '' || password.value === '') {
//       throw new Error("Required Missing Inputs");
//       return;
//     }
//
//     toggleModalButtons(false);
//
//     const data = {
//       username: username.value,
//       password : password.value
//     };
//
//     const response = await fetch(`${serverUrl}/api/employees/login`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Accept" : "application/json"
//       },
//       body: JSON.stringify(data)
//     });
//
//     if (response && response.ok) {
//       const emp = await response.json();
//       const { level, _id } = emp;
//
//       window.loginAPI.send("login-request", { name: emp.fullName, level, _id});
//     }
//     else {
//       const { message } = await response.json();
//       const errorMessage = message ? message : "Network Connection Error!"
//       showErrorMessage(errorMessage);
//     }
//
//     toggleModalButtons(true);
//   }
//   catch (error) {
//     showErrorMessage(error);
//   }
//   finally {
//     toggleModalButtons(true);
//   }
// });
