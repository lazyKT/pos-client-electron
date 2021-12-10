window.clinicReceiptAPI.receive('clinic-invoice', (invoice) => {
  console.log(invoice);

  setReceiptHeaders((document.getElementById('invoice-no')), invoice.invoiceNumber);
  setReceiptHeaders((document.getElementById('cashier-name')), invoice.cashier);
  setReceiptHeaders((document.getElementById('doctor-name')), invoice.doctorName);
  setReceiptHeaders((document.getElementById('patient-name')), invoice.patientName);
  setReceiptHeaders((document.getElementById('transaction-date-time')), getCurrentDateTime());

  invoice.items.forEach( item => {
    createCartItem(item);
  });


  invoice.services.forEach( item => {
    createCartItem({
      ...item,
      productName: item.description
    });
  });


  loadPrice((document.getElementById("total-amount")), "Total Amount", invoice.payableAmount);
  loadPrice((document.getElementById("given-amount")), "Given Amount", invoice.givenAmount);
  loadPrice((document.getElementById("change-due")), "Change Amount", invoice.changeAmount);

  const printerName = JSON.parse(window.localStorage.getItem("printOptions"));

  window.clinicReceiptAPI.send('print-clinic-invoice', printerName);
});


function getCurrentDateTime () {
  const today = new Date();
  return `${today.toLocaleDateString()} ${today.toLocaleTimeString()}`;
}


function setReceiptHeaders (dom, value) {
  dom.innerHTML = `<small>${dom.innerHTML}</small> ${value}`;
}


function loadPrice (dom, title, value) {
  dom.innerHTML = `<small>${title}</small> : ${value}ks`;
}


function createCartItem (item) {
  const tBody = document.getElementById("tbody");

  createDescTd(tBody, item.productName);
  createInfoTableCells(tBody, item);
}

function createDescTd (tBody, description) {
  const tr = document.createElement("tr");
  const td = document.createElement("td");
  td.setAttribute("style", "width: 100px;");
  td.setAttribute("colspan", "3");
  td.innerHTML = description;

  tr.appendChild(td);
  tBody.appendChild(tr);
}

function createInfoTableCells (tBody, item) {
  const tr = document.createElement("tr");
  tr.setAttribute("class", "mb-1");

  const unitPrice = document.createElement("td");
  unitPrice.innerHTML = item.price;
  tr.appendChild(unitPrice);

  const qty = document.createElement("td");
  qty.innerHTML = item.qty;
  tr.appendChild(qty);

  const totalPrice = document.createElement("td");
  totalPrice.innerHTML = item.totalPrice;
  tr.appendChild(totalPrice);

  tBody.appendChild(tr);
}
