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
	items: []
}
let serverUrl

// DOM Nodes
const loadingSpinner = document.getElementById('modal');
const mainContents = document.getElementById('main');

const addToCartButton = document.getElementById('add-item-to-cart');
const productCodeInput = document.getElementById('prod-code-input');
const searchMedsInput = document.getElementById('item-search-input');
const searchMedsButton = document.getElementById('search-item');



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
		}
		else {
			const errorMessage = await getErrorMessageFromResponse(response);
			console.log (errorMessage);
			showErrorWithProdCode (errorMessage);
		}
	}
	catch (error) {
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
/////////////////////// Search Products //////////////////////
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
			console.log(results);
		}
		else {
			const errorMessage = await getErrorMessageFromResponse(response);
			console.log(errorMessage);
		}
	}
	catch (error) {
		console.error(error);
		showErrorModal(error);
	}
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






