let status = "ready";
// for pagination
let limit = 10;
let page = 1;

let medTags;

// DOM Nodes
const loadingSpinner = document.getElementById("loading-spinner");

/*
# IIFE to fetch medicine tags data once the page loads
**/
(async function () {
  try {
    const response = await fetch(`http://127.0.0.1:8080/api/tags?page=${page}&limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept" : "application.json"
      }
    });

    if (response.ok) {
      const tags = await response.json();
      (document.getElementById("loading-spinner")).style.display = "none";
      medTags = tags;
      addMedTagsToMedicineForm();
      tags.forEach(
        tag => populateItemTable(tag)
      )
    }
    else {
      // show error
    }
  }
  catch (error) {
    alert(`Error Fetching Tags: ${error}`);
  }
})()

window.inventoryAPI.receive('reload-data', async data => {

  if (status === 'ready') {
      status = 'reloading';
      await reloadData(data);
  }
});

const onKeyUp = function onKeyUp(event) {
  if (event.key === 'Enter')
    filterItems();
};

/* filter user data */
const filterItems = async () => {
  const q = document.getElementById('search-input').value;

  if (!q || q === '')
     return;

  try {
         const results = await window.inventoryAPI.invoke('search-data', {data: 'item', q});

         displayFilteredResults(results);
     }
     catch (error) {
         console.log('Error filtering inventory data', error);
     }
   };
   /* reset filter */
const resetFilter = () => {
     const searchInput = document.getElementById('search-input');
     searchInput.value = '';

     /* remove the empty message box if the search results were found */
     const emptyMessageBox = document.getElementById('empty-message-box');
     if (emptyMessageBox)
       emptyMessageBox.remove();

     // window.api.send('form-data-finish', {method: 'GET', type: 'user'});
     reloadData({method: 'GET', type: 'item'});
   };
/**
 Reload the inventory data fetched from main process
**/
const reloadData = async newData => {

  try {
    const itemTable = document.getElementById("item-table");
    const { type, data, method } = newData;

    // get table rows from the current data table
    const oldData = itemTable.querySelectorAll('tr');

    // excpet the table header, remove all the data
    oldData.forEach( (node, idx) =>  idx !== 0 && node.remove());

    // reload the data by fetching data based on the data type, and populate the table again
    const items = await requestAllItems();

    items.forEach( item => populateItemTable(item));

    if (method === 'CREATE' || method === 'UPDATE')
      showNotification(newData);

    status = 'ready';
  }
  catch (error) {
    console.log(`Error Reloading ${newData.type} data`, error);
  }
};


/**
# Request all the inventory items from the main process
**/
const requestAllItems = async () => {

  try {
    const response = await window.inventoryAPI.invoke('get-all-items');

    return response;
  }
  catch (error) {
    console.log('Error fetching all items', error);
  }
};

const displayFilteredResults = (results) => {
  // get table rows from the current data table
  const oldData = document.querySelectorAll('tr');

  // get rid of the empty-message-box if avaialble
  const emptyMessageBox = document.getElementById('empty-message-box');
  if (emptyMessageBox) emptyMessageBox.remove();

  // excpet the table header, remove all the data
  oldData.forEach( (node, idx) =>  idx !== 0 && node.remove());

  if (results.length > 0)
    results.forEach( (result, idx) => populateItemTable(result, idx + 1));
  else
    showEmptyMessage();
};
const showEmptyMessage = () => {
       const searchInput = document.getElementById('search-input');
       const dataContainer = document.getElementById('data-container');
       const div = document.createElement('div');
       div.setAttribute('id', 'empty-message-box');
       div.setAttribute('class', 'alert alert-info');
       div.setAttribute('role', 'alert');
       div.innerHTML = `No result found related to ${searchInput.value}`;
       dataContainer.appendChild(div);
     };

/**
# Display the invetory items in the table
**/
const populateItemTable = (tags, idx=1) => {

  const { _id, name, lowQtyAlert, expiryDateAlert } = tags;
  //.log(tags);
  const location = "tbh";

  const itemTable = document.getElementById("item-table");

  const row = itemTable.insertRow(idx);
  const firstColumn = row.insertCell(0);
  const secondColumn = row.insertCell(1);
  const thirdColumn = row.insertCell(2);
  const fourthColumn = row.insertCell(3);
  const fifthColumn = row.insertCell(4);
  const sixthColumn = row.insertCell(5);

  firstColumn.innerHTML = _id;
  secondColumn.innerHTML = name;
  thirdColumn.innerHTML = `${expiryDateAlert} Day(s)`;
  fourthColumn.innerHTML = lowQtyAlert;
  fifthColumn.innerHTML = location;
  /* edit button */
  const editBtn = document.createElement('button');
  editBtn.setAttribute('class', 'btn mx-1 btn-primary');
  editBtn.setAttribute('data-id', _id);
  editBtn.innerHTML = 'EDIT';
  sixthColumn.appendChild(editBtn);

  editBtn.addEventListener('click', e => {
    window.inventoryAPI.send('item-data', {_id, method: 'PUT'});
  });
  /* View Details button */
  const viewBtn = document.createElement('button');
  viewBtn.setAttribute('class', 'btn mx-1 btn-info');
  viewBtn.setAttribute('data-id', _id);
  viewBtn.innerHTML = 'View More Details';
  sixthColumn.appendChild(viewBtn);

  viewBtn.addEventListener('click', e => {
    window.inventoryAPI.send('item-details', {_id, method: 'GET'});
  })
};



function logout() {
  window.inventoryAPI.send ("logout", "");
}



/***********************************************************************
################## CREATE NEW TAGS AND MEDICINES TAB #######################
***********************************************************************/
function addMedTagsToMedicineForm () {
  const tagSelect = document.getElementById("inputTag");

  medTags.forEach(
    tag => {
      const option = document.createElement("option");
      option.setAttribute("vlaue", tag.name);
      option.innerHTML = tag.name;
      tagSelect.appendChild(option);
    }
  );
}


async function createTag (event) {
  try {
    event.preventDefault();

    const name = document.getElementById("inputCreateType").value;
    const lowQtyAlert = document.getElementById("inputAlertQuantity").value;
    const expiryDateAlert = document.getElementById("inputAlertExpiryDate").value;
    const location = document.getElementById("inputLocation").value;

    if (!name || name === '' || !lowQtyAlert || lowQtyAlert === '' || !expiryDateAlert || expiryDateAlert === '' || !location || location === '') {
      throw new Error ("Missing Required Data");
    }

    const response = await createTagRequest({
      name,
      lowQtyAlert: parseInt(lowQtyAlert),
      expiryDateAlert: parseInt(expiryDateAlert),
      location
    });

    if (response.ok) {
      const tag = await response.json();
      alert(`New Category Created : ${tag.name}`);
    }
    else {
      // show error
      const json = await response.json();

      alert(`Error: ${json.message}`);
    }

    document.getElementById("inputCreateType").value = '';
    document.getElementById("inputAlertQuantity").value = '';
    document.getElementById("inputAlertExpiryDate").value = '';
    document.getElementById("inputLocation").value = '';
  }
  catch (error) {
    console.error(`Error Creating New Category`, error);
  }
}


async function addMedicine (event) {
  try {
    event.preventDefault();

    const name = document.getElementById("inputDescription").value;
    const qty = document.getElementById("inputQuantity").value;
    const expiryDate = document.getElementById("inputExpiryDate").value;
    const productNumber = document.getElementById("inputProductId").value;
    const approved = document.getElementById("inputApproved").value;
    const tag = document.getElementById("inputTag").value;
    const price = document.getElementById("inputPrice").value;
    const description = document.getElementById("inputIngredients").value;

    if (!name || name === '' || !qty || qty === '' || !expiryDate || expiryDate === '' || !price || price === '' ||
          !productNumber || productNumber === '' || !approved || approved === '' || !tag || tag === '') {
      throw new Error ("Missing Required Data");
    }

    const re = new RegExp("^[0-9]+$");
    if (!re.test(price)) {
      // validating price input
      alert(`Invalid Price: ${price}`);
      return;
    }

    const response = await addMedicineRequest({
      name,
      qty: parseInt(qty),
      expiry: expiryDate,
      productNumber,
      tag,
      price: parseInt(price),
      description
    });

    if (response.ok) {
      const med = await response.json();

      alert(`Medicine Added Successfully.\nMed Name: ${med.name}`);
    }
    else {
      const json = await response.json();

      alert(`Erorr add medicine: ${json.message}`);
    }

    document.getElementById("inputDescription").value = '';
    document.getElementById("inputQuantity").value = '';
    document.getElementById("inputExpiryDate").value = '';
    document.getElementById("inputProductId").value = '';
    document.getElementById("inputApproved").value = '';
    document.getElementById("inputTag").value = '';
    document.getElementById("inputPrice").value = '';
    document.getElementById("inputIngredients").value = '';
  }
  catch (error) {
    console.error(`Error Creating New Category`, error);
    alert(`Error adding medicine: app error`);
  }
}

/***********************************************************************
####################### Network Requests ###############################
***********************************************************************/
async function createTagRequest (tag) {
  try {
    const response = await fetch("http://127.0.0.1:8080/api/tags", {
      method: "POST",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      },
      body: JSON.stringify(tag)
    });

    return response;
  }
  catch (error) {
    console.error(`Error Creating Tag ${error}`);
  }
}


async function addMedicineRequest (med) {
  try {
    console.log(med);
    const response = await fetch("http://127.0.0.1:8080/api/meds", {
      method: "POST",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      },
      body: JSON.stringify(med)
    });

    return response;
  }
  catch (error) {
    console.error(`Error Adding Medicine ${med}`);
  }
}
