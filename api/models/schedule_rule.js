import bookshelf from '../bookshelf'

const schedule_rule = bookshelf.Model.extend({
	tableName: 'schedule_rule',
	hasTimestamps: true
})

export default schedule_rule