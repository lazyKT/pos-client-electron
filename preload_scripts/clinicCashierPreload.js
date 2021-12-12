/**
 * Preload Scripts for the Clinic Cashier
 **/

const {
	ipcRenderer,
	contextBridge
} = require('electron');


const ALLOWED_SEND_CHANNELS = [
	'clinic-cashier-close',
	'print-clinic-receipt'
];



contextBridge.exposeInMainWorld ('clinicCashierAPI', {
	send: (channel, data) => {
		if (ALLOWED_SEND_CHANNELS.includes(channel)) {
			ipcRenderer.send(channel, data);
		}
		else
			throw new Error(`Unkown IPC Channel ${channel} detected in clinicCashierAPI`);
	}
});
