/**
 *  Cashier Window for Clinic
 **/
const path = require('path');
const {
	BrowserWindow,
	ipcMain
} = require('electron');

const { createReceiptWindow } = require('./receiptWindow');
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
				removeEventListeners(ipcMain, []);
				win = null;
			}
		});

		ipcMain.on('clinic-cashier-close', () => {
			win.close();
		});

		ipcMain.on('clinic-cashier-receipt', (event, data) => {
			createReceiptWindow(win, data);
		});
	}
}