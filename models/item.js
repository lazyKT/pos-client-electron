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

exports.createNewItem = function createNewItem({description, expireDate, quantity, location}) {
  const numOfItems = items.length;
  items.push({
    id: numOfItems + 1,
    description,
    expireDate,
    quantity,
    location
  });
  if (items.length === (numOfItems + 1))
    return 201; // http status code 201 Created
  return 500; // http status code 500 Internal Server Error
}