import bookshelf from '../bookshelf'

const Room2 = bookshelf.Model.extend({
	tableName: 'room2',
	hasTimestamps: true
})

export default Room2