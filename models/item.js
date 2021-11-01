const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const items = [
  {
    id: 1,
    description: 'panadol1',
    dateAlert: '4 Days',
    quantityAlert: '5',
    subdescription: [
      {
          productId: 2345,
          description: 'panadol1',
          expireDate: '22-04-2022',
          quantity: '20',
          doctorApproval: 'true',
          ingredients: 'Acid, Base, Vitamins, Godzilla, Ultraman, Stephen Chow',
          dateCreated: '23-06-2021',
          dateUpdated: '24-06-2021'
      },
      {
          productId: 2346,
          description: 'panadol1',
          expireDate: '22-04-2022',
          quantity: '20',
          doctorApproval: 'true',
          ingredients: 'Acid, Base, Vitamins, Godzilla, Ultraman',
          dateCreated: '23-06-2021',
          dateUpdated: '24-06-2021'
      },
      {
          productId: 2347,
          description: 'panadol1',
          expireDate: '22-04-2022',
          quantity: '20',
          doctorApproval: 'true',
          ingredients: 'Acid, Base, Vitamins, Godzilla, Ultraman',
          dateCreated: '23-06-2021',
          dateUpdated: '24-06-2021'
      }
    ],
    location: "C1"
  },
  {
    id: 2,
    description: 'panadol2',
    dateAlert: '4 Days',
    quantityAlert: '5',
    subdescription: [
      {
          productId: 2348,
          description: 'panadol1',
          expireDate: '22-04-2022',
          quantity: '20',
          doctorApproval: 'true',
          ingredients: 'Acid, Base, Vitamins, Godzilla, Ultraman',
          dateCreated: '23-06-2021',
          dateUpdated: '24-06-2021'
      },
      {
          productId: 2349,
          description: 'panadol1',
          expireDate: '22-04-2022',
          quantity: '20',
          doctorApproval: 'true',
          ingredients: 'Acid, Base, Vitamins, Godzilla, Ultraman',
          dateCreated: '23-06-2021',
          dateUpdated: '24-06-2021'
      },
      {
          productId: 2350,
          description: 'panadol1',
          expireDate: '22-04-2022',
          quantity: '20',
          doctorApproval: 'true',
          ingredients: 'Acid, Base, Vitamins, Godzilla, Ultraman',
          dateCreated: '23-06-2021',
          dateUpdated: '24-06-2021'
      }
    ],
    location: "C1"
  },
  {
    id: 3,
    description: 'panadol3',
    dateAlert: '4 Days',
    quantityAlert: '5',
    subdescription: [
      {
          productId: 2351,
          description: 'panadol1',
          expireDate: '22-04-2022',
          quantity: '20',
          doctorApproval: 'true',
          ingredients: 'Acid, Base, Vitamins, Godzilla, Ultraman',
          dateCreated: '23-06-2021',
          dateUpdated: '24-06-2021'
      },
      {
          productId: 2352,
          description: 'panadol1',
          expireDate: '22-04-2022',
          quantity: '20',
          doctorApproval: 'true',
          ingredients: 'Acid, Base, Vitamins, Godzilla, Ultraman',
          dateCreated: '23-06-2021',
          dateUpdated: '24-06-2021'
      },
      {
          productId: 2353,
          description: 'panadol1',
          expireDate: '22-04-2022',
          quantity: '20',
          doctorApproval: 'true',
          ingredients: 'Acid, Base, Vitamins, Godzilla, Ultraman',
          dateCreated: '23-06-2021',
          dateUpdated: '24-06-2021'
      }
    ],
    location: "C1"
  },
  {
    id: 4,
    description: 'panadol4',
    dateAlert: '4 Days',
    quantityAlert: '5',
    subdescription: [
      {
          productId: 2354,
          description: 'panadol1',
          expireDate: '22-04-2022',
          quantity: '20',
          doctorApproval: 'true',
          ingredients: 'Acid, Base, Vitamins, Godzilla, Ultraman',
          dateCreated: '23-06-2021',
          dateUpdated: '24-06-2021'
      },
      {
          productId: 2355,
          description: 'panadol1',
          expireDate: '22-04-2022',
          quantity: '20',
          doctorApproval: 'true',
          ingredients: 'Acid, Base, Vitamins, Godzilla, Ultraman',
          dateCreated: '23-06-2021',
          dateUpdated: '24-06-2021'
      },
      {
          productId: 2356,
          description: 'panadol1',
          expireDate: '22-04-2022',
          quantity: '20',
          doctorApproval: 'true',
          ingredients: 'Acid, Base, Vitamins, Godzilla, Ultraman',
          dateCreated: '23-06-2021',
          dateUpdated: '24-06-2021'
      }
    ],
    location: "C1"
  },
  {
    id: 5,
    description: 'panadol5',
    dateAlert: '4 Days',
    quantityAlert: '5',
    subdescription: [
      {
          productId: 2357,
          description: 'panadol1',
          expireDate: '22-04-2022',
          quantity: '20',
          doctorApproval: 'true',
          ingredients: 'Acid, Base, Vitamins, Godzilla, Ultraman',
          dateCreated: '23-06-2021',
          dateUpdated: '24-06-2021'
      },
      {
          productId: 2358,
          description: 'panadol2',
          expireDate: '22-04-2022',
          quantity: '20',
          doctorApproval: 'true',
          ingredients: 'Acid, Base, Vitamins, Godzilla, Ultraman',
          dateCreated: '23-06-2021',
          dateUpdated: '24-06-2021'
      },
      {
          productId: 2359,
          description: 'panadol1',
          expireDate: '22-04-2022',
          quantity: '20',
          doctorApproval: 'true',
          ingredients: 'Acid, Base, Vitamins, Godzilla, Ultraman',
          dateCreated: '23-06-2021',
          dateUpdated: '24-06-2021'
      }
    ],
    location: "C1"
  }
]

exports.getAllItems = function getAllItems() {
  return items;
}

exports.getDetailItemById = function getDetailItemById(data){
  const detailItem = items.find(item => item.id === parseInt(data.id));
  return detailItem.subdescription;
}

exports.getItemById = function getItemById(id) {
  return items.find(item => item.id === parseInt(id));
}


exports.updateItem = function updateItem(request) {
  
  const { id, description, dateAlert, quantityAlert, location } = request;

  const item = items.find(item => item.id === parseInt(id));

  if (!item)
    return { error: 'Not Found', status: 404 }; // http status code not_found

  item.description = description;
  item.dateAlert = dateAlert;
  item.quantityAlert = quantityAlert;
  item.location = location;
  return { data: item, status: 200 }; // http status code 200 OK
}

exports.updateDetailItem = function updateDetailItem(request) {
  
  const { id, description, expireDate, quantity, location, dateAlert, quantityAlert } = request;

  const item = items.find(item => item.id === parseInt(id));

  if (!item)
    return { error: 'Not Found', status: 404 }; // http status code not_found

  item.description = description;
  item.expireDate = expireDate;
  item.quantity = quantity;
  item.location = location;
  item.dateAlert = dateAlert;
  item.quantityAlert = quantityAlert;
  return { data: item, status: 200 }; // http status code 200 OK
}

exports.searchItem = function searchItem(q) {
  // search item data which match the keyword: q
  return items.filter(item => (item.description.includes(q) || item.location.includes(q) || item.dateAlert.includes(q) || item.quantityAlert.includes(q)));
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

function getCsvWriter (filePath) {
  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      {id: 'id', title: 'ITEM ID'},
      {id: 'description', title: 'DESCRIPTION'},
      {id: 'expireDate', title: 'EXPIRE DATE'},
      {id: 'quantity', title: 'QUANTITY'},
      {id: 'location', title: 'LOCATION'}
    ]
  });
  return csvWriter;
}

function getFileNameFromPath (filePath) {
  const delimeter = process.platform === 'win32' ? '\\' : '/';
  const segs = filePath.split(delimeter);
  return filePath[segs.length - 1];
}

exports.exportItemCSV = async function exportCSV(targetFilePath) {

  try {
    const csvWriter = getCsvWriter (targetFilePath);
    const fileName = getFileNameFromPath (targetFilePath);

    await csvWriter.writeRecords(items);
  }
  catch (error) {
    console.log('Error Exporting CSV File', error)
  }
}
