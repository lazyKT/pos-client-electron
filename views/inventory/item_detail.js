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

        row.addEventListener("click", () => {
            console.log("row clk", description);
            detailItemsDisplay.style.display = "none";

        });
        // /* edit button */
        // const editBtn = document.createElement('button');
        // editBtn.setAttribute('class', 'btn mx-1 btn-primary');
        // editBtn.setAttribute('data-id', productId);
        // editBtn.innerHTML = 'EDIT';
        // seventhColumn.appendChild(editBtn);
      
        // editBtn.addEventListener('click', e => {
        //   window.detailInventoryAPI.send('item-details', {productId, method: 'PUT'});
        // });

        // const deleteBtn = document.createElement('button');
        // deleteBtn.setAttribute('class', 'btn mx-1 btn-primary');
        // deleteBtn.setAttribute('data-id', productId);
        // deleteBtn.innerHTML = 'Delete';
        // seventhColumn.appendChild(deleteBtn);
      
        // deleteBtn.addEventListener('click', e => {
        //   window.detailInventoryAPI.send('item-details', {productId, method: 'PUT'});
        // });

        // const detailBtn = document.createElement('button');
        // detailBtn.setAttribute('class', 'btn mx-1 btn-primary');
        // detailBtn.setAttribute('data-id', productId);
        // detailBtn.innerHTML = 'Details';
        // seventhColumn.appendChild(detailBtn);
      
        // detailBtn.addEventListener('click', e => {
        //   window.detailInventoryAPI.send('item-details', {productId, method: 'PUT'});
        // });

      };
    const cancelButton = document.getElementById("dismiss-window");

    // if(cancelButton){
    cancelButton.addEventListener('click', () => {
        window.detailInventoryAPI.send('dismiss-form-window', '');
      })
    
}

