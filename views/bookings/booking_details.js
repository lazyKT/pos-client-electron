let serverUrl;
const closeButton = document.getElementById('close-button');

closeButton.addEventListener('click', e => bookingDetailsAPI.send('close-booking-details'));

window.bookingDetailsAPI.receive('bookingId', async (bookingId) => {
  try {

    loadDataFromLocalStorage();
    clearAlerts();

    const response = await fetchBookingById(bookingId);

    if (response && response.ok) {
      const booking = await response.json();
      displayBookingDetails(booking);
    }
    else {
      const errorMessage = await getErrorMessageFromResponse(response);
      showErrorAlert(errorMessage);
    }

  }
  catch (error) {
    showErrorAlert(error.message);
  }
});


// clean up event listeners on window unload
window.onUnload = () => window.bookingDetailsAPI.removeListeners();


function displayBookingDetails (booking) {

  const { _id, patientName, bookingId, patientContact, doctorName, dateTime } = booking;

  const bookingTitle = document.getElementById('booking-title');
  bookingTitle.innerHTML = `Booking # ${_id}`;

  const bookingIdDOM = document.getElementById('booking-id');
  bookingIdDOM.value = bookingId;

  const patientNameDOM = document.getElementById('patient-name');
  patientNameDOM.value = patientName;

  const patientContactDOM = document.getElementById('patient-contact');
  patientContactDOM.value = patientContact;

  const doctorDOM = document.getElementById('doctor');
  doctorDOM.value = doctorName;

  const bookingDateTime = new Date(dateTime);

  const bookingDate = document.getElementById('booking-date');
  bookingDate.value = bookingDateTime.toDateString();

  const bookingTime = document.getElementById('booking-time');
  bookingTime.value = formatTimeWithPeriod(bookingDateTime.toLocaleTimeString());
}


function clearAlerts () {
  const errorAlert = document.getElementById('error-alert');
  if (errorAlert)   errorAlert.remove();
}


function showErrorAlert (message) {
  // clear all the alerts before showing new alert
  clearAlerts();

  const container = document.getElementById('container');
  const form = document.getElementById('form');

  const errorAlert = document.createElement('div');
  errorAlert.setAttribute('id', 'error-alert');
  errorAlert.setAttribute('class', 'alert alert-danger');
  errorAlert.setAttribute('role', 'alert');
  errorAlert.innerHTML = message;

  container.insertBefore(errorAlert, form);
}


function formatTimeWithPeriod (time) {
  let hour = parseInt(time.split(':')[0]);
  let minute = parseInt(time.split(':')[1]);
  let period = '';

  if (hour === 12) {
    period = 'PM;'
  }
  else if (hour > 12) {
    hour = hour - 12;
    period = 'PM';
  }
  else {
    period = 'AM';
  }

  if (minute < 10)
    minute = '0' + minute;

  return `${hour}:${minute} ${period}`;
}


/** show appropriate error base on network response status **/
async function getErrorMessageFromResponse (response) {
	let errorMessage = "";
	try {
		switch (response?.status) {
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


function loadDataFromLocalStorage () {
  // get server URL
  serverUrl = localStorage.getItem("serverUrl");
  if (!serverUrl || serverUrl === null)
    throw new Error ("Application Error: Failed to get Server URL.");
}

async function fetchBookingById (id) {
  try {
    const response = fetch(`${serverUrl}/api/bookings/${id}`, {
      method: 'GET',
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
