
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('light').del()
    .then(function () {
      // Inserts seed entries
      return knex('light').insert([
        {id: 1, room: '202', 'day': '2015-01-01', '1:00': 10, '2:00': 20},
        {id: 2, room: '202', 'day': '2015-01-02', '1:00': 30, '2:00': 40},
        {id: 3, room: '203', 'day': '2015-01-01', '1:00': 50, '2:00': 60}
      ]);
    });
};
