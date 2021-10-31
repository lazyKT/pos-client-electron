/**
# Members and Patients
**/

const members = [
  {
    id: 1,
    fullname: "Kyaw Thit Lwin",
    username: "ktl123",
    point: 12
  },
  {
    id: 2,
    fullname: "Pyay Nyein Aung",
    username: "pna123",
    point: 10
  },
  {
    id: 3,
    fullname: "Thomas",
    username: "uname123",
    point: 12
  },
  {
    id: 4,
    fullname: "Kevin",
    username: "kkttll",
    point: 5
  },
  {
    id: 5,
    fullname: "Jake",
    username: "jazz",
    point: 1
  },
  {
    id: 6,
    fullname: "Amy",
    username: "doe",
    point: 9
  },
];


exports.searchMembers = function searchMembers(q) {
  const results = members.filter( m => (m.username).includes(q));

  return results;
}



exports.getMemberById = function getMemberById (id) {
  return members.find( m => m.id === id);
}
