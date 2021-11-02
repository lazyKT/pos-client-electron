window.onload = function () {
    let status = "ready";
    let _data = null;
     
    window.detailInventoryAPI.receive('response-item-detail-data', data => {
        
        if (status === 'ready') {
            status = 'reloading';
            data.forEach( item => populateDetailItemTable(item));
            //reloadData(data);
        }
    });          
      
    
    const populateDetailItemTable = ({productId, description, expireDate, quantity, doctorApproval, ingredients}, idx=1) => {
    
        const itemTable = document.getElementById("item-details-table");
        const detailItemsDisplay = document.getElementById("all-detail-item-contents");
      
        const row = itemTable.insertRow(idx);
        const firstColumn = row.insertCell(0);
        const secondColumn = row.insertCell(1);
        const thirdColumn = row.insertCell(2);
        const fourthColumn = row.insertCell(3);
        const fifthColumn = row.insertCell(4);
        const sixthColumn = row.insertCell(5);


        
        firstColumn.innerHTML = productId;
        secondColumn.innerHTML = description;
        thirdColumn.innerHTML = expireDate;
        fourthColumn.innerHTML = quantity;
        fifthColumn.innerHTML = doctorApproval;
        sixthColumn.innerHTML = ingredients;

        row.addEventListener("click", async e => {
            console.log("row clk", description);
            detailItemsDisplay.style.display = 'none';
            if(detailItemsDisplay.style.display === "none"){
            const detailSubItemDisplay = document.getElementById("subItem-edit-box");
            detailSubItemDisplay.style.display = 'block';
            }
            const closeEdit = document.getElementById("sub-item-dismiss-window");
            closeEdit;
            //console.log("checkId", productId);
            const response = await window.detailInventoryAPI.invoke('item-details-edit', {productId, method: 'GET'});
            
        });


      };
    const cancelButton = document.getElementById("dismiss-window");

    // if(cancelButton){
    cancelButton.addEventListener('click', () => {
        window.detailInventoryAPI.send('dismiss-form-window', '');
      })
    
}

