let status = "ready";
// for pagination
let limit = 10;
let page = 1;
let order = 1;
let sort = "name";

let medTags, totalTags, numPages;
let serverURL;
let filtering = false;

// DOM Nodes
const loadingSpinner = document.getElementById("loading-spinner");



window.inventoryAPI.receive("server-url", async url => {
  try {

    serverURL = url;
    const response = await fetchTags();

    if (response && response.ok) {
      const tags = await response.json();
      await createPaginationButtons();

      displayData(tags);
    }
    else {
      // show error
      (document.getElementById("loading-spinner")).style.display = "none";
      const { message } = await response.json();
      const errMessage = message ? `Error Fetching Category: ${message}` : "Error Fetching Category. code : 500";
      alert(errMessage);
      showErrorMessage(errMessage);
    }
  }
  catch (error) {
    alert(`Error Fetching Tags: code: null`);
    showErrorMessage(`Error Fetching Tags: code: null`);
  }
});


window.inventoryAPI.receive('reload-data', async data => {

  if (status === 'ready') {
      status = 'reloading';
      await reloadData({data});
  }
});


/**
# Change Number of Items to show in one page
**/
async function changeNumPerPage (num) {
  try {
    limit = parseInt(num);
    console.log(limit);
    await reloadData({});
    await createPaginationButtons();
  }
  catch (error) {
    console.log(error);
    alert (`Error Changing Number Of Items Per Page. code null`);
  }
}


/**
# Change Sorting Field
**/
async function changeSort(field) {
  try {
    sort = field;
    await reloadData({});
    await createPaginationButtons();
  }
  catch (error) {
    console.log(error);
    alert (`Error Changing Sorting Field. code null`);
  }
}


function exportCSV() {
  window.inventoryAPI.send("open-export-options");
}



/***
# Search Input OnChange Event
***/
async function onKeyUp(event) {
  const cancelButton = document.getElementById('cancel-search');
  const inputValue = document.getElementById('search-input').value;

  if(inputValue !== null){
    cancelButton.style.display = 'block';
  }
  if(inputValue === '' && (event.key === 'Backspace' || event.key === 'Delete')){
    cancelButton.style.display = 'none';
  }

  if (event.key === 'Enter')
    await filterTags();
};


/**
# Display Fetched Data
**/
async function displayData (tags) {
  try {

    (document.getElementById("loading-spinner")).style.display = "none";
    (document.getElementById("pagination")).style.display = "flex";
    medTags = tags;
    await addMedTagsToMedicineForm();
    tags.forEach(
      (tag, idx) => populateItemTable(tag, idx + 1)
    )
  }
  catch (error) {
    alert ("Error Display Medicine Category. code null");
  }
}


/* filter user data */
async function filterTags () {
  const q = document.getElementById('search-input').value;

  if (!q || q === '')
     return;

  console.log(q);

  try {
    filtering = true;
    const response = await searchTags(q);

    if (response.ok) {
      const tags = await response.json();

      if (tags.length === 0) {
        // show empty message
        showEmptyMessage(q);
      }
      else {
        displayFilteredResults(tags);
      }
      totalTags = tags.length
      numPages = Math.floor(totalTags/limit) + 1
      await createPaginationButtons();
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
async function resetFilter () {
  filtering = false;
  const searchInput = document.getElementById('search-input');
  searchInput.value = '';

  /* remove the empty message box if the search results were found */
  const emptyMessageBox = document.getElementById('empty-message-box');
  if (emptyMessageBox)
   emptyMessageBox.remove();

  // window.api.send('form-data-finish', {method: 'GET', type: 'user'});
  reloadData({method: 'GET', type: 'item'});
  await createPaginationButtons();
};


/**
 Reload the inventory data fetched from main process
**/
async function reloadData (newData, q="") {

  try {
    const itemTable = document.getElementById("item-table");
    const { type, data, method } = newData;

    // get table rows from the current data table
    const oldData = itemTable.querySelectorAll('tr');

    // excpet the table header, remove all the data
    oldData.forEach( (node, idx) =>  idx !== 0 && node.remove());

    // reload the data by fetching data based on the data type, and populate the table again
    let response

    if (q === "")
       response = await fetchTags();
    else
      response = await searchTags(q);

    if (response.ok) {
      const tags = await response.json();

      displayData(tags);

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


/**
# Display Search Results
**/
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
    window.inventoryAPI.send('item-data', {
      type: "edit",
      data: {
        id: _id,
        url: serverURL
      }
    });
  });

  /** See Medicine **/
  const seeMedicineButton = document.createElement("button");
  seeMedicineButton.setAttribute("class", "btn mx-1 btn-success");
  seeMedicineButton.setAttribute("data-id", _id);
  seeMedicineButton.innerHTML = "See Medicines";
  fifthColumn.appendChild(seeMedicineButton);

  // seeMedicineButton.addEventListener("click", e => {
  //   window.inventoryAPI.send("item-details", data: {name, url: serverURL})
  // });
  seeMedicineButton.addEventListener("click", e => {
    window.inventoryAPI.send("item-details", {
      name: name,
      url: serverURL
    })
  });

  /* View Details button */
  const viewBtn = document.createElement('button');
  viewBtn.setAttribute('class', 'btn mx-1 btn-info');
  viewBtn.setAttribute('data-id', _id);
  viewBtn.innerHTML = 'See More Details';
  fifthColumn.appendChild(viewBtn);

  viewBtn.addEventListener('click', e => {
    console.log("View Clk");
    window.inventoryAPI.send('item-data', {
      type: "view",
      data: {
        id: _id,
        url: serverURL
      }
    });
  })
};


/**
# Error Message Box
**/
function showErrorMessage (msg) {
  const div = document.createElement("div");
  div.setAttribute("class", "alert alert-danger");
  div.setAttribute("role", "alert");
  div.setAttribute("id", "tag-error-box");
  div.innerHTML = msg;
  const dataContainer = document.getElementById('data-container');
  dataContainer.appendChild(div);

  (document.getElementById("loading-spinner")).style.display = "none";
  (document.getElementById("pagination")).style.display = "none";
}


/**
# Remove Error/Empty MessageBoxes
**/
function removeMessageBoxes () {
  // get rid of the empty-message-box if avaialble
  const emptyMessageBox = document.getElementById('empty-message-box');
  if (emptyMessageBox) emptyMessageBox.remove();

  const errorMessageBox = document.getElementById("tag-error-box");
  if (errorMessageBox) errorMessageBox.remove();
}


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
      if (!filtering && limit !== 0) {
        const count = await response.json();

        totalTags = parseInt(count.count);

        numPages = totalTags%limit === 0 ? totalTags/limit : Math.floor(totalTags/limit) + 1;
      }

      if (limit === 0) {
        removePaginationItems();
      }
      else {
        displayPagination();
      }
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

  removePaginationItems();

  for (let i = 0; i < numPages; i++) {
    const li = document.createElement("li");
    li.setAttribute("class", "page-item");
    li.setAttribute("id", `page-num-${i+1}`);
    li.setAttribute("data-type", "pagination");
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



// Remove paginations when the page re-load
function removePaginationItems () {
  const items = document.querySelectorAll("li");
  items.forEach(
    li => {
      // console.log(li.dataset.type);
      if (li.dataset.type === "pagination")
        li.remove();
    }
  )
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
######################### Search All Medicines #########################
***********************************************************************/

/**
# Search All Mes Input onChange Event
**/
async function searchAllMedsOnKey (e) {
  try {
    // console.log("onKey", e.key);
    if (e.key === "Enter")
      await searchAllMedicines();
  }
  catch (error) {
    alert(`Error Searching Medicines. code: null.`);
  }
}


/**
# Search All medicines
**/
async function searchAllMedicines() {
  try {
    const searchAllMeds = document.getElementById("search-all-meds").value;
    const searchArea = document.getElementById("search-area").value;

    if (!searchAllMeds || searchAllMeds === "")
      return;

    showLoadingSearchAllMeds();
    removeAllContoents();

    const response = await searchAllMedsRequest(searchAllMeds, searchArea);

    // removeErrorEmptyMessagesSearchAllMeds();

    if (response.ok) {
      const results = await response.json();
      console.log(results);
      if (results.length === 0) {
        showEmptyMessageSearchAllMeds(searchAllMeds);
      }
      else {
        results.forEach( r => displaySearchResultsAllMeds(r));
      }
    }
    else {
      const { message } = await response.json();

      const errMessage = message ? `Error Searching Medicines. ${message}`
                              : `Error Searching Medicines. code : 500`;

      alert(errMessage);
      showErrorMessageSearchAllMeds(errMessage);
     }
  }
  catch (error) {
    alert(`Error Searching Medicines. code: null.`);
    showErrorMessageSearchAllMeds(error);
  }
}


/**
# Display Search Results
**/
function displaySearchResultsAllMeds (med) {

  // clear the current contents

  const parent = document.getElementById("search-all-meds-result");

  // medicine name
  medInfoRow(parent, "Medicine Description", med.name);
  medInfoRow(parent, "Product Number", med.productNumber); // product number

  // first row
  const firstRow = document.createElement("div");
  firstRow.setAttribute("class", "row p-2");
  parent.appendChild(firstRow);
  medInfoRow(firstRow, "Medicine Category", med.tag);
  medInfoRow(firstRow, "Medicine Price", med.price);
  medInfoRow(firstRow, "Medicine Quantity", med.qty);

  // second row
  const secondRow = document.createElement("div");
  secondRow.setAttribute("class", "row p-2");
  parent.appendChild(secondRow);
  medInfoRow(secondRow, "Medicine Expiry", (new Date(med.expiry)).toLocaleDateString());
  medInfoRow(secondRow, "Medicine Updated", (new Date(med.updated)).toLocaleDateString());
  medInfoRow(secondRow, "Medicine Created", (new Date(med.updated)).toLocaleDateString());

  // ingredients
  medInfoRow(parent, "Medicine Ingredients", med.description);

  (document.getElementById("search-all-meds-result")).appendChild(document.createElement("hr"));
}


function medInfoRow(parent, title, value) {
  const div = document.createElement("div");
  div.setAttribute("class", "col px-2");
  const igTitle = document.createElement("p");
  const igValue = document.createElement("label");
  igTitle.setAttribute("class", "text-muted form-label");
  igValue.setAttribute("class", "text-dark form-label");
  igTitle.innerHTML = `<small>${title}</small>`;
  igValue.innerHTML = value;

  div.appendChild(igTitle);
  div.appendChild(igValue);

  parent.appendChild(div);
}


/**
# Show Loading
**/
function showLoadingSearchAllMeds () {
  const div = document.createElement("div");
  div.setAttribute("class", "m-auto p-2 w-25 text-center");

  const loadingDiv = document.createElement("div");
  loadingDiv.setAttribute("class", "spinner-border text-primary text-center");
  loadingDiv.setAttribute("role", "status");
  loadingDiv.innerHTML = '<span class="sr-only">Loading...</span>';

  div.appendChild(loadingDiv);
}


/**
# display empty message when the results is none
**/
function showEmptyMessageSearchAllMeds (q) {
  const div = document.createElement("div");
  div.setAttribute("class", "alert alert-info");
  div.setAttribute("role", "alert");
  div.setAttribute("id", "empty-msg-search-all-meds");
  div.innerHTML = `No result(s) found related to ${q}`;

  (document.getElementById("search-all-meds-result")).appendChild(div);
}


/**
# display error message for any error encountered
**/
function showErrorMessageSearchAllMeds (errMessage) {
  const div = document.createElement("div");
  div.setAttribute("class", "alert alert-info");
  div.setAttribute("role", "alert");
  div.setAttribute("id", "err-msg-search-all-meds");
  div.innerHTML = errMessage;
  (document.getElementById("search-all-meds-result")).appendChild(div);
}


/**
# Remove all error and empty messages
**/
function removeErrorEmptyMessagesSearchAllMeds () {
  const emptyMessageBox = document.getElementById("empty-msg-search-all-meds");
  if (emptyMessageBox)
    emptyMessageBox.remove();

  const errorMessageBox = document.getElementById("err-msg-search-all-meds");
  if (errorMessageBox)
    errorMessageBox.remove();
}

/**
# Remove all contents from search result container
**/
function removeAllContoents () {
  const container = document.getElementById("search-all-meds-result");

  while (container.lastChild)
    container.removeChild(container.lastChild);
}

/***********************************************************************
################## CREATE NEW TAGS AND MEDICINES TAB ###################
***********************************************************************/
async function addMedTagsToMedicineForm () {
  try {
    const tagSelect = document.getElementById("inputTag");

    // remove the existing items first
    while (tagSelect.lastChild)
      tagSelect.removeChild(tagSelect.lastChild);

    const response = await fetchTagsNoFilter();

    if (response && response.ok) {
      const optionTags = await response.json();

      // add optons
      optionTags.forEach(
        tag => {
          const option = document.createElement("option");
          option.setAttribute("vlaue", tag.name);
          option.setAttribute("id", "tags-med-create-form");
          option.innerHTML = tag.name;
          tagSelect.appendChild(option);
        }
      );
    }
    else {
      const { message } = await response.json();
      const errMessage = message ? `Error fetching tags for create med form. ${message}`
                                : "Error fetching tags for create medicine form. code 500";
      alert(errMessage);
    }
  }
  catch (error) {
    console.log(error);
    alert("Error fetching tags for create medicine form. code null");
  }
}


function removeMedTagsFromMedicineFrom () {

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

    if (response && response.ok) {
      const tag = await response.json();
      alert(`New Category Created : ${tag.name}`);
      await reloadData({});
      createPaginationButtons();
    }
    else {
      // show error
      const { message } = await response.json();
      if (message)
        alert(`Error: ${message}`);
      else
        alert(`Error Creating New Category. code: 500`);
    }

    document.getElementById("inputCreateType").value = '';
    document.getElementById("inputAlertQuantity").value = '';
    document.getElementById("inputAlertExpiryDate").value = '';
    document.getElementById("inputLocation").value = '';
  }
  catch (error) {
    console.error(`Error Creating New Category`, error);
    alert(`Error Creating New Category. code null`);
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

    if (response && response.ok) {
      const med = await response.json();

      alert(`Medicine Added Successfully.\nMed Name: ${med.name}`);
    }
    else {
      const { message } = await response.json();
      if (message)
        alert(`Error: ${message}`);
      else
        alert(`Error Adding Medicine. code: 500`);
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

/**
# Fetch Tags with no filters
**/
async function fetchTagsNoFilter () {
  try {
    let url = `${serverURL}/api/tags?limit=0&order=${order}&sort=${sort}`;

    const response = await fetch(url, {
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


/**
# Fetch Tags with Pagination Properties
**/
async function fetchTags () {
  try {
    let url = `${serverURL}/api/tags?page=${page}&limit=${limit}&order=${order}&sort=${sort}`;

    if (limit === 0)
      url = `${serverURL}/api/tags?limit=0&order=${order}&sort=${sort}`;

    const response = await fetch(url, {
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
    const response = await fetch(`${serverURL}/api/tags/count`, {
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
    const response = await fetch(`${serverURL}/api/tags`, {
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

    const response = await fetch(`${serverURL}/api/meds`, {
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
    const response = await fetch(`${serverURL}/api/tags/search?q=${q}`, {
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


/**
# Searching All Medicines by Keyword
**/
async function searchAllMedsRequest (q, area) {
  try {
    const response = await fetch(`${serverURL}/api/meds/search?q=${q}&area=${area}`, {
      method: "GET",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      }
    });

    return response;
  }
  catch (error) {

  }
}
