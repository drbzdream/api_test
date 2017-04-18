import bookshelf from '../bookshelf'

const energy_rule = bookshelf.Model.extend({
	tableName: 'energy_rule',
	hasTimestamps: true
})

export default energy_rule