let status = "ready";

window.detailInventoryAPI.receive('reload-data', async data => {

  if (status === 'ready') {
      status = 'reloading';
      await reloadData(data);
  }
});

const cancelButton = document.getElementById('dismiss-window');


const reloadData = async newData => {

    try {
      const itemTable = document.getElementById("item-details-table");
      const { type, data, method } = newData;
  
      // get table rows from the current data table
      const oldData = itemTable.querySelectorAll('tr');
  
      // excpet the table header, remove all the data
      oldData.forEach( (node, idx) =>  idx !== 0 && node.remove());
  
      // reload the data by fetching data based on the data type, and populate the table again
      const items = await requestAllItems();
  
      items.forEach( item => populateDetailItemTable(item));
  
      if (method === 'CREATE' || method === 'UPDATE')
        showNotification(newData);
  
      status = 'ready';
    }
    catch (error) {
      console.log(`Error Reloading ${newData.type} data`, error);
    }
  };

const requestAllItems = async () => {

    try {
      const response = await window.detailInventoryAPI.invoke('get-all-detail-items');
  
      return response;
    }
    catch (error) {
      console.log('Error fetching all items', error);
    }
  };


const populateDetailItemTable = ({id, description, expireDate, quantity, location, dateAlert, quantityAlert}, idx=1) => {

    const itemTable = document.getElementById("item-details-table");
  
    const row = itemTable.insertRow(idx);
    const firstColumn = row.insertCell(0);
    const secondColumn = row.insertCell(1);
    const thirdColumn = row.insertCell(2);
    const fourthColumn = row.insertCell(3);
    const fifthColumn = row.insertCell(4);
    const sixthColumn = row.insertCell(5);
    const seventhColumn = row.insertCell(6);
    const eigthColumn = row.insertCell(7);
    
    firstColumn.innerHTML = id;
    secondColumn.innerHTML = description;
    thirdColumn.innerHTML = expireDate;
    fourthColumn.innerHTML = quantity;
    fifthColumn.innerHTML = location;
    sixthColumn.innerHTML = dateAlert;
    seventhColumn.innerHTML = quantityAlert;
    /* edit button */
    const editBtn = document.createElement('button');
    editBtn.setAttribute('class', 'btn mx-1 btn-primary');
    editBtn.setAttribute('data-id', id);
    editBtn.innerHTML = 'EDIT';
    eigthColumn.appendChild(editBtn);
  
    editBtn.addEventListener('click', e => {
      window.detailInventoryAPI.send('item-details', {id, method: 'PUT'});
    });
  };



if(cancelButton){
cancelButton.addEventListener('click', () => {
    window.detailInventoryAPI.send('dismiss-form-window', '');
  })}