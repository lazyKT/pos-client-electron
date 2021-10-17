console.log("Renderer for user.html");

const { ipcRenderer } = require('electron');

// DOM Nodes
const table = document.getElementById('user-table');


ipcRenderer.invoke('request-all-users', _).then( res => {
  console.log(res);
});


function populateTable({id, username}) {
  const row = table.insertRow(id-1);
  const firstColumn = row.insertCell(0);
  const secondColumn = row.insertCell(1);
  firstColumn.innerHTML = id;
  secondColumn.innerHTML = username;
}
