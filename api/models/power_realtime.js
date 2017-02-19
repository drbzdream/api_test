import bookshelf from '../bookshelf'

const PowerRealtime = bookshelf.Model.extend({
	tableName: 'power_realtime',
	hasTimestamps: true
})

export default PowerRealtime