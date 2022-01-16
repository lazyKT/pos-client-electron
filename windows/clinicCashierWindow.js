/**
 *  Cashier Window for Clinic
 **/
const path = require('path');
const {
	BrowserWindow,
	ipcMain
} = require('electron');

const { createClinicReciptWindow } = require('./clinicReceiptWindow');
const { removeEventListeners } = require('../ipcHelper');


let win


exports.createClinicCashierWindow = function (name, id) {
	if (!win || win === null) {

		win = new BrowserWindow({
			width: 1200,
			height: 1000,
			show: false,
			fullscreen: true,
			webPreferences: {
				nodeIntegration: false,
				contextIsolation: true,
				preload: path.join(__dirname, '../preload_scripts/clinicCashierPreload.js')
			}
		});


		win.loadFile(path.join(__dirname, '../views/cashier/clinic_cashier.html'));
		win.openDevTools();

		win.on('ready-to-show', () => {
			win.show();
		});

		win.on('close', () => {
			if (win) {
				removeEventListeners(ipcMain, ["clinic-cashier-close", "clinic-cashier-receipt"]);
				win = null;
			}
		});

		ipcMain.on('clinic-cashier-close', () => {
			if (win)
				win.close();
		});

		ipcMain.on('print-clinic-receipt', (event, data) => {
			createClinicReciptWindow(win, data);
		});
	}
}
