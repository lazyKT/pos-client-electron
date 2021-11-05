console.log('User Scripts Running..');

const loadingSpinner = document.getElementById("loading-spinner");

/*
  create userRenderer property and assign to the global window object
 */
// console.log(this, this === window);
userRenderer = {
  /* renderer status */
  status: 'ready',
  /* fetch all user data */
  loadUserData: async () => {

    try {
      const response = await fetch("http://127.0.0.1:8080/api/employees", {
        method: "GET",
        headers: {
          "Content-Type" : "application/json",
          "Accept" : "application/json"
        }
      });

      if (response.ok) {
        const json = await response.json();
        // console.log(json);
        return json;
      }
      else {
        const json = await response.json();
        console.log(json);
      }
    }
    catch (error) {
      console.error("Error Fetching Employees:", error);
    }
  },
  /* create new user */
  createUser: () => {
    window.api.send('create-modal', 'user');
  },
  onKeyUp: function onKeyUp(event) {
    if (event.key === 'Enter')
      window.userRenderer.filterUsers();
  },
  /* filter user data */
  filterUsers: async () => {
    const q = document.getElementById('search-input').value;

    if (!q || q === '')
      return;

    try {
        const response = await fetch(`http://127.0.0.1:8080/api/employees/search?q=${q}`, {
          method: "GET",
          headers: {
            "Content-Type" : "application/json",
            "Accept" : "application/json"
          }
        });


        if (response.ok) {
          const results = await response.json();
          window.userRenderer.displayFilteredResults(results);
        }

    }
    catch (error) {
        console.log('Error filtering user data', error);
    }
  },
  /* reset filter */
  resetFilter: () => {
    const searchInput = document.getElementById('search-input');
    searchInput.value = '';

    /* remove the empty message box if the search results were found */
    const emptyMessageBox = document.getElementById('empty-message-box');
    if (emptyMessageBox)
      emptyMessageBox.remove();

    // window.api.send('form-data-finish', {method: 'GET', type: 'user'});
    window.userRenderer.reloadData({method: 'GET', type: 'user'});
  },
  /* reload data after every mutation event on user data */
  reloadData: async newData => {

    try {
      const { type, data, method } = newData;

      // get table rows from the current data table
      const oldData = document.querySelectorAll('tr');

      // excpet the table header, remove all the data
      oldData.forEach( (node, idx) =>  idx !== 0 && node.remove());

      // reload the data by fetching data based on the data type, and populate the table again
      const users = await window.userRenderer.loadUserData();

      users.forEach( user => window.userRenderer.populateUserTable(user));

      if (method === 'CREATE' || method === 'UPDATE')
        window.api.showNotification(newData);

      window.userRenderer.status = 'ready';
    }
    catch (error) {
      console.log(`Error Reloading ${newData.type} data`, error);
    }
  },
  /* display filtered results */
  displayFilteredResults: (results) => {
    // get table rows from the current data table
    const oldData = document.querySelectorAll('tr');

    // get rid of the empty-message-box if avaialble
    const emptyMessageBox = document.getElementById('empty-message-box');
    if (emptyMessageBox) emptyMessageBox.remove();

    // excpet the table header, remove all the data
    oldData.forEach( (node, idx) =>  idx !== 0 && node.remove());

    if (results.length > 0)
      results.forEach( (result, idx) => window.userRenderer.populateUserTable(result, idx + 1));
    else
      window.userRenderer.showEmptyMessage();
  },
  /* display the user data in the table */
  populateUserTable: (empData, idx=1) => {

    const { _id, username, mobile, level } = empData;
    const userTable = document.getElementById('user-table');

    const row = userTable.insertRow(idx);
    const firstColumn = row.insertCell(0);
    const secondColumn = row.insertCell(1);
    const thirdColumn = row.insertCell(2);
    const forthColumn = row.insertCell(3);
    const fifthColumn = row.insertCell(4);

    firstColumn.innerHTML = _id;
    secondColumn.innerHTML = username;
    thirdColumn.innerHTML = mobile;
    forthColumn.innerHTML = level;
    /* edit button */
    const editBtn = document.createElement('button');
    editBtn.setAttribute('class', 'btn mx-1 btn-primary');
    editBtn.setAttribute('data-id', _id);
    editBtn.innerHTML = 'EDIT';
    fifthColumn.appendChild(editBtn);
    //
    editBtn.addEventListener('click', e => {
      window.api.send('user-data', {_id, method: 'PUT'});
    });
    /* View Details button */
    const viewBtn = document.createElement('button');
    viewBtn.setAttribute('class', 'btn mx-1 btn-info');
    viewBtn.setAttribute('data-id', _id);
    viewBtn.innerHTML = 'View More Details';
    fifthColumn.appendChild(viewBtn);

    viewBtn.addEventListener('click', e => {
      window.api.send('user-data', {_id, method: 'GET'});
    })
  },
  showEmptyMessage: () => {
    const searchInput = document.getElementById('search-input');
    const dataContainer = document.getElementById('data-container');
    const div = document.createElement('div');
    div.setAttribute('id', 'empty-message-box');
    div.setAttribute('class', 'alert alert-info');
    div.setAttribute('role', 'alert');
    div.innerHTML = `No result found related to ${searchInput.value}`;
    dataContainer.appendChild(div);
  },
  exportCSV: () => {

    window.api.send('export-csv', 'user');
  },
  logout: () => {
    console.log("logout click");
    window.api.send("user-logout", "");
  }
};


/* this IIFE will run whenever the user page contents are loaded */
(async function(window) {
  const response = await fetch("http://127.0.0.1:8080/api/employees", {
    method: "GET",
    headers: {
      "Content-Type" : "application/json",
      "Accept" : "application/json"
    }
  });

  if (response.ok) {
      const employees = await response.json();
      loadingSpinner.style.display = "none";
      employees.forEach( employee => window.userRenderer.populateUserTable(employee));
  }

})(window);


window.api.receive('reload-data', async (data) => {

  if (window.userRenderer.status === 'ready') {
      window.userRenderer.status = 'reloading';
      await window.userRenderer.reloadData(data);
  }
});
