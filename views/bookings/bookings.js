/**
# Booking Scripts
**/

let serverUrl, empName, empId, calendar;
const loadingSpinner = document.getElementById('loading-spinner');
const loadingSpinner2 = document.getElementById('loading-spinner-create-booking');
const loadingSpinner3 = document.getElementById('loading-spinner-weekly-view');
const bookingDateInput = document.getElementById('booking-date');
const bookingInfoInputGroup = document.getElementById('booking-info-inputs');
const errorAlertCreateBooking = document.getElementById('error-alert-create-booking');
const createBookingButton = document.getElementById('create-booking-btn');
const doctorSelect = document.getElementById('doctor-select');


window.onload = async () => {
  try {

    setMinimumBookingDate (bookingDateInput);
    // fetch required data from local storage
    loadDataFromLocalStorage ();
    // display login name and login time
    displayLoginInformation ();

    displayWeeklyViewCalendar();

    await getAllDoctors();

    await fetchAllBookings();

    await fetchServicesFromServer();
  }
  catch (error) {
    console.error(error);
    showErrorAlert(error.message);
  }
  finally {
    loadingSpinner.style.display = 'none';
    loadingSpinner2.style.display = 'none';
    loadingSpinner3.style.display = 'none';
    bookingInfoInputGroup.style.display = 'none';
    errorAlertCreateBooking.style.display = 'none';
  }
}


async function fetchServicesFromServer () {
  try {
    const response = await fetchServices();

    if (response && response.ok) {
      const services = await response.json();

      displayServices(services);
    }
    else {
      const errorMessage = await getErrorMessageFromResponse(response);
      showCreateBookingErrorAlert(errorMessage);
    }
  }
  catch (error) {
    showCreateBookingErrorAlert(error.message);
  }
}


function logout () {
  clearUserLocalStorageData();
  window.bookingsAPI.send('logout');
}

/*=============================================================
====================== Create Bookings ========================
=============================================================*/

bookingDateInput.addEventListener('change', async (e) => {
  try {
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
        showCreateBookingAlert(errorMessage);
      }
    }
  }
  catch (error) {
    console.error(error.message);
    showCreateBookingAlert(error.message);
  }
  finally {
    loadingSpinner2.style.display = 'none'; // hide loading spinner
  }
});


function displayBookingTimeSlots (slots) {
  const timeSlotSelect = document.getElementById('time-slots');

  if (!timeSlotSelect)
    throw new Error ('Time Slot Select Not Found!');

  clearOptionsFromSelect (timeSlotSelect);

  slots.forEach( slot => {
    const option = document.createElement('option');
    option.setAttribute('value', slot._id);
    option.innerHTML = `${slot.startTime} - ${slot.endTime}`;
    timeSlotSelect.appendChild(option);
  });
}


function displayServices (services) {
  const servicesSelect = document.getElementById('service-select');

  if (!servicesSelect)
    throw new Error ('Service Select Not Found!');

  clearOptionsFromSelect (servicesSelect);

  services.forEach( service => {
    const option = document.createElement('option');
    option.setAttribute('value', service._id);
    option.innerHTML = service.name;
    servicesSelect.appendChild(option);
  });
}


createBookingButton.addEventListener('click', async (e) => {
  try {
    e.preventDefault();

    const bookingDate = bookingDateInput.value;
    const patientName = (document.getElementById('patient-name'))?.value;
    const patientContact = (document.getElementById('patient-contact'))?.value;
    const serviceId = (document.getElementById('service-select'))?.value;
    const timeSlot = (document.getElementById('time-slots'))?.value;
    const assignedStaffName = (document.getElementById('staff-name'))?.value;

    if ((new Date(bookingDate)) < Date.now()) {
      throw new Error('Booking Date Must be advance 1 day from now!');
    }

    if (!patientName || patientName === '' || !patientContact || patientContact === '')
      throw new Error ('Patient Name and Contact is Required.*');

    if (!serviceId || serviceId === -1 || !assignedStaffName || assignedStaffName === '')
      throw new Error ('Service and Assigned Staff must not be empty!');

    if (!timeSlot || timeSlot === -1)
      throw new Error ('Invalid Booking Time Slot!');

    let booking = createBookingObject ({
      bookingDate, timeSlot, serviceId, patientName, patientContact, assignedStaffName
    });

    console.log(booking);

    const response = await createNewBooking(booking);

    if (response && response.ok) {
      let booking = await response.json();

      clearCreateBookingInputs();

      showCreateBookingAlert('New Booking Created', type='info');

      bookingInfoInputGroup.style.display = 'none';
    }
    else {
      const errorMessage = await getErrorMessageFromResponse(response);
      showCreateBookingAlert (errorMessage);
    }
  }
  catch (error) {
    showCreateBookingAlert (error.message);
  }
});


/* clear all inputs */
function clearCreateBookingInputs () {
  const inputs = document.querySelectorAll('[data-type]');

  inputs.forEach( i => i.value = '');
}


/*=============================================================
======================= All Bookings ==========================
=============================================================*/

function refreshAllBookingData () {
  window.location.reload();
}


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
    createTableCell(row, 3, (new Date(booking.bookingDate)).toLocaleDateString());
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

    row.addEventListener('click', e => {
      console.log('view booking details for booking id : ', booking._id);
      window.bookingsAPI.send('open-booking-details', { bookingId: booking._id });
    });

  });
}


function createTableCell (row, pos, data) {
  const cell = row.insertCell(pos);
  cell.innerHTML = data ? data : '-- --';
}


/*=============================================================
======================== Weekly View ==========================
=============================================================*/

function displayWeeklyViewCalendar () {
  const weeklyView = document.getElementById('weekly-bookings-view');

  calendar = new FullCalendar.Calendar(weeklyView, {
    height: '700px',
    initialView: 'timeGridWeek',
    slotMinTime: '09:00:00',
    slotMaxTime: '20:00:00'
  });

  calendar.render();

  calendar.on('dateClick', (info) => {
    console.log('click on', info);
  });

  calendar.on('datesSet', async (info) => {
    try {
      const doctorId = doctorSelect?.value;
      if (doctorId && doctorId !== '') {

        loadingSpinner3.style.display = 'block';

        const response = await fetchDoctorById(doctorId);

        if (response && response.ok) {
          const doctor = await response.json();
          addScheduleToCalendar (doctor.workingSchedule, doctor.name);
        }
        else {
          const errorMessage = await getErrorMessageFromResponse(response);
          console.error(errorMessage);
        }
      }
    }
    catch (error) {
      console.error(error.message);
    }
    finally {
      loadingSpinner3.style.display = 'none';
    }
  });
}


// get all doctors data from server
async function getAllDoctors () {
  try {
    const response = await fetchAllDoctors();

    if (response && response.ok) {
      const doctors = await response.json();

      // fill doctor names in select
      fillUpDoctorSelectInput(doctors);
    }
    else {
      const errorMessage = await getErrorMessageFromResponse(response);
      console.error(errorMessage);
      showErrorAlert(errorMessage);
    }
  }
  catch (error) {
    console.error(error);
    showErrorAlert(error.message);
  }
}


// fill doctor data in select input
function fillUpDoctorSelectInput (doctors) {
  doctors.forEach (doc => {
    const option = document.createElement('option');
    option.setAttribute('value', doc._id);
    option.innerHTML = doc.name;
    doctorSelect.appendChild(option);
  });
}


// doctorSelect Input On Change event
// Based on the selected doctor value, display the schedule in calendar
doctorSelect.addEventListener('change', async (e) => {
  try {
    if (e.target.value !== '') {

      loadingSpinner3.style.display = 'block';

      removeAllEvents();

      const response = await fetchDoctorById(e.target.value);

      if (response && response.ok) {
        const doctor = await response.json();
        addScheduleToCalendar (doctor.workingSchedule, doctor.name);
      }
      else {
        const errorMessage = await getErrorMessageFromResponse(response);
        console.error(errorMessage);
      }
    }
  }
  catch (error) {
    console.error(error.message);
  }
  finally {
    loadingSpinner3.style.display = 'none';
  }

});


// remove all events from calendar
function removeAllEvents () {

  const events = calendar.getEvents();

  events.forEach(e => e.remove());
}


// display doctor schedule on the calendar
function addScheduleToCalendar (workingSchedule, title) {

  workingSchedule.forEach( (ws, idx) => {
    const e = createCalendarEventsFromSchedule (ws, title);

    const _e = calendar.getEventById(e.id);
    if (_e) _e.remove(); // remove existing event

    // add new event
    calendar.addEvent(e);
  });
}


// create calendar events from doctor working schedules
function createCalendarEventsFromSchedule (schedule, title) {
  const yyyy = calendar.getDate().getFullYear();
  let mm = calendar.getDate().getMonth() + 1;
  let dd = calendar.getDate().getDate() - (calendar.getDate().getDay() - parseInt(schedule.day));
  if (mm < 10) mm = '0' + mm;
  if (dd < 10) dd = '0' + dd;
  const eventDate = `${yyyy}-${mm}-${dd}`;
  return {
    id: `${eventDate}T${to24HourFormat(schedule.startTime)}`,
    title: title,
    start: `${eventDate}T${to24HourFormat(schedule.startTime)}`,
    end: `${eventDate}T${to24HourFormat(schedule.endTime)}`
  };
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


function showCreateBookingAlert (message, type='error') {
  if (!errorAlertCreateBooking)
    throw new Error('Error: Error Alert at Create Booking Not Found!');

  errorAlertCreateBooking.style.display = 'block';

  if (type === 'error')
    errorAlertCreateBooking.setAttribute('class', 'alert alert-danger');
  else
    errorAlertCreateBooking.setAttribute('class', 'alert alert-info');

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
  empId = emp._id;
}


function displayLoginInformation () {
  const loginName = document.getElementById("login-name");
  loginName.innerHTML = empName;

  const loginTime = document.getElementById("login-time");
  const now = new Date();
  loginTime.innerHTML = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
}


function clearUserLocalStorageData () {
  localStorage.removeItem("user");
}


function to24HourFormat (time) {
  const period = time.slice(time.length - 2, time.length);
  let hr = parseInt(time.split(':')[0]);
  let hrStr = '';

  if (period.toLowerCase() === 'pm') {
    hrStr = hr === 12 ? '12' : (hr + 12).toString();
  }
  else {
    hrStr = hr === 12
        ? '00' : ( hr < 10
        ? '0' + hr : hr.toString());
  }

  return `${hrStr}:00:00`;
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


/** clear existing child options from select to make room for new data **/
function clearOptionsFromSelect (select) {
  while (select.childElementCount > 1) {
    select.removeChild(select.lastChild);
  }
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


function createBookingObject (details) {

  return {
    ...details,
    patientId: '',
    receptionistId: empId,
    receptionistName: empName,
    status: 'active'
  };
}


/*=============================================================
====================== Network Requests =======================
=============================================================*/


async function fetchAllDoctors () {
  try {
    const response = await fetch(`${serverUrl}/api/doctors`, {
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


async function fetchDoctorById (id) {
  try {
    const response = await fetch(`${serverUrl}/api/doctors/${id}`, {
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


async function fetchAllBookingsRequest () {
  try {
    const response = await fetch(`${serverUrl}/api/bookings`, {
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


/* get all booking time slots */
async function fetchAllBookingTimeSlots () {
  try {
    const response = await fetch(`${serverUrl}/api/bookings/all-slots`, {
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


/* get avaialble time slots for the given date */
async function fetchAvailableSlots (date) {
  try {
    const response = await fetch(`${serverUrl}/api/bookings/available-slots?date=${date}`, {
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


/* fetch medical services */
async function fetchServices () {
  try {
    const response = await fetch(`${serverUrl}/api/services`, {
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

/* create new booking request */
async function createNewBooking (booking) {
  try {
    const response = await fetch(`${serverUrl}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json',
        'Accept' : 'application/json'
      },
      body: JSON.stringify(booking)
    });

    return response;
  }
  catch (error) {
    console.error(error.message);
  }
}
