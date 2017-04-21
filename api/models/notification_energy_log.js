import bookshelf from '../bookshelf'

const notification_energy_log = bookshelf.Model.extend({
	tableName: 'notification_energy_log',
	hasTimestamps: true
})

export default notification_energy_log
