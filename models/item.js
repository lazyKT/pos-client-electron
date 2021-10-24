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


exports.getItemById = function getItemrById(id) {
  return items.find(item => item.id === parseInt(id));
}


exports.updateItem = function updateItem(request) {
  const { id, description, expireDate, quantity, location } = request;

  const item = items.find(item => item.id === parseInt(id));

  if (!item)
    return { error: 'Not Found', status: 404 }; // http status code not_found

  item.description = description;
  item.expireDate = expireDate;
  item.quantity = quantity;
  item.location = location;
  return { data: item, status: 200 }; // http status code 200 OK
}

exports.searchItem = function searchItem(q) {
  // search item data which match the keyword: q
  return items.filter(item => (item.description.includes(q) || item.expireDate.includes(q) || item.quantity.includes(q) || item.location.includes(q)));
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
