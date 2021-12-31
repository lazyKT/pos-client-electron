let serverUrl;

window.bookingDetailsAPI.receive('bookingId', async (bookingId) => {
  try {

    loadDataFromLocalStorage();

    const response = await fetchBookingById(bookingId);

    if (response && response.ok) {
      const booking = await response.json();
      displayBookingDetails(booking);
    }
    else {
      const { message } = await response.json();
      const errorMessage = message ? message : 'Network Error!';
      console.error(errorMessage);
    }

  }
  catch (error) {
    console.error(error);
  }
});


function displayBookingDetails (booking) {

  const { _id, patientName, bookingId, patientContact } = booking;

  const bookingTitle = document.getElementById('booking-title');
  bookingTitle.innerHTML = `Booking # ${_id}`;

  const bookingIdDOM = document.getElementById('booking-id');
  bookingIdDOM.value = bookingId;

  const patientNameDOM = document.getElementById('patient-name');
  patientNameDOM.value = patientName;

  const patientContactDOM = document.getElementById('patient-contact');
  patientContactDOM.value = patientContact;
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
