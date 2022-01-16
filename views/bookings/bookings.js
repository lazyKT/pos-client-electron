/**
# Booking Scripts
**/

let serverUrl, empName, empId, calendar;
const searchContents = document.getElementById('search-contents');
const searchButton = document.getElementById('search-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const loadingSpinner2 = document.getElementById('loading-spinner-create-booking');
const loadingSpinner3 = document.getElementById('loading-spinner-weekly-view');
const bookingDateInput = document.getElementById('booking-date');
const patientInfoInputs = document.getElementById('patient-info-inputs');
const scheduleWarning = document.getElementById('schedule-warning');
const errorAlertCreateBooking = document.getElementById('error-alert-create-booking');
// a button to check whether the chosen booking slot is tally with doctor schedule
const checkScheduleButton = document.getElementById('check-schedule-btn');
const createBookingButton = document.getElementById('create-booking-btn');
const doctorSelect = document.getElementById('doctor-select');
const showBooking = document.getElementById('show-booking');


window.onload = async () => {
  try {

    searchContents.style.display = 'none';

    setMinimumBookingDate (bookingDateInput);
    // fetch required data from local storage
    loadDataFromLocalStorage ();
    // display login name and login time
    displayLoginInformation ();

    displayWeeklyViewCalendar();

    await getAllDoctors();

    fillUpBookingTimeSelect();
  }
  catch (error) {
    console.error(error);
    showErrorAlert(error.message);
  }
  finally {
    loadingSpinner.style.display = 'none';
    loadingSpinner2.style.display = 'none';
    loadingSpinner3.style.display = 'none';
    patientInfoInputs.style.display = 'none';
    errorAlertCreateBooking.style.display = 'none';
  }
}


// clean up event listeners on window unload
window.onUnload = () => window.bookingsAPI.removeListeners();


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

function fillUpBookingTimeSelect () {
  const bookingTimeSelect = document.getElementById('booking-time');
  for (let i = 9; i < 20; i++) {
    const option = document.createElement('option');
    option.setAttribute('value', i);
    if (i < 12)
      option.innerHTML = i + ':00 AM';
    else if (i === 12)
      option.innerHTML = '12:00 PM';
    else
      option.innerHTML = (i % 12) + ':00 PM';

    bookingTimeSelect.appendChild(option);
  }
}


// check whether the chosen booking date and time fall inside the chosen doctor's working schedule
checkScheduleButton.addEventListener('click', async (e) => {
  try {
    e.preventDefault();

    loadingSpinner2.style.display = 'block';

    const doctorId = document.getElementById('doctors-select-create-booking')?.value;
    const bookingDate = document.getElementById('booking-date')?.value;
    const bookingTime = document.getElementById('booking-time')?.value;

    if (!doctorId || doctorId === '' || !bookingDate || bookingDate === '' || !bookingTime || bookingTime === 0)
      throw new Error('Missing Required Input(s)');

    let bookingDateTime = {
      doctorId,
      day: (new Date(bookingDate)).getDay(),
      time: bookingTime
    }

    const response = await checkBookingWithDoctorSchedule (bookingDateTime);

    if (response && response.ok) {
      const { doctor, isRegular } = await response.json();

      if (isRegular) {
        scheduleWarning.style.display = 'none';
      }
      else {
        scheduleWarning.style.display = 'block';
        scheduleWarning.innerHTML = `The chosen booking time is out of ${doctor}'s schedule'`;
      }
      patientInfoInputs.style.display = 'block';
    }
    else {
      const errorMessage = await getErrorMessageFromResponse(response);
      showCreateBookingAlert(errorMessage);
    }
  }
  catch (error) {
    showCreateBookingAlert(error.message);
  }
  finally {
    loadingSpinner2.style.display = 'none';
  }
});


// create booking
createBookingButton.addEventListener('click', async (e) => {
  try {
    e.preventDefault();
    loadingSpinner2.style.display = 'block';

    const doctorId = document.getElementById('doctors-select-create-booking')?.value;
    const bookingDate = document.getElementById('booking-date')?.value;
    const bookingTime = document.getElementById('booking-time')?.value;
    const patientName = document.getElementById('patient-name')?.value;
    const patientContact = document.getElementById('patient-contact')?.value;

    if (!doctorId || doctorId === '' || !bookingDate || bookingDate === '' || !bookingTime || bookingTime === ''
            || !patientName || patientName === '' || !patientContact || patientContact === '')
      throw new Error ('Missing Required Fields');

    let booking = {
      receptionistId : empId,
      doctorId : doctorId,
      patientName: patientName,
      patientContact: patientContact,
      dateTime: parseInt(bookingTime) < 10 
        ? `${bookingDate}T0${bookingTime}:00:00`
        : `${bookingDate}T${bookingTime}:00:00`
    };
    const response = await createNewBooking(booking);

    if (response && response.ok) {
      booking = await response.json();

      clearCreateBookingInputs();
      scheduleWarning.style.display = 'none';
      patientInfoInputs.style.display = 'none';
      showCreateBookingAlert(`New Booking Created!`, 'success');
    }
    else {
      const errorMessage = await getErrorMessageFromResponse(response);
      showCreateBookingAlert(errorMessage);
    }
  }
  catch (error) {
    console.error(error.message);
    showCreateBookingAlert (error.message);
  }
  finally {
    loadingSpinner2.style.display = 'none';
  }
});


/* clear all inputs */
function clearCreateBookingInputs () {
  const inputs = document.querySelectorAll('[data-type]');

  inputs.forEach( i => i.value = '');
}


/*=============================================================
==================== Search Bookings ==========================
=============================================================*/


searchButton.addEventListener('click', async (e) => {
  try {
    const searchKeyWord = document.getElementById('search-input')?.value;

    if (searchKeyWord && searchKeyWord !== '') {

      loadingSpinner.style.display = 'block';

      const response = await fetchAllBookingsRequest(searchKeyWord);

      clearAlerts();
      reloadTable();

      searchContents.style.display = 'block';

      if (response && response.ok) {
        const bookings = await response.json();

        if (bookings.length === 0)
          showEmptyAlert(`No booking with keyword, ${searchKeyWord}`);
        else
          displayBookings(bookings);
      }
      else {
        const errorMessage = await getErrorMessageFromResponse(response);
        showErrorAlert(errorMessage);
      }
    }
  }
  catch (error) {
    console.error(error);
    showErrorAlert(error.message);
  }
  finally {
    loadingSpinner.style.display = 'none';
  }
});


function refreshAllBookingData () {
  window.location.reload();
}


/* display all bookings in table */
function displayBookings (bookings) {
  const table = document.getElementById('bookings-table');

  bookings.forEach( (booking, idx) => {
    const row = table.insertRow(idx+1);
    row.setAttribute('data-type', 'filter-booking');

    const bookingDateTime = new Date(booking.dateTime);

    createTableCell(row, 0, booking._id);
    createTableCell(row, 1, booking.bookingId);
    createTableCell(row, 2, booking.patientName);
    createTableCell(row, 3, booking.patientContact);
    createTableCell(row, 4, bookingDateTime.toDateString());
    createTableCell(row, 5, formatTimeWithPeriod(bookingDateTime.toLocaleTimeString()));
    createTableCell(row, 6, booking.doctorName);

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
      window.bookingsAPI.send('open-booking-details', { bookingId: booking._id });
    });

  });
}


function createTableCell (row, pos, data) {
  const cell = row.insertCell(pos);
  cell.innerHTML = data ? data : '-- --';
}



function reloadTable () {
  const trs = document.querySelectorAll(`[data-type=filter-booking]`);

  trs.forEach( (tr, idx) => tr.remove());
}



/*=============================================================
======================== Weekly View ==========================
=============================================================*/

function displayWeeklyViewCalendar () {

  clearAlertsCalendar();

  const weeklyView = document.getElementById('weekly-bookings-view');

  calendar = new FullCalendar.Calendar(weeklyView, {
    height: '700px',
    initialView: 'timeGridWeek',
    slotMinTime: '09:00:00',
    slotMaxTime: '20:00:00'
  });

  calendar.render();

  // calendar.on('dateClick', (info) => {
  //
  // });

  calendar.on('eventClick', e => {
    if (showBooking.checked) {
      const bookingDateTime = new Date(e.event._def.publicId);
      window.bookingsAPI.send('open-booking-list', {
        doctor: doctorSelect?.value,
        dateTime: e.event._def.publicId
      });
    }
  })

  calendar.on('datesSet', async (info) => {
    try {
      loadingSpinner3.style.display = 'block';
      const doctorId = doctorSelect?.value;

      // clear existing bookings and make room for newly updated bookings/schedules
      removeAllEvents();

      clearAlertsCalendar();

      if (showBooking.checked) {
        // show bookings
        const response = await fetchBookingsByDoctor (doctorId);

        if (response && response.ok) {
          const bookings = await response.json();

          displayDoctorBookings(bookings);
        }
        else {
          const errorMessage = await getErrorMessageFromResponse(response);
          console.error(errorMessage);
          showErrorAlertCalendar(errorMessage);
        }
      }
      else {
        // show schedules
        await fetchDoctorSchedules(doctorId);
      }
    }
    catch (error) {
      console.error(error.message);
      showErrorAlertCalendar(error.message);
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

    clearAlertsCalendar();

    if (response && response.ok) {
      const doctors = await response.json();

      // fill doctor names in select
      fillUpDoctorSelectInput(doctors, doctorSelect);

      fillUpDoctorSelectInput(doctors, document.getElementById('doctors-select-create-booking'));
    }
    else {
      const errorMessage = await getErrorMessageFromResponse(response);
      console.error(errorMessage);
      showErrorAlertCalendar(errorMessage);
    }
  }
  catch (error) {
    console.error(error);
    showErrorAlert(error.message);
    showErrorAlertCalendar(error.message);
  }
}


// fill doctor data in select input
function fillUpDoctorSelectInput (doctors, select) {

  if (!select)
    throw new Error('Error. fillUpDoctorSelectInput: Invalid Select!');

  doctors.forEach (doc => {
    const option = document.createElement('option');
    option.setAttribute('value', doc._id);
    option.innerHTML = `${doc.name} (${doc.specialization})`;
    select.appendChild(option);
  });
}


// doctorSelect Input On Change event
// Based on the selected doctor value, display the schedule in calendar
doctorSelect.addEventListener('change', async (e) => {
  try {
    if (e.target.value !== '') {

      loadingSpinner3.style.display = 'block';

      showBooking.checked = false;

      removeAllEvents();

      await fetchDoctorSchedules(e.target.value);
    }
  }
  catch (error) {
    console.error(error.message);
  }
  finally {
    loadingSpinner3.style.display = 'none';
  }

});


// show booking checkbox onChange event
// if the checkbox is checked, show bookings with the selected doctor
showBooking.addEventListener('change', async (e) => {
  try {
    const doctorId = doctorSelect?.value;
    loadingSpinner3.style.display = 'block';
    removeAllEvents();
    if (e.target.checked) {
      const response = await fetchBookingsByDoctor (doctorId);

      if (response && response.ok) {
        const bookings = await response.json();

        displayDoctorBookings(bookings);
      }
      else {
        const errorMessage = await getErrorMessageFromResponse(response);
        console.error(errorMessage);
      }
    }
    else {
      await fetchDoctorSchedules(doctorId);
    }
  }
  catch (error) {
    console.error(error.message);
  }
  finally {
    loadingSpinner3.style.display = 'none';
  }
});


// display doctor bookings in Calendar
function displayDoctorBookings (bookings) {
  bookings.forEach( booking => {

    let e = calendar.getEventById(booking.dateTime);

    if (e) {
      e.remove(); // remove the existing booking to make room for newly updated booking slot
      e = {
        id: booking.dateTime,
        title: (new RegExp(/\d/)).test(e.title) ? `${parseInt(e.title) + 1} Bookings` : '2 Bookings',
        start: booking.dateTime
      }

    }
    else {
      e = {
        id: booking.dateTime,
        title: booking.patientName,
        start: booking.dateTime
      }
    }

    calendar.addEvent(e);
  });
}


// display doctor schedules
async function fetchDoctorSchedules (doctorId) {
  try {
    if (doctorId && doctorId !== '') {

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
}


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

  const emptyAlert = document.getElementById('empty-alert');
  if (emptyAlert)   emptyAlert.remove();
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


function showEmptyAlert (message) {
  clearAlerts();

  const container = document.getElementById('data-container');

  const emptyAlert = document.createElement('div');
  emptyAlert.setAttribute('id', 'empty-alert');
  emptyAlert.setAttribute('class', 'alert alert-info');
  emptyAlert.setAttribute('role', 'alert');
  emptyAlert.innerHTML = message;

  container.appendChild(emptyAlert);
}


function showErrorAlertCalendar (message) {
  clearAlertsCalendar();

  const container = document.getElementById('calendar-container');
  const doctorOptions = document.getElementById('doctor-container-calendar');

  const errorAlert = document.createElement('div');
  errorAlert.setAttribute('id', 'error-alert-calendar');
  errorAlert.setAttribute('class', 'alert alert-danger');
  errorAlert.setAttribute('role', 'alert');
  errorAlert.innerHTML = message;

  container.insertBefore(errorAlert, doctorOptions);
}


function clearAlertsCalendar () {
  const alert = document.getElementById('error-alert-calendar');
  if (alert) alert.remove();
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


async function fetchBookingsByDoctor (doctorId) {
  try {
    const response = await fetch(`${serverUrl}/api/bookings/search?doctor=${doctorId}`, {
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


async function fetchAllBookingsRequest (q) {
  try {
    const url = `${serverUrl}/api/bookings?q=${q}`;
    const response = await fetch(url, {
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


/* check bookgin Date TIme with Doctor Working Schedule */
async function checkBookingWithDoctorSchedule ({doctorId, time, day}) {
  try {
    const url = `${serverUrl}/api/doctors/check-schedule`;
    const response = await fetch(`${url}?doctor=${doctorId}&time=${time}&day=${day}`, {
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
