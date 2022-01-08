let serverUrl, doctorName, bookingDateTime
console.log('booking_list.js running...');

window.bookingListAPI.receive('filter', async (filter) => {
  try {
    loadDataFromLocalStorage();
    console.log('filter', filter);

    bookingDateTime = filter.dateTime;

    await getDoctorInfo(filter.doctor);

    const response = await fetchingBookingByDoctorAndDateTime(filter);

    if (response && response.ok) {
      const bookings = await response.json();
      console.log(bookings);
      displayBookings(bookings);
    }
    else {
      const errorMessage = await getErrorMessageFromResponse(response);
      console.error(errorMessage);
    }
  }
  catch (error) {
    console.error(error.message);
  }
});


async function getDoctorInfo (doctorId) {
  try {
    const response = await fetchDoctorById(doctorId);

    if (response && response.ok) {
      const doctor = await response.json();
      doctorName = doctor.name;
      displayBookingFilters(doctorName, bookingDateTime);
    }
    else {
      const errorMessage = await getErrorMessageFromResponse(response);
      console.error(errorMessage);
    }
  }
  catch (error) {
    console.error(error.message);
  }
}


function displayBookings (bookings) {
  const container = document.getElementById("container");
  if (!container)
    throw new Error (`Error! ${displayBookings} ~ container Not Found!`);

  bookings.forEach(booking => {
    const div = document.createElement('div');
    div.setAttribute('class', 'p-2');

    const tokenNumber = document.createElement('h6');
    tokenNumber.innerHTML = `Token #${booking.bookingId}`;
    div.appendChild(tokenNumber);

    const infoRow = document.createElement('div');
    infoRow.setAttribute('class', 'row my-2');

    createDataColumn(infoRow, 'Patient Name', booking.patientName);
    createDataColumn(infoRow, 'Patient Contact', booking.patientContact);
    createDataColumn(infoRow, 'Doctor Name', booking.doctorName);

    div.appendChild(infoRow);
    container.appendChild(div);

    const hr = document.createElement('hr');
    hr.setAttribute('class', 'm-2');
    container.appendChild(hr);
  });
}


function createDataColumn (row, title, data) {
  const col = document.createElement('div');
  col.setAttribute('class', 'col');

  const p = document.createElement('p');
  p.setAttribute('class', 'text-muted');
  p.innerHTML = title;
  col.appendChild(p);

  const h6 = document.createElement('h6');
  h6.innerHTML = data;
  col.appendChild(h6);

  row.appendChild(col);
}


function loadDataFromLocalStorage () {
  // get server URL
  serverUrl = localStorage.getItem("serverUrl");
  if (!serverUrl || serverUrl === null)
    throw new Error ("Application Error: Failed to get Server URL.");
}


function displayBookingFilters (doctor, datetime) {
  const loginName = document.getElementById("doctor-name");
  loginName.innerHTML = doctor;

  const bookingTime = document.getElementById("booking-time");
  const dt = new Date(datetime);
  bookingTime.innerHTML = `${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}`;
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



async function fetchDoctorById (doctorId) {
  try {
    const response = await fetch(`${serverUrl}/api/doctors/${doctorId}`, {
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


async function fetchingBookingByDoctorAndDateTime ({doctor, dateTime}) {
  try {
    const url = `${serverUrl}/api/bookings/datetime`;
    const response = await fetch(`${url}?doctor=${doctor}&dateTime=${dateTime}`, {
      headers: {
        'Content-Type' : 'application/json',
        'Accept' : 'application/json'
      }
    });

    return response;
  }
  catch (error) {
    console.error(error.message);
  }
}
