
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('schedule_rule').del()
    .then(function () {
      // Inserts seed entries
      return knex('schedule_rule').insert([
        {id: 1, room: '202', 'description': '2015-01-01', 'day': 'Wed', 'starttime': '13.00', 'endtime': '15.00'},
        {id: 2, room: '203', 'description': '2015-01-01', 'day': 'Wed', 'starttime': '14.00', 'endtime': '15.00'},
        {id: 3, room: '202', 'description': '2015-01-01', 'day': 'Wed', 'starttime': '16.00', 'endtime': '17.00'}
      ]);
    });
};
