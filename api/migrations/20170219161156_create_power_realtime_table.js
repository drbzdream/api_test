
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('power_realtime', function(table){
      table.increments().primary()
      table.decimal('power_value', null, 3)
      table.string('timestemp')
    })
  ])
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.dropTable('power_realtime')
	])
};
