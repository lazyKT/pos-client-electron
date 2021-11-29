/**
# Script for export inventory data
**/

let serverURL

// dom nodes
const previewBtn = document.getElementById("preview");
const closeBtn = document.getElementById("close");
const loading = document.getElementById("loading");


/**
# Clean Up Event Emitters/Listeners when the window is unloaded
**/
window.onUnload = () => window.exportAPI.removeListeners();


window.onload = async addr => {
  try {
    getServerUrl();
    
    const response = await fetchTags();

    if (response.ok) {
      const tags = await response.json();

      fillTags(tags);
    }
    else {
      const { message } = await response.json();
      const errMessage = message ? `Error Fetching Categories: ${messge}`
                            : "Error fetching categories data. code 500";

      alert(errMessage);
    }
    loading.style.display = "none";
  }
  catch (error) {
    alert("Error fetching categories data. code null");
  }
};


function getServerUrl () {
  serverURL = localStorage.getItem("serverUrl");
  if (!serverURL || serverURL === null)
    throw new Error ("Application Error: Failed to get Server URL.");
}


closeBtn.addEventListener("click", e => {
  window.exportAPI.send("close-export");
});


previewBtn.addEventListener("click", async e => {
  try {
    loading.style.display = "block";
    previewBtn.setAttribute("disabled", true);
    const name = document.getElementById("keyword").value;
    const d1 = document.getElementById("date1").value;
    const d2 = document.getElementById("date2").value;
    const excludeDate = document.getElementById("exclude-date");
    const tag = document.getElementById("tag-select");


    if (!excludeDate.checked && (!d1 || d1 === "" || !d2 || d2 === "")) {
      alert("Please specify the start date and end date");
      loading.style.display = "none";
      previewBtn.removeAttribute("disabled");
      return;
    }

    const response = await getExportData({
      tag: tag.options[tag.selectedIndex].dataset.id,
      excludeDate: excludeDate.checked,
      name, d1, d2
    });

    if (response && response.ok) {
      const data = await response.json();
      window.exportAPI.send("open-preview", data);
    }
    else {
      const { message } = await response.json();
      const errMessage = message ? `Error exporting data: ${messge}`
                            : "Error exporting data at preview. code 500";

      alert(errMessage);
    }
    loading.style.display = "none";
    previewBtn.removeAttribute("disabled");
  }
  catch (error) {
    console.error(error);
    alert ("Error ing Data at preview. code 400");
  }
})


/**
# Add Tags to Select
**/
function fillTags (tags) {

  const tagSelect = document.getElementById("tag-select");

  tags.forEach(
    tag => {
      const option = document.createElement("option");
      option.setAttribute("value", tag.name);
      option.setAttribute("data-id", tag._id);
      option.innerHTML = tag.name;
      tagSelect.appendChild(option);
    }
  )

}


/**
# Fetch All Tags
**/
async function fetchTags() {
  try {
    const response = await fetch(`${serverURL}/api/tags?order=1&sort=name&limit=0`, {
      method: "GET",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      }
    });

    return response;
  }
  catch (error) {
    console.error(error);
  }
}


async function getExportData(q) {
  try {
    const { tag, name, d1, d2, excludeDate } = q;

    let baseUrl = `${serverURL}/api/meds/export?d1=${d1}&d2=${d2}`;

    if (excludeDate)
      baseUrl = `${serverURL}/api/meds/export?`

    if (tag && tag !== "")
      baseUrl = `${baseUrl}&tag=${tag}`;

    if (name && name !== "")
      baseUrl = `${baseUrl}&name=${name}`;

    const response = await fetch (baseUrl, {
      method: "GET",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      }
    });

    return response;
  }
  catch (error) {
    console.error(error);
  }
}
