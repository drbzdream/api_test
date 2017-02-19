import bookshelf from '../bookshelf'

const Room1 = bookshelf.Model.extend({
	tableName: 'room1',
	hasTimestamps: true
})

export default Room1