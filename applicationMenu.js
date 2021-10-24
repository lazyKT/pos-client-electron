module.exports = [
  {
    label: 'App'
  },
  {
    label: 'Setting',
    submenu: [
      { label: 'About App', click: () => {console.log('About App')}},
    ]
  }
];
