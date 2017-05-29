
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('power_factor', function(table){
      table.increments().primary()
      table.string('room').unique()
      table.string('description')
      table.decimal('powerfactor_value', null, 3)
      table.decimal('real_power', null, 3)
      table.decimal('reactive_power', null, 3)
      table.decimal('voltage_value', null, 3)
      table.decimal('current_value', null, 3)
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.timestamp('updated_at').defaultTo(knex.fn.now())
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
		knex.schema.dropTable('power_factor')
	])
};