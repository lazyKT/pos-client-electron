window.clinicReciptAPI.receive('clinic-invoice', (invoice) => {
  console.log(invoice);

  setReceiptHeaders((document.getElementById('invoice-no')), invoice.invoiceNumber);
  setReceiptHeaders((document.getElementById('cashier-name')), invoice.cashier);
  setReceiptHeaders((document.getElementById('doctor-name')), invoice.doctorName);
  setReceiptHeaders((document.getElementById('patient-name')), invoice.patientName);
  setReceiptHeaders((document.getElementById('transaction-date-time')), getCurrentDateTime());
});


function getCurrentDateTime () {
  const today = new Date();
  return `${today.toLocaleDateString()} ${today.toLocaleTimeString()}`;
}


function setReceiptHeaders (dom, value) {
  dom.innerHTML = `<small>${dom.innerHTML}</small> ${value}`;
}
