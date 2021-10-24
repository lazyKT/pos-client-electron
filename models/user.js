const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@site.com',
    password: 'admin'
  },
  {
    id: 2,
    username: 'jackwill',
    email: 'jack@site.com',
    password: 'jack'
  },
  {
    id: 3,
    username: 'augie',
    email: 'augie@site.com',
    password: 'augie'
  },
  {
    id: 4,
    username: 'summer',
    email: 'summer@site.com',
    password: 'summer'
  },
  {
    id: 5,
    username: 'winter',
    email: 'winter@site.com',
    password: 'summer'
  },
  {
    id: 6,
    username: 'administrator',
    email: 'lwin@site.com',
    passowrd: 'lwin'
  }
]


exports.createNewUser = function createNewUser({username, email, password}) {
  const numOfUsers = users.length;
  users.push({
    id: numOfUsers + 1,
    username,
    email,
    password
  });
  if (users.length === (numOfUsers + 1))
    return 201; // http status code 201 Created
  return 500; // http status code 500 Internal Server Error
}


exports.getAllUsers = function getAllUsers() {
  return users;
}


exports.getUserById = function getUserById(id) {
  return users.find(user => user.id === parseInt(id));
}


exports.updateUser = function updateUser(request) {
  const { id, username, email } = request;

  const user = users.find(user => user.id === parseInt(id));

  if (!user)
    return { error: 'Not Found', status: 404 }; // http status code not_found

  user.username = username;
  user.email = email;
  return { data: user, status: 200 }; // http status code 200 OK
}


exports.loginUser = function login({username, password}) {
  // get user from usres array
  const user = users.find(u => u.username === username);
  if (user) return {status: 200, data: {username}}
  else return {status: 401, message: 'Incorrect username or password!'}
}


exports.searchUser = function searchUser(q) {
  // search user data which match the keyword: q
  return users.filter(user => (user.username.includes(q) || user.email.includes(q)));
}
