
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('room203', function(table){
      table.increments().primary()
      table.string('room')
      table.string('day')
      table.decimal('1:00', null, 3)
      table.decimal('2:00', null, 3)
      table.decimal('3:00', null, 3)
      table.decimal('4:00', null, 3)
      table.decimal('5:00', null, 3)
      table.decimal('6:00', null, 3)
      table.decimal('7:00', null, 3)
      table.decimal('8:00', null, 3)
      table.decimal('9:00', null, 3)
      table.decimal('10:00', null, 3)
      table.decimal('11:00', null, 3)
      table.decimal('12:00', null, 3)
      table.decimal('13:00', null, 3)
      table.decimal('14:00', null, 3)
      table.decimal('15:00', null, 3)
      table.decimal('16:00', null, 3)
      table.decimal('17:00', null, 3)
      table.decimal('18:00', null, 3)
      table.decimal('19:00', null, 3)
      table.decimal('20:00', null, 3)
      table.decimal('21:00', null, 3)
      table.decimal('22:00', null, 3)
      table.decimal('23:00', null, 3)
      table.decimal('0:00', null, 3)
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.timestamp('updated_at').defaultTo(knex.fn.now())
    })
  ])
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.dropTable('room203')
	])
};
