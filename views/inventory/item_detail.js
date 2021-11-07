let medNumber, medDesc, medPrice, medQty, medExp, medApprove, medTag, medIngredients;
let editMedButton, saveButton, backButton, pagination;
let filtering = false;
let editing = false;
let editingID, medTagName;
let serverURL;

window.onload = function () {
    let status = "ready";
    const allDetails = document.getElementById("all-detail-item-contents");
    const medDetails = document.getElementById("med-details");
    const cancelButton = document.getElementById("dismiss-window");
    pagination = document.getElementById("pagination");
    backButton = document.getElementById("back");
    medNumber = document.getElementById("medNumber");
    medDesc = document.getElementById("medDesc");
    medPrice = document.getElementById("medPrice");
    medQty = document.getElementById("medQty");
    backButton = document.getElementById("back");
    medExp = document.getElementById("medExp");
    medTag = document.getElementById("medTag");
    medApprove = document.getElementById("medApprove");
    editMedButton = document.getElementById("edit-medicine");
    medIngredients = document.getElementById("medIngredients");
    saveButton = document.getElementById("save-edit");

    medDetails.style.display = "none";

    window.detailInventoryAPI.receive('reload-data', async data => {

      serverURL = data.url;
      medTagName = data.name;
      if (status === 'ready') {
          status = 'reloading';
          (document.getElementById("heading")).innerHTML = data.name;
          await reloadData(data.name);
          filtering = false;
      }
    });

    backButton.addEventListener("click", e => {
      e.preventDefault();

      hideMedicineDetails();
    });

    cancelButton.addEventListener("click", () => {
      window.detailInventoryAPI.send('dismiss-form-window', '');
    });

    editMedButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.target.innerHTML = e.target.innerHTML === "Cancel" ? "Edit" : "Cancel";
      editing = !editing;
      toggleInputs();
    });

    saveButton.addEventListener("click", async e => {
      try {
        e.preventDefault();
        const data = {
          name: medDesc.value,
          price: parseInt(medPrice.value),
          qty: parseInt(medQty.value),
          expiry: medExp.value,
          medApprove: medApprove.value === "YES" ? true : false,
          tag: medTag.value,
          productNumber: medNumber.value,
          description: medIngredients.value
        };

        const response = await editMed(editingID, data);

        if (response.ok) {
          const updatedMed = await response.json();
          alert(`Editted Success. ${medDesc.value}`);
          hideMedicineDetails();
        }
        else {
          const { message } = await response.json();
          if (message)
            alert(`Error Saving Changes: ${message}`);
          else
            alert("Error Saving Changes. code: 500");
        }
      }
      catch (error) {
        alert("Error Saving Changes. code: null");
      }
    });
}


function searchMedsKeyUp(event) {
  const cancelButton = document.getElementById('cancel-med-search');
  const inputValue = document.getElementById('search-input-med').value;

  if(inputValue !== null){
    cancelButton.style.display = 'block';
  }
  if(inputValue === '' && (event.key === 'Backspace' || event.key === 'Delete')){
    cancelButton.style.display = 'none';
  }

  if (event.key === 'Enter')
    filterMeds();
};


/** search medcines **/
async function filterMeds() {
  try {
    filtering = true;
    const q = document.getElementById("search-input-med").value;

    if (!q || q === "")
      return;

    await reloadData(q);
  }
  catch (error) {
    console.error(error);
    alert("Error Searching Medcine. code : null");
  }
}


async function resetFilter() {
  filtering = false;
  await reloadData(medTagName);
}


/** display medicines **/
function displayMedicines (med, idx) {
  try {

    const { _id, name, productNumber, description, approve, expiry, qty, price } = med;

    const itemTable = document.getElementById("item-details-table");

    const row = itemTable.insertRow(idx);
    row.setAttribute('class','med-row');

    const firstColumn = row.insertCell(0);
    const secondColumn = row.insertCell(1);
    const thirdColumn = row.insertCell(2);
    const forthColumn = row.insertCell(3);
    const fifthColumn = row.insertCell(4);
    const sixthColumn = row.insertCell(5);
    const seventhColumn = row.insertCell(6);

    secondColumn.innerHTML = name;
    if (productNumber) {
      firstColumn.innerHTML = productNumber;
    }
    else {
      firstColumn.innerHTML = "000000";
    }
    thirdColumn.innerHTML = (new Date(expiry)).toLocaleDateString();
    forthColumn.innerHTML = qty;
    fifthColumn.innerHTML = price;
    sixthColumn.innerHTML = approve ? "YES" : "NO";
    seventhColumn.innerHTML = description ? description : "";

    row.addEventListener("click", event => {

      editingID = _id;
      showMedicineDetails(_id);
    });

    row.addEventListener("mouseover", e => {
      row.style.background = "cornflowerblue";
      row.style.color = "white";
    });

    row.addEventListener("mouseleave", e => {
      row.style.background = "white";
      row.style.color = "black";
    });
  }
  catch (error) {
    alert ("Error Displaying Medicines. code : null");
  }
}


function showEmptyBox (tag) {
  try {
    const div = document.createElement("div");
    div.setAttribute("class", "alert alert-primary my-2 w-100 text-center");
    div.setAttribute("role", "alert");
    div.innerHTML = `No item(s) found with ${tag}`;

    (document.getElementById("med-contents")).appendChild(div);

    if (pagination)
      pagination.style.display = "none";
  }
  catch (error) {
    alert ("Error Showing Empty Box");
  }
}


function showErrorMessage (message) {
  try {
    const div = document.createElement("div");
    div.setAttribute("class", "alert alert-danger m-2 w-100 text-center");
    div.setAttribute("role", "alert");
    div.innerHTML = message;

    (document.getElementById("med-contents")).appendChild(div);

    if (pagination)
      pagination.style.display = "none";
  }
  catch (error) {
    alert ("Error Showing Empty Box");
  }
}

/***********************************************************************
####################### Medicine Details ###############################
***********************************************************************/
async function reloadData(q) {

  try {
    const itemTable = document.getElementById("item-details-table");
    // const { type, data, method } = newData;

    // get table rows from the current data table
    const oldData = itemTable.querySelectorAll('tr');

    // excpet the table header, remove all the data
    oldData.forEach( (node, idx) =>  idx !== 0 && node.remove());

    // reload the data by fetching data based on the data type, and populate the table again
    if (!filtering)
      response = await getMedsByTag(q);
    else
      response = await searchMedsRequest(q);

    if (response && response.ok) {
      const meds = await response.json();
      if (meds.length === 0) {
        showEmptyBox(q);
      }
      else {
        meds.forEach(
          (med, idx) => displayMedicines(med, idx + 1)
        );
      }
    }
    else {
      const { message } = await response.json();
      const errMessage = message ?
                      `Error Fetching Medicines: ${message}` :
                      "Error Fetching Medicines. code: 500";

      alert(errMessage);
      showErrorMessage(errMessage);
    }

    status = 'ready';
  }
  catch (error) {
    alert("Error Fetching Medicines. code: null");
  }
};

async function showMedicineDetails (id) {
  try {
    const allDetails = document.getElementById("all-detail-item-contents");
    const medDetails = document.getElementById("med-details");

    allDetails.style.display = "none";
    medDetails.style.display = "block";

    const response = await getMedById(id);

    if (response.ok) {
      const med = await response.json();

      displayMedInfo(med);
    }
    else {
      const { message } = await response.json();
      if (message)
        alert ("Erorr Showing Medicine Details.", message);
      else
        alert("Error Showing Medicine Details. code : 500");
    }
  }
  catch (error) {
    console.error (error);
    alert("Error Showing Medicine Details. code : null");
  }
}


function displayMedInfo (med) {
  medNumber.value = med.productNumber ? med.productNumber : "";
  medDesc.value = med.name;

  const dateFormat = new Date(med.expiry).toISOString();
  medIngredients.value = med.description ? med.description : "";
  medExp.value = dateFormat.split("T")[0];
  medQty.value = parseInt(med.qty);
  medPrice.value = parseInt(med.price);
  medTag.value = (med.tag).join(", ");
  if (med.approve) {
    (document.getElementById("approve-yes")).setAttribute("selected", true);
    (document.getElementById("approve-no")).removeAttribute("selected");
  }
  else {
    (document.getElementById("approve-no")).setAttribute("selected", true);
    (document.getElementById("approve-yes")).removeAttribute("selected");
  }
  saveButton.style.display = "none";
  editMedButton.innerHTML = "Edit";
}


async function hideMedicineDetails () {
  try {
    const allDetails = document.getElementById("all-detail-item-contents");
    const medDetails = document.getElementById("med-details");

    allDetails.style.display = "block";
    medDetails.style.display = "none";
    editing = false;
    toggleInputs();
    await reloadData(medTagName);
  }
  catch (error) {
    console.log(error);
    alert("Error Reloading Medicines. code : null");
  }
}


/** enable editable input and let user edit **/
function toggleInputs () {
  const medDetails = document.getElementById("med-details");
  const inputs = medDetails.querySelectorAll("input");
  inputs.forEach(
    input => {
      if (editing) {
        if (saveButton) saveButton.style.display = "block";
        input.removeAttribute("readonly");
      }
      else {
        if (saveButton) saveButton.style.display = "none";
        input.setAttribute("readonly", true);
      }
    }
  );
  if (editing)
    medApprove.removeAttribute("disabled");
  else
    medApprove.setAttribute("disabled", true);
}


// function toggleInputs (editing) {
//
// }

/***********************************************************************
####################### Network Requests ###############################
***********************************************************************/

/* Get Medicine By Tag Name */
async function getMedsByTag (tag) {
  try {
    const response = await fetch(`${serverURL}/api/meds/by-tag?tag=${tag}`, {
      method: "GET",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      }
    });

    return response;
  }
  catch (error) {
    console.error(`Error fetching meds by tag. ${error}`);
  }
}

/** Get Medicine by Id */
async function getMedById (id) {
  try {
    const response = await fetch(`${serverURL}/api/meds/${id}`, {
      method: "GET",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      }
    });

    return response;
  }
  catch (error) {
    console.error("Error Getting Med By Id", error);
  }
}


/** Edit Medicine **/
async function editMed (id, med) {
  try {

    const response = await fetch(`${serverURL}/api/meds/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      },
      body: JSON.stringify(med)
    });

    return response;
  }
  catch (error) {
    console.error("Error Editing Medicines", error);
  }
}


/**
# Searching All Medicines by Keyword
**/
async function searchMedsRequest (q) {
  try {

    let url = `${serverURL}/api/meds/by-tag?tag=${medTagName}&q=${q}`

    const response = await fetch(url, {
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
