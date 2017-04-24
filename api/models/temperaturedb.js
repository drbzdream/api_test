import bookshelf from '../bookshelf'

const Temperature = bookshelf.Model.extend({
	tableName: 'temperatureDB',
	hasTimestamps: true
})

export default Temperature