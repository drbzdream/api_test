import bookshelf from '../bookshelf'

const Light = bookshelf.Model.extend({
	tableName: 'lightDB',
	hasTimestamps: true
})

export default Light