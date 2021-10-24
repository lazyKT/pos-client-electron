alert(`Welcome. Check in time: ${new Date()}\nPlease check if date and time are correct.`);


function logoutToMainMenu() {
  window.cashierAPI.send('cashier-close', 'cart');
}
