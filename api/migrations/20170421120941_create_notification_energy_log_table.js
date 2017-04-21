
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('notification_energy_log', function(table){
      table.increments().primary()
      table.string('room').unique()
      table.string('type')
      table.string('description')
      table.decimal('maxenergy', null, 3)
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.timestamp('updated_at').defaultTo(knex.fn.now())
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
		knex.schema.dropTable('notification_energy_log')
	])
};