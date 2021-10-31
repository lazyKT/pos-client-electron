console.log("Member Checkout Scripts");


// DOM Nodes
const searchBtn = document.getElementById("search-member");
const clearBtn = document.getElementById("clear-search-member");
const dismissBtn = document.getElementById("dismiss-window");


dismissBtn.addEventListener("click", e => {
  /** close member checkout window */
  window.memberCheckoutAPI.send("close-member-window");
});


searchBtn.addEventListener("click", async e => {
  try {

    const searchValue = document.getElementById("member-uname-input").value;

    if (!searchValue || searchValue === '')
      return;

    const response = await getSearchResults(searchValue);

    console.log(response, response.length);

    if (response.length !== 0) {
      displaySearchResults(response);
    }
    else if (response.length === 0) {
      // display message to user that there's no related results to search keyword
      displayEmptyMessage(searchValue);
    }

  }
  catch (error) {
    alert("Error fetching members", error);
  }
});


/* clear search results */
clearBtn.addEventListener("click", e => {
  clearSearchContainer();
});


/**
# Display search results in search container
**/
function displaySearchResults (results) {

  clearSearchContainer(); // Clear the container first

  results.forEach( res => {
    const { username, point } = res;

    const row = document.createElement("div");
    row.setAttribute("class", "d-flex justify-content-between m-2");

    /* username text */
    const unameText = document.createElement("h6");
    unameText.setAttribute("class", "text-muted w-25");
    unameText.innerHTML = username;

    /** member points */
    const memberPts = document.createElement("span");
    memberPts.setAttribute("class", "text-muted w-25");
    memberPts.innerHTML = `${point} pts`;

    /** select button */
    const selectBtn = document.createElement("button");
    selectBtn.setAttribute("class", "btn btn-success w-25");
    selectBtn.innerHTML = "Select";

    row.appendChild(unameText);
    row.appendChild(memberPts);
    row.appendChild(selectBtn);

    (document.getElementById("search-results-container")).appendChild(row);
    (document.getElementById("search-results-container")).appendChild(document.createElement("hr"));


    /** closure **/
    selectBtn.addEventListener("click", e => {
      window.memberCheckoutAPI.send("select-member", res);
    });

  });
}


/** display message to user that there's no related results to search keyword */
function displayEmptyMessage (keyword) {

  clearSearchContainer();

  const container = document.getElementById("search-results-container");

  const emptyDiv = document.createElement("div");
  emptyDiv.setAttribute("class", "alert alert-info");
  emptyDiv.setAttribute("role", "alert");
  emptyDiv.innerHTML = `There is no such member related to ${keyword}. <i class="fas fa-frown-open"></i>`;

  container.appendChild(emptyDiv);
}



/** clear search result container */
function clearSearchContainer () {

  const container = document.getElementById("search-results-container");

  while(container.lastChild) {
    container.removeChild(container.lastChild);
  }
}


/** request members by search keyword */
async function getSearchResults (q) {
  try {
    const response = await window.memberCheckoutAPI.invoke("search-members", q);

    console.log(response);

    return response;
  }
  catch (error) {
    console.log("Error Fetching Member Results", error);
  }
}
