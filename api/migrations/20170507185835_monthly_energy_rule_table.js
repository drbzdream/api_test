
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('monthly_energy_rule', function(table){
      table.increments().primary()
      table.string('room').unique()
      table.string('description')
      table.decimal('init_energy', null, 3)
      table.decimal('max_energy', null, 3)
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.timestamp('updated_at').defaultTo(knex.fn.now())
      table.decimal('percent_use', null, 3)
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
		knex.schema.dropTable('monthly_energy_rule')
	])
};
