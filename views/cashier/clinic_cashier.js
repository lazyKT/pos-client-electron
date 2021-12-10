/**
 * Script for clinic_cashier.html
 **/

// prescription object
let prescription = {
	employee: null,
	employeeID: null,
	patient: null,
	doctor: null,
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

const doctorNameInput = document.getElementById('doctor-name');
const patientNameInput = document.getElementById('patient-name');
const addToCartButton = document.getElementById('add-item-to-cart');
const productCodeInput = document.getElementById('prod-code-input');
const searchMedsInput = document.getElementById('item-search-input');
const searchMedsButton = document.getElementById('search-item');
const addFeesButton = document.getElementById('add-fees-to-cart');
const cartDOM = document.getElementById('cart');
const clearCartButton = document.getElementById('discard-btn');
const logOutButton = document.getElementById('logout');
const checkoutButton = document.getElementById('checkout-btn');
const givenAmountInput = document.getElementById('given-amount');



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
///////// Prescriptions Functions For Medicines //////////////
//////////////////////////////////////////////////////////////


// add item to Prescription cart
// if the item alredy exists in the cart, increment the quantity (update the cart)
// if the item is not in the cart, create new cart-item
function addToCart (item) {

	if (isCartItemAlreadyAdded(item)) {
		updatePrescriptionItem (item, 'add');
	}
	else {
		createNewPrescriptionItem (item);
	}
}


// check if the cart item is already exists
function isCartItemAlreadyAdded (item) {

	const items = prescription.items.filter (
		i => i.productNumber === item.productNumber
	);

	return items.length > 0;
}



// create new prescription cart item
function createNewPrescriptionItem (item) {

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

    updatePrescriptionObj (item, 'add');

    // update total price on UI
    updateUITotalPrice();
}


// create quantity div with increase/decrease button for prescription cart item
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


// update prescription cart UI total price
function updateUITotalPrice () {
	const totalPriceDOM = document.getElementById('total-price');
	totalPriceDOM.innerHTML = `${prescription.total} ks`;
}


// update items in the prescription cart
function updatePrescriptionItem (item, mode) {
	const cartItem = document.getElementById(`cart-item-${item.productNumber}`);

	if (!cartItem)	throw new Error('Error Adding New Item to Cart!');

	if (mode === 'add') {
		increaseQuantity (item);
	}
	else if (mode === 'reduce') {
		decreaseQuantity (item);
	}
}


// increase quantity of prescription item
function increaseQuantity (item) {
	const qtyDOM = document.querySelectorAll(`[data-qty-item-id="${item.productNumber}"`)[0];
	const priceDOM = document.getElementById(`item-price-${item.productNumber}`);

	// update quantity
	qtyDOM.innerHTML = parseInt(qtyDOM.innerHTML) + 1;
	// update price
	priceDOM.innerHTML = `${parseInt(priceDOM.innerHTML) + item.price} ks`;

	updatePrescriptionObj (item, 'add');
	updateUITotalPrice ();
}


// decrease quantity of prescription cart item
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

	updatePrescriptionObj (item, 'reduce');
	updateUITotalPrice ();
}


// remove cart item from prescription cart
function removeCartItem (itemID) {
	const cartItem = document.getElementById(`cart-item-${itemID}`);
	cartItem.remove();
}



// update prescription cart object (prescription)
function updatePrescriptionObj (cartItem, mode) {

	// search for existing item
	const item = prescription.items.find( i => i.productNumber === cartItem.productNumber);

	if (item) {
		// cart item already exists
		if (mode === 'add') {
			console.log('update: increase qty', item, item.name);
			// increase qty and price
			prescription.items = prescription.items.map (
				i => i.productNumber === cartItem.productNumber
				? {
					...i,
					qty: (i.qty + 1),
					totalPrice: (i.totalPrice + parseInt(cartItem.price))
				} : i
			);

			prescription.total += parseInt(cartItem.price);
		}
		else if (mode === 'reduce') {
			const remaingQty = item.qty;
			console.log('remaingQty', remaingQty);
			if (remaingQty > 1) {
				// reduce qty and price
				prescription.items = prescription.items.map(
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
				prescription.items = prescription.items.filter(
					i => i.productNumber !== item.productNumber
				);
				console.log(cartItem.name, ' has been removed');
			}

			// update total price
			prescription.total -= parseInt(cartItem.price);
		}
	}
	else {
		console.log('adding new item to cart');
		// cart item not existed yet
		prescription.items.push({
			productNumber: cartItem.productNumber,
			productName: cartItem.name,
			tagId: cartItem.tag[0],
			productId: cartItem._id,
			qty: 1,
			price: parseInt(cartItem.price),
			totalPrice: parseInt(cartItem.price) // update cart item total price
	    });

	    // update total price
		prescription.total += parseInt(cartItem.price);
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


addToCartButton.addEventListener('click', async e => {
	try {
		const productCode = (document.getElementById('prod-code-input'))?.value;

		if (productCode && productCode !== '') {
			await enterOrScanProductCode (productCode);

			productCodeInput.value = '';
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
// Prescription Cart Functions For Other Fees and Services ///
//////////////////////////////////////////////////////////////

function addOtherFeesAndServiceToCart (otherFees) {
	const feesItem = document.createElement('div');
	feesItem.setAttribute('class', 'p-2 my-1 bg-light row');

	otherFees.id = cartDOM.childElementCount;

	feesItem.setAttribute('id', `service-item-${otherFees.id}`);

	// quantity
	createServiceQuantityDiv (feesItem, otherFees);

	// description
	feesItem.appendChild (createDataColumn(otherFees.description));

	// price
	feesItem.appendChild (createDataColumn(otherFees.price, otherFees.id, 'price'));

	cartDOM.appendChild (feesItem);

	addNewServiceItemToPrescription (otherFees, 'add');
	updateUITotalPrice ();
}


// service quantity
function createServiceQuantityDiv (parent, service) {
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
	qtyText.setAttribute("id", `service-qty-${service.id}`);
	qtyText.innerHTML = '1';
	div.appendChild(qtyText);

	const incrementButton = document.createElement("button");
	incrementButton.setAttribute("class", "btn btn-secondary text-white");
	incrementButton.innerHTML = `<i class="fas fa-plus"></i>`;
	div.appendChild(incrementButton);


	incrementButton.addEventListener("click", e => increaseServiceQuantity(service));

	decrementButton.addEventListener("click", e => decreaseServiceQuantity(service));

	qtyDiv.appendChild(div);
}



// create data column for fees item
function createDataColumn (value, id, type) {
	const div = document.createElement('div');
	div.setAttribute('class', 'col');
	const h6 = document.createElement('h6');
	if (type === 'price') {
		h6.setAttribute('class', 'text-muted text-end mx-1 my-2');
		h6.setAttribute('id', `service-price-${id}`);
		h6.innerHTML = `${value} ks`;
	}
	else {
		h6.setAttribute('class', 'text-muted mx-1 my-2');
		h6.innerHTML = value;
	}
	div.appendChild(h6);
	return div;
}



// increase quantity for service item
function increaseServiceQuantity (service) {
	// update qty
	const qty = document.getElementById(`service-qty-${service.id}`);
	if (!qty)
		throw new Error ('Error Updating Service Item: Quantity!');

	qty.innerHTML = parseInt(qty.innerHTML) + 1;

	// also update price
	const price = document.getElementById(`service-price-${service.id}`);
	if (!price)
			throw new Error ('Error Updateing Service Item: Price!');

	price.innerHTML = `${parseInt(price.innerHTML) + service.price} ks`;

	increaseServiceQuntityInPrescriptionObj (service);
	updateUITotalPrice ();
}


function increaseServiceQuntityInPrescriptionObj (service) {

	const s = prescription.services.find (s => s.id === service.id);
	if (!s) throw new Error ('Error Updating Service Item in Prescription: increment!');
	console.log(service);
	prescription.services = prescription.services.map (
		s => s.id === service.id
		? {
			...s,
			qty: parseInt(s.qty) + 1,
			totalPrice: parseInt(s.totalPrice) + service.price
		} : s
	);

	prescription.total += parseInt(service.price);
	console.log(prescription);
}



function decreaseServiceQuantity (service) {
	// update qty
	const qty = document.getElementById(`service-qty-${service.id}`);
	if (!qty)
		throw new Error ('Error Updating Service Item: Quantity!');

	if (qty.innerHTML === '1') {
		removeServiceItem (service);
	}
	else {
		qty.innerHTML = parseInt(qty.innerHTML) - 1;



		// also update price
		const price = document.getElementById(`service-price-${service.id}`);
		if (!price)
				throw new Error ('Error Updateing Service Item: Price!');

		price.innerHTML = `${parseInt(price.innerHTML) - service.price} ks`;

		decreaseServiceQuntityInPrescriptionObj (service);
	}

	updateUITotalPrice ();
}



function decreaseServiceQuntityInPrescriptionObj (service) {
	const s = prescription.services.find (s => s.id === service.id);
	if (!s) throw new Error ('Error Updating Service Item in Prescription: increment!');

	prescription.services = prescription.services.map (
		s => s.id === service.id
		? {
			...s,
			qty: parseInt(s.qty) - 1,
			totalPrice: parseInt(s.totalPrice) - service.price
		} : s
	);

	prescription.total -= parseInt(service.price);
}


// remove service item from prescription
function removeServiceItem (service) {

	const serviceCartItem = document.getElementById(`service-item-${service.id}`);
	if (serviceCartItem)	serviceCartItem.remove();
	else 	throw new Error('Error Removing Service Cart Item');

	prescription.services = prescription.services.filter(
			s => s.id !== service.id
		);

	prescription.total -= parseInt(service.price);
}


// update prescription cart object
function addNewServiceItemToPrescription (service) {

	prescription.services.push({
			id: service.id,
			description: service.description,
			qty: parseInt (service.qty),
			price: parseInt (service.price),
			totalPrice: parseInt(service.price)
		});

	prescription.total += parseInt(service.price);
}



//////////////////////////////////////////////////////////////
/////////// Add Other Fees and Service to Cart ///////////////
//////////////////////////////////////////////////////////////

addFeesButton.addEventListener('click', e => {
	try {
		e.preventDefault();
		const feesDescription = document.getElementById('fees-desc');
		const feesPrice = document.getElementById('fees-price');

		if (feesDescription.value === '') {
			feesDescription.focus();
			return;
		}
		else if (feesPrice.value === '0' || feesPrice.value === '' || parseInt(feesPrice.value) < 0) {
			feesPrice.focus();
			return;
		}

		addOtherFeesAndServiceToCart ({
			description: feesDescription.value,
			price: parseInt(feesPrice.value),
			qty: 1
		});

		feesDescription.value = '';
		feesPrice.value = '';
	}
	catch (error) {
		console.error(error);
		showErrorModal(error);
	}
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
/////////////////// Checkout Functions ///////////////////////
//////////////////////////////////////////////////////////////

checkoutButton.addEventListener('click', async e => {
	try {
		// show loading spinner
		onPageLoad (mainContents, loadingSpinner);

		const { error, message } = validateCheckOut();

		if (error)	throw new Error(message);

		console.log(prescription);

		let invoice = createInvoice();
		window.clinicCashierAPI.send('print-clinic-receipt', invoice);

		// // validate products in prescription item list
		// Promise.all( prescription.items.map( async (item) => {
		// 	const validateResponse = await validateCartItemsRequest (item);
		//
		// 	if (!validateResponse || !(validateResponse.ok) ) {
		// 		const errorMessage = await getErrorMessageFromResponse(validateResponse);
		//
		// 		throw new Error (errorMessage);
		// 	}
		// }))
		// 	.then ( async () => {
		// 		let invoice = createInvoice();
		//
		// 		const response = await checkOutRequests (invoice);
		//
		// 		if (response && response.ok) {
		// 			const invoice = await response.json();
		//
		// 			console.log(invoice);
		// 		}
		// 		else {
		// 			const errorMessage = await getErrorMessageFromResponse(response);
    //       throw new Error(errorMessage);
		// 		}
		// 	})
		// 	.catch (error => {
		// 		console.error(error);
		// 		onPageDidLoaded (mainContents, loadingSpinner);
		// 		showErrorModal (error.message);
		// 	});
	}
	catch (error) {
		console.error(error);
		onPageDidLoaded (mainContents, loadingSpinner);
		showErrorModal(error);
	}
});


/** enter given amount from customer **/
givenAmountInput.addEventListener('keyup', e => {
	if (e.key === 'Enter') {
		if (e.target.value !== '') {
			prescription.payment = parseInt(e.target.value);
			const changeReturnDOM = document.getElementById('change-return');
			setChangeAmount (changeReturnDOM, prescription.payment - prescription.total);
		}
	}
});


/** set change amount **/
function setChangeAmount (dom, amount) {
	dom.innerHTML = parseInt(amount);
	if (parseInt(amount) < 0)
		dom.style.color = 'red';
	else
		dom.style.color = 'green';

	prescription.change = parseInt(amount);
}



/**
# Validate Shopping Cart Before Checkout
@return -> object: {error: boolean, message: string}
**/
function validateCheckOut () {

	const { change, doctor, patient, employee, employeeID, payment, total } = prescription;

	if (!doctor || doctor === '')
		return { error: true, message: "Invalid Doctor Name. Name Empty or Invalid Name!"};

	if (!patient || patient === '')
		return { error: true, message: "Invalid Patient Name. Name Empty or Invalid Name!"}

	if (!total || parseInt(total) <= 0)
		return { error: true, message: "Invalid Total Price. Please Check the Cart."};

	if (!payment || parseInt(payment) <= 0)
		return { error: true, message: "Invalid Price. Please Check the give amount."};

	if (parseInt(change) < 0)
		return { error: true, message: "Incorrect Payment. Please check the given amount and change."};

	if (employee === null || employee === '')
		return { error: true, message: "Invalid Employee Name. Empty Name or Not Valid!"};

	if (employeeID === null || employeeID === '')
		return { error: true, message: "Invalid Employee ID. Empty ID or Not Valid!"};

	if (prescription.services.length === 0 || prescription.items.length === 0)
		return { error: true, message: "Empty Cart!"};

	return { error: false };
}


//////////////////////////////////////////////////////////////
//////////////////////// Invoicing ///////////////////////////
//////////////////////////////////////////////////////////////


/** create invoice object to make network request */
function createInvoice () {

  const invoiceNumber = generateInvoiceNumber(new Date());

  return {
    invoiceNumber,
    employeeID: prescription.employeeID,
    cashier: prescription.employee,
    patientID: "Guest",
		patientName: prescription.patient,
		doctorID: "DOC",
		doctorName: prescription.doctor,
    payableAmount: prescription.total,
    givenAmount: prescription.payment,
    changeAmount: prescription.change,
    items: prescription.items,
		services: prescription.services
  };
}


/** Generate Invoice Number Base On Current Timestamps **/
function generateInvoiceNumber (date) {
  const year = date.getFullYear();
  const month = zeroPadding(date.getMonth() + 1);
  const day = zeroPadding(date.getDate());
  const hr = zeroPadding(date.getHours());
  const mm = zeroPadding(date.getMinutes());
  const ss = zeroPadding(date.getSeconds());
  const ms = zeroPadding(date.getMilliseconds());
  return `${year}${month}${day}${hr}${mm}${ss}${ms}`;
}


/** add zero prefixs to the time values **/
function zeroPadding (value, type) {
  let strValue = value.toString();
  if (type === "ms") {
    while (strValue.length < 3)
      strValue = '0' + strValue;
  }
  else {
    while (strValue.length < 2)
      strValue = '0' + strValue;
  }
  return strValue;
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


// ser doctor name
doctorNameInput.addEventListener('keyup', e => {
	if (e.key === 'Enter') {
		if (e.target.value !== '')
			prescription.doctor = e.target.value;
	}
});


// set patient name
patientNameInput.addEventListener('keyup', e => {
	if (e.key === 'Enter') {
		if (e.target.value !== '')
			prescription.patient = e.target.value;
	}
});


// load user data and server url from local storage
function loadDataFromLocalStorage () {
	serverUrl = localStorage.getItem('serverUrl');
	if (!serverUrl || serverUrl === '' || serverUrl === null)
		throw new Error ('Failed to get Server URL');


	const emp = JSON.parse(localStorage.getItem('user'));
	if (!emp || emp === null || !emp.name || !emp._id)
		throw new Error ('Failed to get User Data');

	prescription.employeeID = emp._id;
	prescription.employee = emp.name;
}


// display login user and time at header
function displayLoginInformation () {
	const loginName = document.getElementById('employee-name');
	const loginTime = document.getElementById('login-time');

	loginName.innerHTML = prescription.employee;

	const now = new Date();
	loginTime.innerHTML = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
}


// hide all error messages DOM
function hideAllErrorMessageDOM () {
	const prodCodeScanError = document.getElementById('product-scan-error');
	prodCodeScanError.style.display = 'none';
}



logOutButton.addEventListener('click', e => logoutToMainMenu());


// logout from clinic cashier
function logoutToMainMenu () {
	removeUserDetailsFromWindow();
	window.clinicCashierAPI.send('clinic-cashier-close');
}


// Remove User Details from BrowserWindow Local Storage
function removeUserDetailsFromWindow () {
	localStorage.removeItem("user");
}


// clear prescription cart
clearCartButton.addEventListener('click', e => clearPrescriptionCart());


// clear prescription cart and prices
function clearPrescriptionCart () {
	while (cartDOM.lastChild) {
		cartDOM.removeChild(cartDOM.lastChild);
	}

	givenAmountInput.value = '';
	(document.getElementById('change-return')).innerHTML = '';
	doctorNameInput.value = '';
	patientNameInput.value = '';
	resetPrescriptionObject ();
	updateUITotalPrice ();
}


// reset prescription object with default values
function resetPrescriptionObject () {
	prescription = {
		employee: null,
		employeeID: null,
		patient: null,
		doctor: null,
		total: 0,
		payment: 0,
		change: 0,
		items: [],
		services: []
	}
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


// validate checkout items request
async function validateCartItemsRequest (item) {
  try {
    const response = await fetch(`${serverUrl}/api/meds/checkout`, {
      method: "PUT",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      },
      body: JSON.stringify({
        tagId: item.tagId,
        medId: item.productId,
        qty: item.qty
      })
    });

    return response;
  }
  catch (error) {
    console.error("Error validating items", error);
  }
}
