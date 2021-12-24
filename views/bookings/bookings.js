/**
# Booking Scripts
**/

let serverUrl, empName;
const loadingSpinner = document.getElementById('loading-spinner');
const loadingSpinner2 = document.getElementById('loading-spinner-create-booking');
const bookingDateInput = document.getElementById('booking-date');
const bookingInfoInputGroup = document.getElementById('booking-info-inputs');
const errorAlertCreateBooking = document.getElementById('error-alert-create-booking');


window.onload = async () => {
  try {

    setMinimumBookingDate (bookingDateInput);
    // fetch required data from local storage
    loadDataFromLocalStorage ();
    // display login name and login time
    displayLoginInformation ();

    await fetchAllBookings();
  }
  catch (error) {
    console.error(error);
    showErrorAlert(error.message);
  }
  finally {
    loadingSpinner.style.display = 'none';
    loadingSpinner2.style.display = 'none';
    bookingInfoInputGroup.style.display = 'none';
    errorAlertCreateBooking.style.display = 'none';
  }
}



/*=============================================================
====================== Create Bookings ========================
=============================================================*/

bookingDateInput.addEventListener('change', async (e) => {
  try {
    console.log('booking date', e.target.value);
    if (e.target.value && e.target.value !== '') {

      loadingSpinner2.style.display = 'block'; // show loading spinner
      hideCreateBookingErrorAlert();

      const response = await fetchAvailableSlots(e.target.value);

      if (response && response.ok) {
        const slots = await response.json();

        displayBookingTimeSlots(slots);

        bookingInfoInputGroup.style.display = 'block';
      }
      else {
        const errorMessage = await getErrorMessageFromResponse(response);
        console.error(errorMessage);
        showCreateBookingErrorAlert(errorMessage);
      }
    }
  }
  catch (error) {
    console.error(error.message);
    showCreateBookingErrorAlert(error.message);
  }
  finally {
    loadingSpinner2.style.display = 'none'; // hide loading spinner
  }
});


function displayBookingTimeSlots (slots) {
  const timeSlotSelect = document.getElementById('time-slots');

  if (!timeSlotSelect)
    throw new Error ('Time Slot Select Not Found!');

  slots.forEach( slot => {
    const option = document.createElement('option');
    option.setAttribute('value', slot._id);
    option.innerHTML = `${slot.startTime} - ${slot.endTime}`;
    timeSlotSelect.appendChild(option);
  });
}


/*=============================================================
======================= All Bookings ==========================
=============================================================*/
async function fetchAllBookings () {
  try {
    const response = await fetchAllBookingsRequest();

    if (response && response.ok) {
      const bookings = await response.json();

      displayAllBookings(bookings);
    }
    else {
      const errorMessage = await getErrorMessageFromResponse(response);
      console.error(errorMessage);
      showErrorAlert(errorMessage);
    }
  }
  catch (error) {
    console.error(error.message);
    showErrorAlert(error.message);
  }
}


/* display all bookings in table */
function displayAllBookings (bookings) {
  const table = document.getElementById('bookings-table');

  bookings.forEach( (booking, idx) => {
    const row = table.insertRow(idx+1);

    createTableCell(row, 0, booking.bookingId);
    createTableCell(row, 1, booking.patientName);
    createTableCell(row, 2, booking.patientContact);
    createTableCell(row, 3, booking.bookingDate);
    createTableCell(row, 4, booking.bookingTime);
    createTableCell(row, 5, booking.serviceName);
    createTableCell(row, 6, booking.assignedStaffName);

    row.addEventListener('mouseover', e => {
      row.style.background = 'cornflowerblue';
      row.style.color = 'white';
      row.style.cursor = 'pointer';
    });

    row.addEventListener('mouseleave', e => {
      row.style.background = 'white';
      row.style.color = 'black';
      row.style.cursor = 'default';
    });
  });
}


function createTableCell (row, pos, data) {
  const cell = row.insertCell(pos);
  cell.innerHTML = data ? data : '-- --';
}


/*=============================================================
================== Alerts and Message Boxes ===================
=============================================================*/

function clearAlerts () {
  const errorAlert = document.getElementById('error-alert');
  if (errorAlert)   errorAlert.remove();
}


function showErrorAlert (message) {
  // clear all the alerts before showing new alert
  clearAlerts();

  const container = document.getElementById('data-container');

  const errorAlert = document.createElement('div');
  errorAlert.setAttribute('id', 'error-alert');
  errorAlert.setAttribute('class', 'alert alert-danger');
  errorAlert.setAttribute('role', 'alert');
  errorAlert.innerHTML = message;

  container.appendChild(errorAlert);
}


function showCreateBookingErrorAlert (message) {
  if (!errorAlertCreateBooking)
    throw new Error('Error: Error Alert at Create Booking Not Found!');
  errorAlertCreateBooking.style.display = 'block';
  errorAlertCreateBooking.innerHTML = message;
}


function hideCreateBookingErrorAlert () {
  errorAlertCreateBooking.style.display = 'none';
}


/*=============================================================
=========================== Utils =============================
=============================================================*/

function loadDataFromLocalStorage () {
  // get server URL
  serverUrl = localStorage.getItem("serverUrl");
  if (!serverUrl || serverUrl === null)
    throw new Error ("Application Error: Failed to get Server URL.");

  const emp = JSON.parse(localStorage.getItem("user"));
  if (!emp || emp === null || !emp.name || emp.name === null)
    throw new Error ("Application Error: Failed to fetch Login User!");
  empName = emp.name;
}


function displayLoginInformation () {
  const loginName = document.getElementById("login-name");
  loginName.innerHTML = empName;

  const loginTime = document.getElementById("login-time");
  const now = new Date();
  loginTime.innerHTML = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
}


function setMinimumBookingDate (input) {
  let today = new Date();
  let yyyy = today.getFullYear();
  let mm = today.getMonth() + 1;
  let dd = today.getDate();

  if (dd < 10)
    dd = '0' + dd;

  if (mm < 10)
    mm = "0" + mm;

  today = `${yyyy}-${mm}-${dd}`;
  input.setAttribute("min", today);
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


/*=============================================================
====================== Network Requests =======================
=============================================================*/

async function fetchAllBookingsRequest () {
  try {
    const response = await fetch(`${serverUrl}/api/bookings`, {
      headers: {
        'Content-Type' : 'application/json',
        'Accept' : 'application/json'
      }
    });

    return response;
  }
  catch (error) {
    console.error(error);
  }
}


/* get avaialble time slots for the given date */
async function fetchAvailableSlots (date) {
  try {
    const response = await fetch(`${serverUrl}/api/bookings/available-slots?date=${date}`, {
      headers: {
        'Content-Type' : 'application/json',
        'Accept' : 'application/json'
      }
    });

    return response;
  }
  catch (error) {
    console.error(error);
  }
}
