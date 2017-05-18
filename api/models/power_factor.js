import bookshelf from '../bookshelf'

const power_factor = bookshelf.Model.extend({
	tableName: 'power_factor',
	hasTimestamps: true
})

export default power_factor