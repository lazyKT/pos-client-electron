const { createSettingWindow } = require("./windows/settingWindow.js");

module.exports = [
  {
    label: 'App'
  },
  {
    label: 'Options',
    submenu: [
      {
        label: "Setting", click: () => {
          createSettingWindow();
        }
      },
    ]
  }
];
