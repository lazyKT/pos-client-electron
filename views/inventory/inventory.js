let status = "ready";
// for pagination
let limit = 10;
let page = 1;

let medTags, totalTags, numPages;

// DOM Nodes
const loadingSpinner = document.getElementById("loading-spinner");

/*
# IIFE to fetch medicine tags data once the page loads
**/
(async function () {
  try {
    const response = await fetchTags();

    if (response.ok) {
      const tags = await response.json();
      await createPaginationButtons();
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
      await reloadData({data});
  }
});

const onKeyUp = function onKeyUp(event) {
  if (event.key === 'Enter')
    filterItems();
};


/* filter user data */
async function filterItems () {
  const q = document.getElementById('search-input').value;

  if (!q || q === '')
     return;

  try {
    const response = await searchTags(q);
    console.log(response);
    if (response.ok) {
      const results = await response.json();
      console.log(results);
    }
    else {
      const { message } = await response.json();
      if (message)
        alert(`Error Searching Med Categories: ${message}`);
      else
        alert("Error Searching Med Categories. Code : 500");
    }
    // displayFilteredResults(results);
  }
  catch (error) {
    console.log('Error filtering inventory data', error);
  }
 };


 /* reset filter */
function resetFilter () {
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
async function reloadData (newData) {

  try {
    const itemTable = document.getElementById("item-table");
    const { type, data, method } = newData;

    // get table rows from the current data table
    const oldData = itemTable.querySelectorAll('tr');

    // excpet the table header, remove all the data
    oldData.forEach( (node, idx) =>  idx !== 0 && node.remove());

    // reload the data by fetching data based on the data type, and populate the table again
    const response = await fetchTags();

    if (response.ok) {
      const items = await response.json();

      items.forEach( item => populateItemTable(item));

      if (method === 'CREATE' || method === 'UPDATE')
        showNotification(newData);
    }
    else {
      const { message } = await response.json();
      if (message)
        alert (`Error Reloading: ${message}`);
      else
        alert (`Error Reloading Meds Categories: Server Error`);
    }

    status = 'ready';
  }
  catch (error) {
    console.log(`Error Reloading ${newData.type} data`, error);
  }
};


function displayFilteredResults (results) {
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


/** show this message box when the contents are empty **/
function showEmptyMessage () {
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
function populateItemTable (tags, idx=1) {

  const { _id, name, lowQtyAlert, expiryDateAlert, location } = tags;
  //.log(tags);

  const itemTable = document.getElementById("item-table");

  const row = itemTable.insertRow(idx);
  const firstColumn = row.insertCell(0);
  const secondColumn = row.insertCell(1);
  const thirdColumn = row.insertCell(2);
  const fourthColumn = row.insertCell(3);
  const fifthColumn = row.insertCell(4);

  firstColumn.innerHTML = name;
  thirdColumn.innerHTML = `${expiryDateAlert} Day(s)`;
  fourthColumn.innerHTML = lowQtyAlert;
  // fourthColumn.innerHTML = lowQtyAlert;
  secondColumn.innerHTML = location ? location : "tbh";
  /* edit button */
  const editBtn = document.createElement('button');
  editBtn.setAttribute('class', 'btn mx-1 btn-primary');
  editBtn.setAttribute('data-id', _id);
  editBtn.innerHTML = 'EDIT';
  fifthColumn.appendChild(editBtn);

  editBtn.addEventListener('click', e => {
    window.inventoryAPI.send('item-data', {type: "edit", data: _id});
  });

  /** See Medicine **/
  const seeMedicineButton = document.createElement("button");
  seeMedicineButton.setAttribute("class", "btn mx-1 btn-success");
  seeMedicineButton.setAttribute("data-id", _id);
  seeMedicineButton.innerHTML = "See Medicines";
  fifthColumn.appendChild(seeMedicineButton);

  seeMedicineButton.addEventListener("click", e => {
    window.inventoryAPI.send("item-details", name);
  });

  /* View Details button */
  const viewBtn = document.createElement('button');
  viewBtn.setAttribute('class', 'btn mx-1 btn-info');
  viewBtn.setAttribute('data-id', _id);
  viewBtn.innerHTML = 'See More Details';
  fifthColumn.appendChild(viewBtn);

  viewBtn.addEventListener('click', e => {
    console.log("View Clk");
    window.inventoryAPI.send('item-data', {type: "view", data: _id});
  })
};



function logout() {
  window.inventoryAPI.send ("logout", "");
}



/***********************************************************************
############################ PAGINATION ################################
***********************************************************************/
async function createPaginationButtons () {
  try {

    const response = await getTagsCount();
    if (response.ok) {
      const count = await response.json();

      totalTags = parseInt(count.count);

      numPages = totalTags%limit === 0 ? totalTags/limit : Math.floor(totalTags/limit) + 1;

      displayPagination();
    }
    else {
      const json = await response.json();
      alert(`Error Getting Tags Count: ${json.message}`);
    }
  }
  catch (error) {
    alert(`Error Creating Pagination Buttons: Get Tag Count`);
  }
}


function displayPagination () {
  // populate pagination elements here
  const pagination = document.getElementById("pagination");

  for (let i = 0; i < numPages; i++) {
    const li = document.createElement("li");
    li.setAttribute("class", "page-item");
    li.setAttribute("id", `page-num-${i+1}`);
    li.innerHTML = `<a class="page-link" href="#">${i + 1}</a>`;
    if (i === 0)
      li.classList.add("active");
    pagination.insertBefore(li, pagination.children[pagination.childElementCount - 1]);

    /** on click event on pagination elements */
    li.addEventListener("click", async (event) => {
      try {
        page = i+1;
        await reloadData({});
        (pagination.querySelectorAll("li")).forEach(
          p => p.classList.remove("active")
        );
        li.classList.add("active");

        togglePaginationButtons();
      }
      catch (error) {
        alert("Error Performing Click on Pagination Items");
      }
    });

  }

  togglePaginationButtons();
}


/** handle pagination next button click events */
async function nextPaginationClick (event) {
  try {
    console.log(page, numPages);
    if (page && page < numPages) {
      page += 1;
      await reloadData({});
      (pagination.querySelectorAll("li")).forEach(
        p => p.classList.remove("active")
      );
      (document.getElementById(`page-num-${page}`)).classList.add("active");

      togglePaginationButtons();
    }
  }
  catch (error) {
    alert("Error Performing Click on Pagination Next Button");
  }
}

/** handle pagination previous button click events */
async function prevPaginationClick (event) {
  try {
    if (page && page > 1) {
      page -= 1;
      await reloadData({});
      (pagination.querySelectorAll("li")).forEach(
        p => p.classList.remove("active")
      );
      (document.getElementById(`page-num-${page}`)).classList.add("active");

      togglePaginationButtons();
    }
    else {
      event.target.setAttribute("aria-disabled", true);
      event.target.parentNode.classList.add("disabled");
    }
  }
  catch (error) {
    alert("Error Performing Click on Pagination Next Button");
  }
}


/** Toggle Pagination Buttons State **/
function togglePaginationButtons () {
  /**
  # disable/enable next/prev pagination buttons
  **/
  if (page === 1) {
    // disable prev buttons, enable next buttons
    (document.getElementById("previous")).classList.add("disabled");
    (document.getElementById("previous")).children[0].setAttribute("aria-disabled", true);
    (document.getElementById("next")).classList.remove("disabled");
    (document.getElementById("next")).children[0].removeAttribute("aria-disabled");
  }
  else if (page === numPages) {
    // disable next buttons, enable prev buttons
    (document.getElementById("next")).classList.add("disabled");
    (document.getElementById("next")).children[0].setAttribute("aria-disabled", true);
    (document.getElementById("previous")).classList.remove("disabled");
    (document.getElementById("previous")).children[0].removeAttribute("aria-disabled");
  }
  else {
    // enable both next/prev buttons
    (document.getElementById("previous")).classList.remove("disabled");
    (document.getElementById("previous")).children[0].removeAttribute("aria-disabled");
    (document.getElementById("next")).classList.remove("disabled");
    (document.getElementById("next")).children[0].removeAttribute("aria-disabled");
  }
}


/***********************************************************************
################## CREATE NEW TAGS AND MEDICINES TAB ###################
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

/**
# Create New Medicine Tags
**/
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


/**
# Create or Add Medicines
**/
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
async function fetchTags () {
  try {
    const response = await fetch(`http://127.0.0.1:8080/api/tags?page=${page}&limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept" : "application.json"
      }
    });

    return response;
  }
  catch (error) {
    alert(`Error Fetching Med Categories!`)
  }
}


async function getTagsCount () {
  try {
    const response = await fetch("http://127.0.0.1:8080/api/tags/count", {
      method: "GET",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      }
    });

    return response;
  }
  catch (error) {
    alert(`Error Creating Pagination Buttons: Get Tag Count`);
  }
}


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


/** Search Meds Tags by Keyword **/
async function searchTags (q) {
  try {
    const response = await fetch(`http://127.0.0.1:8080/api/meds/search?q=${q}`, {
      method: "GET",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      }
    });

    return response;
  }
  catch (error) {
    console.error(`Error Search Meds Categories: ${error}`);
  }
}
