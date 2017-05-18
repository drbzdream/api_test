import bookshelf from '../bookshelf'

const monthly_energy_rule = bookshelf.Model.extend({
	tableName: 'monthly_energy_rule',
	hasTimestamps: true
})

export default monthly_energy_rule