import bookshelf from '../bookshelf'

const notification_schedule_log = bookshelf.Model.extend({
	tableName: 'notification_schedule_log',
	hasTimestamps: true
})

export default notification_schedule_log