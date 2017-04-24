
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('data_realtime', function(table){
      table.increments().primary()
      table.string('room')
      table.decimal('data_value', null, 3)
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.timestamp('updated_at').defaultTo(knex.fn.now())
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
		knex.schema.dropTable('data_realtime')
	])
};