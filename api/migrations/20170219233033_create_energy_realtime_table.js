
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('energy_realtime', function(table){
      table.increments().primary()
      table.decimal('energy_value', null, 3)
      table.timestamp('timestemp').defaultTo(knex.fn.now())
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
		knex.schema.dropTable('energy_realtime')
	])
};


