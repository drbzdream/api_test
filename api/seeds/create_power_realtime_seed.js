
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('power_realtime').del()
    .then(function () {
      // Inserts seed entries
      return knex('power_realtime').insert([
        {id: 1, power_value: '202', timestemp: '2015-01-01'},
        {id: 2, power_value: '300', timestemp: '2015-01-02'},
        {id: 3, power_value: '250', timestemp: '2015-01-03'}
      ]);
    });
};
