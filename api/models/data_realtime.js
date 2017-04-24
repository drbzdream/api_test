import bookshelf from '../bookshelf'

const DataRealtime = bookshelf.Model.extend({
	tableName: 'data_realtime'
})

export default DataRealtime