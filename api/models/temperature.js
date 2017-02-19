import bookshelf from '../bookshelf'

const Temperature = bookshelf.Model.extend({
	tableName: 'temperature',
	hasTimestamps: true
})

export default Temperature