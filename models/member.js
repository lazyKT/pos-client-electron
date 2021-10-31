/**
# Members and Patients
**/

const members = [
  {
    id: 1,
    username: "ktl123",
    point: 12
  },
  {
    id: 2,
    username: "kz12",
    point: 10
  },
  {
    id: 3,
    username: "uname123",
    point: 12
  },
  {
    id: 4,
    username: "kkttll",
    point: 5
  },
  {
    id: 5,
    username: "jazz",
    point: 1
  },
  {
    id: 6,
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
