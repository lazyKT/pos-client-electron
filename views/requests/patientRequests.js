const { ipcRenderer } = require('electron');

exports.getAllPatients = async function getAllPatients() {
  try {
    const res = await ipcRenderer.invoke('get-all-patients', '');

    return res;
  }
  catch(error) {
    console.log('Error Fetching All Patients', error);
  }
}


exports.createNewPatient = async function createNewPatient(newUser) {
  try {
    const response = await ipcRenderer.invoke('create-new-patient', newUser);

    return response;
  }
  catch(error) {
    console.log('Error Creating New Patient', error);
  }
}


exports.updatePatient = async function updatePatient(user) {
  try {
    const response = await ipcRenderer.invoke('update-patient', user);

    return response;
  }
  catch(error) {
    console.log('Error Updating Patient', error);
  }
}


exports.searchPatientRequest = async function searchPatient(q) {
  try {
    const response = await ipcRenderer.invoke('search-data', {data: 'patient', q});

    return response;
  }
  catch(error) {
    console.log('Error Searching Patient', error);
  }
}
