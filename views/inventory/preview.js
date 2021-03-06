const loading = document.getElementById("loading");
let exportData;

loading.style.display = "none";

/**
# Clean Up Event Emitters/Listeners when the window is unloaded
**/
window.onUnload = () => window.previewAPI.removeListeners();

window.previewAPI.receive("preview-data", data => {

  const table = document.getElementById("preview-table");
  removeRows();
  exportData = data;
  console.log(data);
  reformatData();

  exportData.forEach(
    (item, idx) => {
      const row = table.insertRow(idx + 1);
      row.setAttribute("id", "table-row-preview");
      const firstColumn = row.insertCell(0); // product number
      const secondColumn = row.insertCell(1); // name
      const thirdColumn = row.insertCell(2); // expiry
      const forthColumn = row.insertCell(3); // qty
      const fifthColumn = row.insertCell(4); // unitprice
      const sixthColumn = row.insertCell(5); // approve
      const seventhColumn = row.insertCell(6); // ingredients

      firstColumn.innerHTML = item.productNumber ? item.productNumber : "00000";
      secondColumn.innerHTML = item.name;
      thirdColumn.innerHTML = item.expiry;
      forthColumn.innerHTML = item.qty;
      fifthColumn.innerHTML = item.price;
      sixthColumn.innerHTML = item.approve ? "Yes" : "No";
      seventhColumn.innerHTML = item.description ? item.description : "";

      row.addEventListener("mouseover", (e) => {
        row.style.background = "gainsboro";
      });

      row.addEventListener("mouseleave", (e) => {
        row.style.background = "white";
      });
    }
  )
});

const exportButton = document.getElementById("export-preview");

exportButton.addEventListener("click", e => {
  console.log("export-preview");
  exportButton.setAttribute("disabled", true);
  loading.style.display = "flex";

  window.previewAPI.send("export-data-after-preview", exportData);
});


function reformatData () {
  exportData.forEach( data => {
    data.expiry = (new Date(data.expiry)).toLocaleDateString();
    data.created = (new Date(data.created)).toLocaleDateString();
    data.updated = (new Date(data.updated)).toLocaleDateString();
  });
}


function removeRows () {
  const rows = document.querySelectorAll("table-row-preview");
  rows.forEach(
    r => r.remove()
  );
}
