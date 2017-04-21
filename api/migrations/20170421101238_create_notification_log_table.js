
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('notification_schedule_log', function(table){
      table.increments().primary()
      table.string('room')
      table.string('type')
      table.string('description')
      table.string('day')
      table.string('starttime')
      table.string('endtime')
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.timestamp('updated_at').defaultTo(knex.fn.now())
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
		knex.schema.dropTable('notification_schedule_log')
	])
};
