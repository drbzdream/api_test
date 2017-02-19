import bookshelf from '../bookshelf'

const Light = bookshelf.Model.extend({
	tableName: 'light',
	hasTimestamps: true
})

export default Light