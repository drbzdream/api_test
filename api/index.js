import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import {
	Light,
	PowerRealtime,
	EnergyRealtime,
	Temperature,
	Room1,
	Room2,
	schedule_rule,
	energy_rule,
	notification_schedule_log,
	notification_energy_log,
	DataRealtime,
	DataRealtime2,
	monthly_energy_rule,
	power_factor
} from './models'

// MQTT
import mqtt from 'mqtt'
import Moment from 'moment'
import { extendMoment } from 'moment-range'

import config from './config'
import configtemp from './configtemp'

const client = mqtt.connect(config.mqtt)
const moment = extendMoment(Moment)
const clienttemp = mqtt.connect(configtemp.mqtt)

const elec_cost = 4.4217


const app = express()
app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE')
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

const PORT = process.env.PORT || 9090
const server = app.listen(PORT, () => {
  console.log('Production Express server API running at localhost:' + PORT)
})

const io = require('socket.io').listen(server)

io.on('connect', function(socket) {
	setInterval(() => {
		
		// realtime power
		DataRealtime2.forge().orderBy('id', 'DESC').fetchAll().then((collection) => {
			let dataschedule = collection.toJSON()
			let x = dataschedule.filter((data2) => data2.room === '202')
			x.splice(10)
			x.sort((a, b) => (a.id - b.id))
			socket.emit('datap', x)
		})

		// realtime energy
		DataRealtime.forge().orderBy('id', 'DESC').fetchAll().then((collection) => {
			let dataschedule = collection.toJSON()
			let y = dataschedule.filter((data2) => data2.room === '202')
			y.splice(10)
			y.sort((a, b) => (a.id - b.id))
			socket.emit('datae', y)
		})

		//  Sensor 2 device (realtime power)
		// let result = {}
		// DataRealtime2.forge().orderBy('id', 'DESC').fetchAll().then((collection) => {
		// 	let dataschedule1 = collection.toJSON()
		// 	let y = dataschedule1.filter((data) => data.room === '202')
		// 	y.splice(10)
		// 	y.sort((a, b) => (a.id - b.id))
		// 	result.Room202 = y
		// 	// res.json(y)
		// 	DataRealtime2.forge().orderBy('id', 'DESC').fetchAll().then((collection2) => {
		// 		let dataschedule2 = collection2.toJSON()
		// 		let z = dataschedule2.filter((data2) => data2.room === '203')
		// 		z.splice(10)
		// 		z.sort((a, b) => (a.id - b.id))
		// 		// res.json(z)
		// 		result.Room203 = z
		// 		// res.json(result)
		// 		let room202 = result.Room202
		// 		let room203 = result.Room203
		// 		let data = room202.map((value, index) => ({
		// 			name: value.created_at,
		// 			Room202: value.data_value,
		// 			Room203: room203[index].data_value
		// 		}))
		// 		// console.log(data)
		// 		socket.emit('realtime2d', data)
		// 	})
		// })

	},1000)
})

// query data from history (resource page)
app.get('/data', (req, res) => {
	let { room, day } = req.query
	room = room || '202'
	day = day || '2015-02-28'
	let result = {}
	if(room == '202'){
		Room1.forge({ day: day }).fetch().then((data) => {
			if(data == null){
				res.json({})
			} else {
				result.room = data.toJSON()
				Light.forge({ room: room, day: day }).fetch().then((data2) => {
					if(data2 == null){
						res.json({})
					} else {
						result.light = data2.toJSON()
						Temperature.forge({ room: room, day: day }).fetch().then((data3) => {
							if(data3 == null){
								res.json({})
							} else {
								// console.log(data3)
								result.temperature = data3.toJSON()
								res.json(result)
							}
						})
					}
				})
			}
		})
	} else if(room == '203'){
		Room2.forge({ day: day }).fetch().then((data) => {
			if(data == null){
				res.json({})
			} else {
				result.room = data.toJSON()
				Light.forge({ room: room, day: day }).fetch().then((data2) => {
					if(data2 == null){
						res.json({})
					} else {
						result.light = data2.toJSON()
						Temperature.forge({ room: room, day: day }).fetch().then((data3) => {
							if(data3 == null){
								res.json({})
							} else {
								result.temperature = data3.toJSON()
								res.json(result)
							}
						})
					}
				})
			}
		})
	}
})

// get data 2 sensor from main graph
app.get('/energyshow', (req, res) => {
	// let { rangetime } = req.body
	// let { day } = req.body
	// let day = day || '2015-02-14'
	let result = {}
	let data = {}

	Room1.forge().orderBy('id', 'DESC').fetch().then((data1) => {
		if(data == null){
			console.log('err')
		} else {
			result.room202 = data1.toJSON()
			Room2.forge().orderBy('id', 'DESC').fetch().then((data2) => {
				if(data == null){
					console.log('err')
				} else {
					result.room203 = data2.toJSON()
					// res.json(result)

					let r202 = { ...result.room202 }
					let r203 = { ...result.room203 }
					delete r202['room']
					delete r202['day']
					delete r202['id']
					// delete r202['total']
					delete r202['created_at']
					delete r202['updated_at']
					delete r203['room']
					delete r203['day']
					delete r203['id']
					// delete r203['total']
					delete r203['created_at']
					delete r203['updated_at']
					let name = Object.keys(r202)
					let valueR202 = Object.values(r202)
					let valueR203 = Object.values(r203)

					let data = name.map((value, index) => ({
						name: value,
						Room202: valueR202[index],
						Room203: valueR203[index]
					}))
					res.json(data)

				}
			})

		}
	})	
})

// get summary data from 2 sensor
app.get('/summary', (req, res) => {
	// let { rangetime } = req.body
	// let { day } = req.body
	// let day = day || '2015-02-14'
	let result = {}
	let data = {}
	let sumEnergy = []
	Room1.forge().orderBy('id', 'DESC').fetch().then((data1) => {
		if(data == null){
			console.log('err')
		} else {
			result.room202 = data1.toJSON()
			Room2.forge().orderBy('id', 'DESC').orderBy('id', 'DESC').fetch().then((data2) => {
				if(data == null){
					console.log('err')
				} else {
					result.room203 = data2.toJSON()
					// res.json(result)

					let r202 = { ...result.room202 }
					let r203 = { ...result.room203 }
					delete r202['room']
					delete r202['day']
					delete r202['id']
					delete r202['total']
					delete r202['created_at']
					delete r202['updated_at']
					delete r203['room']
					delete r203['day']
					delete r203['id']
					delete r203['total']
					delete r203['created_at']
					delete r203['updated_at']
					let name = Object.keys(r202)
					let valueR202 = Object.values(r202)
					let valueR203 = Object.values(r203)

					let data = name.map((value, index) => ({
						name: value,
						Room202: valueR202[index],
						Room203: valueR203[index]
					}))


					var keys = Object.keys(data);
					var valueSum = Object.values(data)
					let value1 = 0
					let value2 = 0
					for (var i = 0; i < keys.length; i++)
					{
					    var key = keys[i];
					    value1 += valueSum[i].Room202
					    value2 += valueSum[i].Room203
					    // console.log('key: ' + key)
					    // console.log('valueR202: ' + value)
					}
					// console.log('Sum: ' + value)
					let avr1 = value1/(keys.length+1)
					let avr2 = value2/(keys.length+1)
					let cost1 = value1*elec_cost
					let cost2 = value2*elec_cost
					sumEnergy = [
						{name: 'Room202', value: cost1, total: value1, avr: avr1},
						{name: 'Room203', value: cost2, total: value2, avr: avr2}
					]

					// const data = [{name: 'Room202', value: 12503.04}, {name: 'Room203', value: 8503.04}]
					res.json(sumEnergy)

				}
			})

		}
	})	
})

// get summary data from 2 sensor (query)
app.get('/summaryroom', (req, res) => {
	let { day, room } = req.query
	// let { day } = req.body
	// console.log(day)
	day = day || '2015-02-28'	
	let result = {}
	let data = {}
	let sumEnergy = []
	Room1.forge({ day: day }).fetch().then((data1) => {
		if(data == null){
			console.log('err')
		} else {
			result.room202 = data1.toJSON()
			Room2.forge({ day: day }).fetch().then((data2) => {
				if(data == null){
					console.log('err')
				} else {
					result.room203 = data2.toJSON()
					// res.json(result)

					let r202 = { ...result.room202 }
					let r203 = { ...result.room203 }
					delete r202['room']
					delete r202['day']
					delete r202['id']
					delete r202['total']
					delete r202['created_at']
					delete r202['updated_at']
					delete r203['room']
					delete r203['day']
					delete r203['id']
					delete r203['total']
					delete r203['created_at']
					delete r203['updated_at']
					let name = Object.keys(r202)
					let valueR202 = Object.values(r202)
					let valueR203 = Object.values(r203)

					let data = name.map((value, index) => ({
						name: value,
						Room202: valueR202[index],
						Room203: valueR203[index]
					}))


					var keys = Object.keys(data);
					var valueSum = Object.values(data)
					let value1 = 0
					let value2 = 0
					for (var i = 0; i < keys.length; i++)
					{
					    var key = keys[i];
					    value1 += valueSum[i].Room202
					    value2 += valueSum[i].Room203
					    // console.log('key: ' + key)
					    // console.log('valueR202: ' + value)
					}
					// console.log('Sum: ' + value)
					let avr1 = value1/(keys.length+1)
					let avr2 = value2/(keys.length+1)
					let cost1 = value1*elec_cost
					let cost2 = value2*elec_cost
					sumEnergy.R202 = {name: 'Room202', value: cost1.toFixed(2), total: value1.toFixed(2), avr: avr1.toFixed(2)}
					sumEnergy.R203 = {name: 'Room203', value: cost2.toFixed(2), total: value2.toFixed(2), avr: avr2.toFixed(2)}
					if(room == '202') {
						res.json(sumEnergy.R202)
					} else if(room == '203') {
						res.json(sumEnergy.R203)
					} 


				}
			})

		}
	})	
})

// get schedule log 5th first order
app.get('/notischedulelog', (req, res) => {
	notification_schedule_log.forge().orderBy('id', 'DESC').fetchAll().then((data) => {
		let x = [...data.toJSON()]
		x.splice(5)
		x.sort((a, b) => (a.id - b.id))
		res.json(x)
	})	
})

// get energy log 5th first order
app.get('/notienergylog', (req, res) => {
	notification_energy_log.forge().orderBy('id', 'DESC').fetchAll().then((data) => {
		let x = [...data.toJSON()]
		x.splice(5)
		x.sort((a, b) => (a.id - b.id))
		res.json(x)

	})	
})

// get energy data from 1 sensor 
app.get('/realtimedata1', (req, res) => {
	DataRealtime.forge().orderBy('id', 'DESC').fetchAll().then((collection) => {
			let dataschedule = collection.toJSON()
			let y = dataschedule.filter((data2) => data2.room === '202')
			y.splice(10)
			y.sort((a, b) => (a.id - b.id))
			res.json(y)
		})
})

// get energy data from 2 sensor 
app.get('/realtimedata2', (req, res) => {
	let result = {}
	DataRealtime.forge().orderBy('id', 'DESC').fetchAll().then((collection) => {
			let dataschedule1 = collection.toJSON()
			let y = dataschedule1.filter((data) => data.room === '202')
			y.splice(10)
			y.sort((a, b) => (a.id - b.id))
			result.Room202 = y
			// res.json(y)
			DataRealtime.forge().orderBy('id', 'DESC').fetchAll().then((collection2) => {
				let dataschedule2 = collection2.toJSON()
				let z = dataschedule2.filter((data2) => data2.room === '203')
				z.splice(10)
				z.sort((a, b) => (a.id - b.id))
				// res.json(z)
				result.Room203 = z
				// res.json(result)
				let room202 = result.Room202
				let room203 = result.Room203
				let data = room202.map((value, index) => ({
					name: value.created_at,
					Room202: room202[index].data_value,
					Room203: room203[index].data_value
				}))
				// console.log(data)
				res.json(data)
			})
		})
})


// get power data from 1 sensor 
app.get('/realtimepower1', (req, res) => {
	DataRealtime2.forge().orderBy('id', 'DESC').fetchAll().then((collection) => {
			let dataschedule = collection.toJSON()
			let y = dataschedule.filter((data2) => data2.room === '202')
			y.splice(10)
			y.sort((a, b) => (a.id - b.id))
			res.json(y)
		})
})


// get power data from 2 sensor 
app.get('/realtimepower2', (req, res) => {
	let result = {}
	DataRealtime2.forge().orderBy('id', 'DESC').fetchAll().then((collection) => {
			let dataschedule1 = collection.toJSON()
			let y = dataschedule1.filter((data) => data.room === '202')
			y.splice(10)
			y.sort((a, b) => (a.id - b.id))
			result.Room202 = y
			// res.json(y)
			DataRealtime2.forge().orderBy('id', 'DESC').fetchAll().then((collection2) => {
				let dataschedule2 = collection2.toJSON()
				let z = dataschedule2.filter((data2) => data2.room === '203')
				z.splice(10)
				z.sort((a, b) => (a.id - b.id))
				// res.json(z)
				result.Room203 = z
				// res.json(z)
				let room202 = result.Room202
				let room203 = result.Room203
				let data = room202.map((value, index) => ({
					name: value.created_at,
					Room202: value.data_value,
					Room203: room203[index].data_value
				}))
				// console.log(data)
				res.json(data)
			})
		})
})




// serial port //


// get all data in schedule db
app.get('/schedule', (req, res) => {
	schedule_rule.forge().fetchAll().then((data) => {
		if(data == null){
			res.json({})
		} else {
			res.json(data.toJSON())
		}
	})
})

// save rule by ID from schedule rule table in db
app.post('/schedule', (req, res) => {
	const { room, description, day, starttime, endtime } = req.body
	// console.log("body"+req.body)
	schedule_rule.forge({ room, description, day, starttime, endtime }).save().then((schedule) => {
		res.json(schedule)
	}).catch((err) => {
		res.sendStatus(403)
	})

})

// delete rule by ID from schedule rule table in db
app.delete('/schedule/:id', (req, res) => {
	let { id } = req.params
	schedule_rule.forge({ id }).destroy().then((user) => {
		res.sendStatus(200)
	}).catch((err) => {
		res.sendStatus(404)
	})
})

// update rule by ID from schedule rule table in db
app.patch('/schedule/:id', (req, res) => {
	let { id } = req.params
	const { room, description, day, starttime, endtime } = req.body
	schedule_rule.forge({ id }).fetch({ require: true }).then((user) => {
		user.save({ room, description, day, starttime, endtime }).then((data) => {
			res.json(data)
		}).catch((err) => {
			res.sendStatus(403)
		})
	}).catch(() => {
		res.sendStatus(404)
	})
})

// get rule by ID from schedule rule table in db
app.get('/schedule/:id', (req, res) => {
	let { id } = req.params
	schedule_rule.forge({ id }).fetch().then((user) => {
		res.json(user.toJSON())
		// res.sendStatus(200)
	}).catch((err) => {
		res.sendStatus(403)
	})
})

// get all energy rule 
app.get('/energyrule', (req, res) => {
	monthly_energy_rule.forge().fetchAll().then((data) => {
		if(data == null){
			res.json({})
		} else {
			res.json(data.toJSON())
		}
	})
})

// save energy rule in db
app.post('/energyrule', (req, res) => {
	const { room, description, init_energy ,maxenergy, percent_use } = req.body
	// console.log("body"+req.body)
	monthly_energy_rule.forge({ room, description, init_energy, maxenergy, percent_use }).save().then((schedule) => {
		res.json(schedule)
	}).catch((err) => {
		res.sendStatus(403)
	})
})

// delete rule by ID from energy rule table in db
app.delete('/energyrule/:id', (req, res) => {
	let { id } = req.params
	monthly_energy_rule.forge({ id }).destroy().then((user) => {
		res.sendStatus(200)
	}).catch((err) => {
		res.sendStatus(403)
	})
})

// update rule by ID from energy rule table in db
app.patch('/energyrule/:id', (req, res) => {
	let { id } = req.params
	const { room, description, maxenergy  } = req.body
	monthly_energy_rule.forge({ id }).fetch({ require: true }).then((user) => {
		user.save({ description, maxenergy }).then((data) => {
			res.json(data)
		}).catch((err) => {
			res.sendStatus(403)
		})
	}).catch(() => {
		res.sendStatus(404)
	})
})

// get rule by ID from energy rule table in db
app.get('/energyrule/:id', (req, res) => {
	let { id } = req.params
	monthly_energy_rule.forge({ id }).fetch().then((user) => {
		res.json(user.toJSON())
		// res.sendStatus(200)
	}).catch((err) => {
		res.sendStatus(403)
	})
})

// power factor
app.get('/powerfactor', (req, res) => {
	power_factor.forge().fetchAll().then((data) => {
		res.json(data.toJSON())
	})
})


// projection electric cost (3 month)
app.get('/infoenergyuse/:id', (req, res) => {
	let { id } = req.params
	// const { room } = req.body
	let room = 202

	let limit
	let init1, init2, init3
	let result = []
	let result1 = []
	let result2 = []
	let result3 = []
	let sum = 0
	let average = 0

	let ch = 0

	monthly_energy_rule.forge({ id }).fetch().then((collection) => {
		let temp = collection.toJSON()
		limit = temp.maxenergy
		init1 = temp.init_energy
		room = (temp.room).toString() 

		DataRealtime.forge().orderBy('id', 'DESC').fetchAll().then((data) => {
			let data1 = data.toJSON()
			let y = data1.filter((data) => data.room === room)
			y.map((rule) => {
				// console.log('test: ' + moment(rule.created_at).month())
				let timeDiff = moment.duration(moment().set('date', 1) - moment(rule.created_at)).asMonths()
				// console.log(timeDiff) ค่าสูงสุดของเดือนก่อนหน้าเท่ากับค่า init ของเดือนต่อมา 
				if(ch == 0 && 3 >= timeDiff && timeDiff > 2) {
					ch = 1
					init2 = rule.data_value
					// console.log('init2: ' + init2)
				}

				if(2 >= timeDiff && timeDiff > 1) {
					if(result1.length == 0){
						result1.push(rule)
						init3 = rule.data_value
						// console.log('init3: ' + init3)
					} else {
						let check_day = moment(rule.created_at).format('MMMM Do YYYY')
						let data_day = result1[result1.length - 1]
						let saved_day = moment(data_day.created_at).format('MMMM Do YYYY')
						if(check_day != saved_day) {
							result1.push(rule)
						}
					}
					 // ถ้าเป็นเดือนพค คือ เดือนมีนา

				} else if(1 >= timeDiff && timeDiff > 0) {
					// result2.push(rule)
					if(result2.length == 0){
						result2.push(rule)
					} else {
						let check_day = moment(rule.created_at).format('MMMM Do YYYY')
						let data_day = result2[result2.length - 1]
						let saved_day = moment(data_day.created_at).format('MMMM Do YYYY')
						if(check_day != saved_day) {
							result2.push(rule)
		
						}
					}

					// ถ้าเป็นเดือนพค คือ เดือนเมษา

				} else if(0 >= timeDiff && timeDiff > -1) {
					if(result3.length == 0){
						result3.push(rule)
					} else {
						let check_day = moment(rule.created_at).format('MMMM Do YYYY')
						// console.log('check_day: ' + check_day)
						let data_day = result3[result3.length - 1]
						let saved_day = moment(data_day.created_at).format('MMMM Do YYYY')
						// console.log('save_day: ' + saved_day)
						if(check_day != saved_day) {
							result3.push(rule)

						}
					}

					// ถ้าเป็นเดือนพค คือ เดือนพค
				}
				sum = result3[result3.length - 1] - result3[0]
				average = sum/(result3.length)
			}) 

			let data_1 = result1.map((value, index) => ({
				id: value.id,
				name: value.created_at,
				energy: value.data_value - init2,
				projection: value.data_value - init2,
				max: limit
			}))

			let data_2 = result2.map((value, index) => ({
				id: value.id,
				name: value.created_at,
				energy: value.data_value - init3,
				projection: value.data_value - init3,
				max: limit
			}))


			data_1.sort((a, b) => (a.id - b.id))
			data_2.sort((a, b) => (a.id - b.id))
			result3.sort((a, b) => (a.id - b.id))
			

			let latest_data = result3[result3.length - 1]
			let range_month = moment.duration(moment(latest_data.created_at) - moment().set('date', 1)).asDays()
			let start_dayset = moment(latest_data.created_at).add(1, 'day')
			let end_dayset = moment(latest_data.created_at).endOf('month').add(1, 'day')
			// console.log('1: ' +start_dayset)
			// console.log('2: ' + end_dayset)
			let day_add

			while(start_dayset.format('MMMM Do YYYY') != end_dayset.format('MMMM Do YYYY')) {
				day_add = start_dayset.format()
				let data_add = {
					id: 0,
					data_value: result3[result3.length - 1].data_value + average,
					created_at: day_add

				}
				result3.push(data_add)

				// console.log(result3[result3.length - 1])
				start_dayset = moment(start_dayset).add(1, 'day')
				// console.log('3: ' + start_dayset)
			}
			
			


			let data_3 = result3.map((value, index) => ({
				id: value.id,
				name: value.created_at,
				energy: value.data_value - init1,
				projection: value.data_value - init1,
				max: limit
			}))



			for (var i = 0; i < data_3.length; i++) {
				if(data_3[i].id == 0){
					data_3[i].energy = 0
				}
			}


			result = (data_1.concat(data_2)).concat(data_3)
			// result = data_3
			
			if(result == null){
				res.json({})
			} else {
				res.json(result)
			}
		})


	})
	
	
})


// test api database
app.get('/test', (req, res) => {
	DataRealtime.forge().orderBy('id','DESC').fetchAll().then((data) => {
		if(data == null){
			res.json({})
		} else {
			res.json(data.toJSON())
		}
	})
})






// MQTT Important

let info_pf = {
  			real_power: 0,
  			voltage_value: 0,
  			current_value: 0
  		}


client.on('connect', () => {
	client.subscribe('#')
	// client.publish('/b', (new Date()).toString())

})
 
client.on('message', (topic, message) => {
	// message is Buffer 
  let msg = message.toString()
  let top = topic.toString()

  // console.log("Topic: " + top)
  // console.log("Message: " + msg)
  var split_top = top.split('/')
  // console.log(split_top)
  let check_noti  = JSON.parse(message)
  // console.log(check_schedule.time)
  let current = moment(check_noti.time)



  if(split_top[1] == 'energy') {
  	// Check Notificaton
  	let infoe = JSON.parse(msg);

  	DataRealtime.forge({
			room: split_top[2],
			data_value: infoe.data_value/1000,
	}).save()

  


	  // schedule
	  schedule_rule.forge().fetchAll().then((collection) => {
		  	let dataschedule = collection.toJSON()
		  	// console.log(dataschedule)
		  	let x = dataschedule.filter((data) => data.room === split_top[2] && data.day === current.format('ddd'))
		  	// console.log(x)
		  	x.map((rule) => {
		  		// console.log(rule)
		  		var startDate = rule.starttime.split('.') 
		  		// console.log(startDate)
		  		var endDate = rule.endtime.split('.') 
		  		let start = moment({ h: startDate[0], m: startDate[1] })
				let end = moment({ h: endDate[0], m: endDate[1] })
				const range = moment.range(start, end)
				
				if (range.contains(current)) {

					notification_schedule_log.forge({day: rule.day, room: rule.room, starttime: rule.starttime, endtime: rule.endtime})
					.orderBy('created_at','DESC').fetch().then((data) => {
						// console.log('notis: '+ data)
						if(data == null){
							// console.log('No data in log')
							notification_schedule_log.forge({
								room: rule.room,
								type: 'schedule',
								description: rule.description,
								day: rule.day,
								starttime: rule.starttime,
								endtime: rule.endtime
							}).save()
							io.emit('noti', rule)
						} else {
							console.log('Have data in log data')
							let datalog = data.toJSON()
							let notilog_time = moment(datalog.created_at)
						  	let timeDiff = moment.duration(current - notilog_time).asMinutes();
						  	// console.log('schedule: ' + timeDiff)
						  	if(timeDiff >= 5 ) {
						  		io.emit('noti', rule)
						  		// console.log('log update')
						  		notification_schedule_log.forge({
									room: datalog.room,
									type: 'schedule',
									description: datalog.description,
									day: datalog.day,
									starttime: datalog.starttime,
									endtime: datalog.endtime
								}).save()
						  	} 
						}
					})
				}
		  	})
		})


	  // monthly energy rule 
	  monthly_energy_rule.forge({room: split_top[2]}).fetch().then((collection) => {
	  	let dataenergy = collection.toJSON()
	  	if(dataenergy != null){
	  		if (dataenergy.init_energy == 0) {

	  			monthly_energy_rule.forge({room: dataenergy.room}).fetch().then((update) => {
		  			update.save({ 
						init_energy: infoe.data_value/1000,
						updated_at: moment().set('date', 1)
		  			})
		  		})

	  		} else {
	  			let dayDB = moment(dataenergy.updated_at)
	  			let DayDiff = moment.duration(current - dayDB).asDays();
	  			let energy_use = infoe.data_value - dataenergy.init_energy
	  			let remain = dataenergy.maxenergy - energy_use
	  			let percentremainder = energy_use/dataenergy.maxenergy*100
	  			if(DayDiff > 30) {
	  				monthly_energy_rule.forge({room: dataenergy.room}).fetch().then((update) => {
			  			update.save({ 
			  				room: dataenergy.room,
							init_energy: infoe.data_value/1000,
							description: dataenergy.description,
							maxenergy: dataenergy.maxenergy,
							percent_use: 0,
							updated_at: moment().set('date', 1)
			  			})
			  		})
	  			} else {
	  				monthly_energy_rule.forge({room: dataenergy.room}).fetch().then((update) => {
			  			update.save({ 
							percent_use: percentremainder
			  			})
			  		})
	  				if(remain <= 0){
	  					notification_energy_log.forge({room: dataenergy.room}).fetch().then((data) => {
							if(data == null) {
								// console.log('save log')
								notification_energy_log.forge({
									room: dataenergy.room,
									type: 'energy',
									description: dataenergy.description,
									maxenergy: dataenergy.maxenergy,
								}).save()

								io.emit('noti2', dataenergy)
							} else {
								// console.log('check time')
								let datalog = data.toJSON()
								let notilog_time = moment(datalog.updated_at)
								let timeDiff = moment.duration(current - notilog_time).asMinutes()
								// console.log('mqtt ' + current.format('MMMM Do YYYY, h:mm:ss a'))
							    // console.log('noti ' + notilog_time.format('MMMM Do YYYY, h:mm:ss a'))
							  	// console.log('energy: ' + timeDiff)
								if(timeDiff >= 5 ) {
							  		io.emit('noti2', dataenergy)
							  		console.log('log update')
							  		notification_energy_log.forge({room: dataenergy.room}).fetch().then((update) => {
							  			update.save()
							  		})
							  	} 
							}
						})	
	  				}
	  			}
	  		}
		}

	  })

	  //  // energy rule 
	 //  energy_rule.forge({room: split_top[2]}).fetch().then((collection) => {
	 //  	let dataenergy = collection.toJSON()
	 //  	if(dataenergy != null){
		// 	if(check_noti.power >= dataenergy.maxenergy){
		// 		// io.emit('noti2', dataenergy)
		// 		notification_energy_log.forge({room: dataenergy.room}).fetch().then((data) => {
		// 			if(data == null) {
		// 				// console.log('save log')
		// 				notification_energy_log.forge({
		// 					room: dataenergy.room,
		// 					type: 'energy',
		// 					description: dataenergy.description,
		// 					maxenergy: dataenergy.maxenergy
		// 				}).save()

		// 				io.emit('noti2', dataenergy)
		// 			} else {
		// 				// console.log('check time')
		// 				let datalog = data.toJSON()
		// 				let notilog_time = moment(datalog.updated_at)
		// 				let timeDiff = moment.duration(current - notilog_time).asMinutes();
		// 				// console.log('mqtt ' + current.format('MMMM Do YYYY, h:mm:ss a'))
		// 			    // console.log('noti ' + notilog_time.format('MMMM Do YYYY, h:mm:ss a'))
		// 			  	// console.log('energy: ' + timeDiff)
		// 				if(timeDiff >= 5 ) {
		// 			  		io.emit('noti2', dataenergy)
		// 			  		console.log('log update')
		// 			  		notification_energy_log.forge({room: dataenergy.room}).fetch().then((update) => {
		// 			  			update.save()
		// 			  		})
		// 			  	} 
		// 			}
		// 		})	
		// 	}
		// }

	 //  })


  } else if(split_top[1] == 'powerfactor') {
  		let infop = JSON.parse(msg)


  		if(split_top[2] == 'current'){
			info_pf.current_value = infop.current_value
		} else if(split_top[2] == 'voltage'){
			info_pf.voltage_value = infop.voltage_value
		} else if(split_top[2] == 'power'){
			info_pf.real_power = infop.power_value

			DataRealtime2.forge({
				room: split_top[3],
				data_value: infop.power_value,
			}).save()
		}


		if(info_pf.real_power != 0 && info_pf.voltage_value != 0 && info_pf.current_value != 0) {
			let apparent_power = (1.732*info_pf.voltage_value*info_pf.current_value)/1000 // kVA
	    	let pf = (info_pf.real_power/1000)/apparent_power

	    	console.log('power = ' + info_pf.real_power + ', voltage = ' + info_pf.voltage_value + ', current = ' + info_pf.current_value)
	    	console.log('PF:apparent_power = ' + apparent_power)
	    	console.log('PF:pf = ' + pf)



	    	power_factor.forge({room: split_top[3]}).fetch().then((update) => {
	    		if(update == null) {
	    			power_factor.forge({
						room: split_top[3],
						description: 'PFvalue',
						powerfactor_value: pf,
						real_power: info_pf.real_power/1000,
						voltage_value: info_pf.voltage_value,
						current_value: info_pf.current_value,
						apparent_power: apparent_power
					}).save()

	    		} else {
	    			update.save({ 
						powerfactor_value: pf,
						real_power: info_pf.real_power/1000,
						voltage_value: info_pf.voltage_value,
						current_value: info_pf.current_value,
						apparent_power: apparent_power
	  				})

	    		}
	  			
	  		})

		}


	} 

})











