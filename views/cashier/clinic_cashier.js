/**
 * Script for clinic_cashier.html
 **/

// shopping cart object
let shoppingCart = {
	employee: null,
	employeeID: null,
	total: 0,
	payment: 0,
	change: 0,
	items: [],
	services: []
}
let serverUrl

// DOM Nodes
const loadingSpinner = document.getElementById('modal');
const mainContents = document.getElementById('main');

const addToCartButton = document.getElementById('add-item-to-cart');
const productCodeInput = document.getElementById('prod-code-input');
const searchMedsInput = document.getElementById('item-search-input');
const searchMedsButton = document.getElementById('search-item');
const addFeesButton = document.getElementById('add-fees-to-cart');
const cartDOM = document.getElementById('cart');



window.onload = () => {
	try {
		onPageLoad (mainContents, loadingSpinner);

		loadDataFromLocalStorage();
		displayLoginInformation();

		onPageDidLoaded (mainContents, loadingSpinner);
	}
	catch (error) {
		console.error(error);
		showErrorModal (error);
	}
}


//////////////////////////////////////////////////////////////
///////// Shopping Cart Functions For Medicines //////////////
//////////////////////////////////////////////////////////////


// add item to shopping cart
// if the item alredy exists in the cart, increment the quantity (update the cart)
// if the item is not in the cart, create new cart-item
function addToCart (item) {

	if (isCartItemAlreadyAdded(item)) {
		updateShoppingCartItem (item, 'add');
	}
	else {
		createNewShoppingCartItem (item);	
	}
}


// check if the cart item is already exists
function isCartItemAlreadyAdded (item) {

	const items = shoppingCart.items.filter (
		i => i.productNumber === item.productNumber
	);

	return items.length > 0;			
}



// create new shopping cart item
function createNewShoppingCartItem (item) {

	// cart item container
	const cartItemDOM = document.createElement('div');
	cartItemDOM.setAttribute('class', 'p-2 my-1 bg-light row');
	cartItemDOM.setAttribute('id', `cart-item-${item.productNumber}`);

	// quantity 
	createCartItemQuantityDiv (cartItemDOM, item);

	// description
	const descriptionDiv = document.createElement('div');
	descriptionDiv.setAttribute('class', 'col');
	cartItemDOM.appendChild(descriptionDiv);

	const description = document.createElement('h6');
	description.setAttribute('class', 'text-muted mx-1 my-2');
	description.innerHTML = item.name;
	descriptionDiv.appendChild(description);

	// total price
	const priceDiv = document.createElement('div');
	priceDiv.setAttribute('class', 'col');
	cartItemDOM.appendChild(priceDiv);

	const price = document.createElement('h6');
	price.setAttribute("class", "text-muted text-end mx-1 my-2");
    price.setAttribute("id", `item-price-${item.productNumber}`);
    price.setAttribute("data-price-item-id", item.productNumber);
    price.innerHTML = `${item.price} ks`;
    priceDiv.appendChild(price);

    cartDOM.appendChild(cartItemDOM);

    updateShoppingCartObj (item, 'add');

    // update total price on UI
    updateUITotalPrice();
}


// create quantity div with increase/decrease button for shopping cart item
function createCartItemQuantityDiv (parent, item) {
	const qtyDiv = document.createElement('div');
	qtyDiv.setAttribute('class', 'col');
	parent.appendChild(qtyDiv);

	const div = document.createElement("div");
	div.setAttribute("class", "d-flex justify-content-start align-items-center");

	const decrementButton = document.createElement("button");
	decrementButton.setAttribute("class", "btn btn-secondary text-white");
	decrementButton.innerHTML = `<i class="fas fa-minus"></i>`;
	div.appendChild(decrementButton);

	const qtyText = document.createElement("h6");
	qtyText.setAttribute("class", "px-1 mt-1 mx-2 text-muted");
	qtyText.setAttribute("data-qty-item-id", item.productNumber);
	qtyText.innerHTML = '1';
	div.appendChild(qtyText);

	const incrementButton = document.createElement("button");
	incrementButton.setAttribute("class", "btn btn-secondary text-white");
	incrementButton.innerHTML = `<i class="fas fa-plus"></i>`;
	div.appendChild(incrementButton);


	incrementButton.addEventListener("click", e => increaseQuantity(item));

	decrementButton.addEventListener("click", e => decreaseQuantity(item));

	qtyDiv.appendChild(div);
}


// update shopping cart UI total price
function updateUITotalPrice () {
	const totalPriceDOM = document.getElementById('total-price');
	totalPriceDOM.innerHTML = `${shoppingCart.total} ks`;
}


// update items in the shopping cart
function updateShoppingCartItem (item, mode) {
	const cartItem = document.getElementById(`cart-item-${item.productNumber}`);

	if (!cartItem)	throw new Error('Error Adding New Item to Cart!');

	if (mode === 'add') {
		increaseQuantity (item);
	}
	else if (mode === 'reduce') {
		decreaseQuantity (item);
	}
}


// increase quantity of shopping cart item
function increaseQuantity (item) {
	const qtyDOM = document.querySelectorAll(`[data-qty-item-id="${item.productNumber}"`)[0];
	const priceDOM = document.getElementById(`item-price-${item.productNumber}`);

	// update quantity
	qtyDOM.innerHTML = parseInt(qtyDOM.innerHTML) + 1;
	// update price
	priceDOM.innerHTML = `${parseInt(priceDOM.innerHTML) + item.price} ks`;

	updateShoppingCartObj (item, 'add');
	updateUITotalPrice ();	
}


// decrease quantity of shopping cart item
function decreaseQuantity (item) {
	const qtyDOM = document.querySelectorAll(`[data-qty-item-id="${item.productNumber}"`)[0];
	const priceDOM = document.getElementById(`item-price-${item.productNumber}`);

	// if current qty is one before qty decrement, remove the item
	if (qtyDOM.innerHTML === '1') {
		removeCartItem (item.productNumber);
	}
	else {
		qtyDOM.innerHTML = parseInt(qtyDOM.innerHTML) - 1;
		priceDOM.innerHTML = `${parseInt(priceDOM.innerHTML) - item.price} ks`;
	}

	updateShoppingCartObj (item, 'reduce');
	updateUITotalPrice ();	
}


// remove cart item from shopping cart
function removeCartItem (itemID) {
	const cartItem = document.getElementById(`cart-item-${itemID}`);
	cartItem.remove();
}



// update shopping cart object (shoppingCart)
function updateShoppingCartObj (cartItem, mode) {

	// search for existing item
	const item = shoppingCart.items.find( i => i.productNumber === cartItem.productNumber);

	if (item) {
		// cart item already exists
		if (mode === 'add') {
			console.log('update: increase qty', item, item.name);
			// increase qty and price
			shoppingCart.items = shoppingCart.items.map (
				i => i.productNumber === cartItem.productNumber
				? {
					...i,
					qty: (i.qty + 1),
					totalPrice: (i.totalPrice + parseInt(cartItem.price))
				} : i
			);

			shoppingCart.total += parseInt(cartItem.price);
		}
		else if (mode === 'reduce') {
			const remaingQty = item.qty;
			console.log('remaingQty', remaingQty);
			if (remaingQty > 1) {
				// reduce qty and price
				shoppingCart.items = shoppingCart.items.map(
					i => i.productNumber === cartItem.productNumber
					? {
						...i,
						qty: i.qty - 1,
						totalPrice: (i.totalPrice - parseInt(cartItem.price))
					} : i
				);
			}
			else {
				// remove item
				shoppingCart.items = shoppingCart.items.filter(
					i => i.productNumber !== item.productNumber
				);
				console.log(cartItem.name, ' has been removed');
			}

			// update total price
			shoppingCart.total -= parseInt(cartItem.price);
		}
	}
	else {
		console.log('adding new item to cart');
		// cart item not existed yet
		shoppingCart.items.push({
			productNumber: cartItem.productNumber,
			productName: cartItem.name,
			tagId: cartItem.tag[0],
			productId: cartItem._id,
			qty: 1,
			price: parseInt(cartItem.price),
			totalPrice: parseInt(cartItem.price) // update cart item total price
	    });

	    // update total price
		shoppingCart.total += parseInt(cartItem.price);
	}
}


//////////////////////////////////////////////////////////////
/////////// Add to Cart With Product Code ////////////////////
//////////////////////////////////////////////////////////////

productCodeInput.addEventListener('keyup', async e => {
	try {
		if (e.key === 'Enter') {
			if (e.target.value !== '') {
				// get meds with entered product code
				await enterOrScanProductCode (e.target.value);
				// clear input
				e.target.value = '';
			}
		}
	}
	catch (error) {
		showErrorModal (error);
	}
});


async function enterOrScanProductCode (prodCode) {
	try {
		const response = await getMedsByProductCodeNetworkRequest (prodCode);

		if (response && response.ok) {
			const med = await response.json();
			console.log(med);
			removeErrorWithProdCode();
			addToCart(med);
		}
		else {
			const errorMessage = await getErrorMessageFromResponse(response);
			console.log (errorMessage);
			showErrorWithProdCode (errorMessage);
		}
	}
	catch (error) {
		console.error(error);
		showErrorModal(error);
	}
}



function showErrorWithProdCode (message) {
	const prodCodeScanError = document.getElementById('product-scan-error');
	prodCodeScanError.innerHTML = message;
}


function removeErrorWithProdCode () {
	const prodCodeScanError = document.getElementById('product-scan-error');
	prodCodeScanError.innerHTML = '';
}



//////////////////////////////////////////////////////////////
//// Shopping Cart Functions For Other Fees and Services /////
//////////////////////////////////////////////////////////////

function addOtherFeesAndServiceToCart (otherFees) {
	const feesItem = document.createElement('div');
	feesItem.setAttribute('class', 'p-2 my-1 bg-light row');

	otherFees.id = cartDOM.childElementCount;

	// delete Fees Item
	const deleteButton = document.createElement('button');
	deleteButton.setAttribute('class', 'btn btn-danger w-auto');
	deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
	feesItem.appendChild(deleteButton);
	deleteButton.addEventListener('click', () => {
		feesItem.remove();
		updateShoppingCartObjForFees (otherFees, 'remove');
		updateUITotalPrice ();
	});

	// quantity 
	feesItem.appendChild (createDataColumn(otherFees.qty));

	// description
	feesItem.appendChild (createDataColumn(otherFees.description));

	// price
	feesItem.appendChild (createDataColumn(otherFees.price, 'price'));

	cartDOM.appendChild (feesItem);

	updateShoppingCartObjForFees (otherFees, 'add');
	updateUITotalPrice ();
	console.log(shoppingCart);
}


// create data column for fees item
function createDataColumn (value, type) {
	const div = document.createElement('div');
	div.setAttribute('class', 'col');
	const h6 = document.createElement('h6');
	if (type === 'price') {
		h6.setAttribute('class', 'text-muted text-end mx-1 my-2');
		h6.innerHTML = `${value} ks`;
	}
	else {
		h6.setAttribute('class', 'text-muted mx-1 my-2');
		h6.innerHTML = value;
	}
	div.appendChild(h6);
	return div;
}



// update shopping cart object
function updateShoppingCartObjForFees (fees, mode) {
	if (mode === 'add') {
		shoppingCart.services.push({
			id: fees.id,
			description: fees.description,
			qty: parseInt (fees.qty),
			price: parseInt (fees.price)
		});

		shoppingCart.total += parseInt(fees.price);
	}
	else if (mode === 'remove') {
		shoppingCart.services = shoppingCart.services.filter(
			service => service.id !== fees.id
		);

		shoppingCart.total -= parseInt(fees.price);
	}
}



//////////////////////////////////////////////////////////////
/////////// Add Other Fees and Service to Cart ///////////////
//////////////////////////////////////////////////////////////

addFeesButton.addEventListener('click', e => {
	e.preventDefault();
	const feesDescription = document.getElementById('fees-desc');
	const feesPrice = document.getElementById('fees-price');
	const feesQty = document.getElementById('qty-other-fees');

	if (feesDescription.value === '') {
		feesDescription.focus();
		return;
	}
	else if (feesPrice.value === '0' || feesPrice.value === '' || parseInt(feesPrice.value) < 0) {
		feesPrice.focus();
		return;
	}
	else if (feesQty.value === '' || feesQty.value === '0' || parseInt(feesQty.value) < 0) {
		feesQty.focus();
		return;
	}

	addOtherFeesAndServiceToCart ({
		description: feesDescription.value,
		price: parseInt(feesPrice.value),
		qty: parseInt(feesQty.value)
	});

	feesDescription.value = '';
	feesPrice.value = '';
	feesQty.value = '';
});



//////////////////////////////////////////////////////////////
///////////////////// Search Products ////////////////////////
//////////////////////////////////////////////////////////////

searchMedsInput.addEventListener('keyup', async e => {
	try {
		if (e.key === 'Enter') {
			if (e.target.value !== '') {
				// send search meds network request
				searchMeds(e.target.value);
			}
		}
	}
	catch (error) {
		showErrorModal(error);
	}
});


async function searchMeds (q) {
	try {
		const response = await searchMedsNetworkRequest(q);

		if (response && response.ok) {
			const results = await response.json();
			
			displaySearchResults (results, q);
		}
		else {
			const errorMessage = await getErrorMessageFromResponse(response);
			console.log(errorMessage);
			displayErrorOnSearchMeds(errorMessage);
		}
	}
	catch (error) {
		console.error(error);
		showErrorModal(error);
	}
}


// display search results in search container
function displaySearchResults (results, q) {
	const searchContainer = document.getElementById('search-results');
	clearSearchResultsContainer (searchContainer);

	if (results.length === 0)
		displayEmptySearchResult (q);
	else {
		results.forEach (
			result => {
				const div = document.createElement("div");
		        const h6 = document.createElement("h6");
		        h6.setAttribute("class", "text-muted mb-3");
		        h6.innerHTML = result.name;
		        div.appendChild(h6);

		        createSingleRow(div, "Category", result.category);

		        createSingleRow(div, "Ingredients", result.description);

		        createRow(
		        	div, 
		        	["Location", "Product Number", "Price"], 
		        	[result.location, result.productNumber, result.price]
	        	);

		        createRow(
	        		div,
		          	["Quantity", "Doctor Approve", "Expiry"],
		          	[result.qty, result.approve, (new Date(result.expiry)).toLocaleDateString()]
	          	);

		        searchContainer.appendChild(div);
		        searchContainer.appendChild(document.createElement("hr"));
			}
		);
	}
}


// create single-column row item to display search result
function createSingleRow (parent, title, value) {
  const div = document.createElement("div");
  div.setAttribute("class", "mb-3");

  const titleDOM = document.createElement("h6");
  titleDOM.setAttribute("class", "text-muted");
  titleDOM.innerHTML = title;

  const valueDOM = document.createElement("span");
  valueDOM.setAttribute("class", "mb-3");
  valueDOM.innerHTML = value ? value : '--';

  div.appendChild(titleDOM);
  div.appendChild(valueDOM);

  parent.appendChild(div);
}


// create three-column row item to display search result 
function createRow (parent, titles, values) {
  const row = document.createElement("div");
  row.setAttribute("class", "row mb-3");

  for (let i = 0; i < 3; i++) {
    createCol(row, titles[i], values[i]);
  }

  parent.appendChild(row);
}


// create column to fill inside the parent row to display search result
function createCol (parent, title, value) {
  const col = document.createElement("div");
  col.setAttribute("class", "col");

  const titleDOM = document.createElement("h6");
  titleDOM.setAttribute("class", "text-muted");
  titleDOM.innerHTML = title;

  const valueDOM = document.createElement("span");
  valueDOM.innerHTML = value;

  col.appendChild(titleDOM);
  col.appendChild(valueDOM);

  parent.appendChild(col);
}


function displayEmptySearchResult (q) {
	const searchContainer = document.getElementById('search-results');
	clearSearchResultsContainer (searchContainer);

	const emptyAlert = document.createElement('div');
	emptyAlert.setAttribute('class', 'alert alert-info');
	emptyAlert.setAttribute('role', 'alert');
	emptyAlert.innerHTML = `No medicine(s) found with ${q}`;
	searchContainer.appendChild(emptyAlert);
}


function displayErrorOnSearchMeds (message) {
	const searchContainer = document.getElementById('search-results');
	clearSearchResultsContainer (searchContainer);

	const errAlert = document.createElement('div');
	errAlert.setAttribute('class', 'alert alert-danger');
	errAlert.setAttribute('role', 'alert');
	errAlert.innerHTML = message;
	searchContainer.appendChild(errAlert);
}


// clear contents and make room for next results
function clearSearchResultsContainer (container) {
	
	while (container.lastChild)
		container.removeChild(container.lastChild);
}



//////////////////////////////////////////////////////////////
///////////////// Error Handling Functions ///////////////////
//////////////////////////////////////////////////////////////

function showErrorModal (message) {
	loadingSpinner.style.display = 'flex';
	const loading = document.getElementById('loading');
	if (loading)
		loading.style.display = 'none';

	const errorMessageDiv = document.getElementById('error-div');
	errorMessageDiv.style.display = 'block';

	const errorMessage = document.getElementById('error-msg');
	errorMessage.innerHTML = message;	
}


function onCloseErrorModal () {
	/* hide the loading modal */
	loadingSpinner.style.display = 'none';

	/* remove error message */
	const errorMessageDiv = document.getElementById('error-div');
	console.log(errorMessageDiv);
	errorMessageDiv.style.display = 'none';

	/* show loading spinner */
	const loading = document.getElementById('loading');
	loading.style.display = 'flex';
}


/** show appropriate error base on network response status **/
async function getErrorMessageFromResponse (response) {
  let errorMessage = "";
  try {
    switch (response.status) {
      case 400:
        const { message } = await response.json();
        errorMessage = message;
        break;
      case 404:
        errorMessage = "Server EndPoint Not Found!";
        break;
      case 500:
        errorMessage = "Internal Server Error";
        break;
      default:
        errorMessage = "Network Connection Error";
    }
  }
  catch (error) {
    console.error("getErrorMessageFromResponse()", error);
    errorMessage = "Application Error. Contact Administrator.";
  }

  return errorMessage;
}



//////////////////////////////////////////////////////////////
///////////////////// Utilities Functions ////////////////////
//////////////////////////////////////////////////////////////

// run when the window fire onload event
// display loading spinner while data are loading
// once data are ready dismiss loading spinner and show page contents
function onPageLoad (contents, loading) {

	contents.style.display = 'none';
	loading.style.display = 'flex';
}


function onPageDidLoaded (contents, loading) {
	contents.style.display = 'block';
	loading.style.display = 'none';
}


// load user data and server url from local storage
function loadDataFromLocalStorage () {
	serverUrl = localStorage.getItem('serverUrl');
	if (!serverUrl || serverUrl === '' || serverUrl === null)
		throw new Error ('Failed to get Server URL');


	const emp = JSON.parse(localStorage.getItem('user'));
	if (!emp || emp === null || !emp.name || !emp._id) 
		throw new Error ('Failed to get User Data');

	shoppingCart.employeeID = emp._id;
	shoppingCart.employee = emp.name;
}


// display login user and time at header
function displayLoginInformation () {
	const loginName = document.getElementById('employee-name');
	const loginTime = document.getElementById('login-time');

	loginName.innerHTML = shoppingCart.employee;

	const now = new Date();
	loginTime.innerHTML = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
}


// hide all error messages DOM
function hideAllErrorMessageDOM () {
	const prodCodeScanError = document.getElementById('product-scan-error');
	prodCodeScanError.style.display = 'none';
}


// logout from clinic cashier
function logoutToMainMenu () {
	removeUserDetailsFromWindow();
} 


// Remove User Details from BrowserWindow Local Storage
function removeUserDetailsFromWindow () {
	localStorage.removeItem("user");
}



//////////////////////////////////////////////////////////////
///////////////////// Network Requests ///////////////////////
//////////////////////////////////////////////////////////////

async function searchMedsNetworkRequest (q) {
	try {
		const response = await fetch(`${serverUrl}/api/meds/checkout?q=${q}`, {
			method: 'GET',
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


async function getMedsByProductCodeNetworkRequest (code) {
	try {
		const response = await fetch(`${serverUrl}/api/meds/exact-search?productNumber=${code}`, {
			method: 'GET',
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






