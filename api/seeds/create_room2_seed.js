
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('room2').del()
    .then(function () {
      // Inserts seed entries
      return knex('room2').insert([
        {id: 1, room: '203', 'day': '2015-01-01', '1:00': 50, '2:00': 60}
      ]);
    });
};
