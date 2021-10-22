const items = [
  {
    id: 1,
    description: 'panadol1',
    expireDate: "23-04-2022",
    quantity: '30mg',
    location: "C1"
  },
  {
    id: 2,
    description: 'panadol2',
    expireDate: "23-04-2022",
    quantity: '30mg',
    location: "C1"
  },
  {
    id: 3,
    description: 'panadol3',
    expireDate: "23-04-2022",
    quantity: '30mg',
    location: "C1"
  },
  {
    id: 4,
    description: 'panadol4',
    expireDate: "23-04-2022",
    quantity: '30mg',
    location: "C1"
  },
  {
    id: 5,
    description: 'panadol5',
    expireDate: "23-04-2022",
    quantity: '30mg',
    location: "C1"
  }
]

exports.getAllItems = function getAllItems() {
  return items;
}

exports.addItems = function addItems(item) {
  items.push(item);
}
  
exports.loginUser = function login({username, password}) {
  // get user from user array
  const user = users.find(u => u.username === username);
  if (user) return {status: 200, data: {username}}
  else return {status: 401, message: 'Incorrect username or password!'}
}