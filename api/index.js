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
	energy_rule
} from './models'

// MQTT
import mqtt from 'mqtt'
import config from './config'



const client = mqtt.connect(config.mqtt)


import moment from 'moment'

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
		EnergyRealtime.forge().orderBy('id', 'DESC').fetchAll().then((collection) => {
			let x = [...collection.toJSON()]
			x.splice(10)
			x.sort((a, b) => (a.id - b.id))
			socket.emit('energy_realtime', x)
			// socket.emit('time_server', t_s)
			// socket.emit('count', count)
		})

		PowerRealtime.forge().orderBy('id', 'DESC').fetchAll().then((collection) => {
			let y = [...collection.toJSON()]
			y.splice(10)
			y.sort((a, b) => (a.id - b.id))
			socket.emit('power_realtime', y)
		})

	},5000)
})

// io.on('connect', function(socket) {
// 	socket.emit('time_server', t_s)
// })

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
							} else {
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


// var SerialPort = require('serialport');

// var port = new SerialPort('/dev/tty.cpj01-DevB', {
// 	parser: SerialPort.parsers.byteLength(7),
// 	baudRate: 9600
// });



// // connect to serial port 
// port.on('open', function() {
// 	// set ip for active power sensor 
// 	port.write(new Buffer('\xB4\xC0\xA8\x01\x01\x00\x1E', 'ascii'), function(err) {
//     	if (err) return console.log('Error on write: ', err.message)
//     	// time = moment().format('h:mm:ss:ms a')
//     	console.log('Set IP Success!!!');
//     	console.log('---------------------------')
//   })


// });

// function read_energy(){
// 	t_g1 = moment()
// 	count++;
// 	// console.log("count:" + count)
// 	port.write(new Buffer('\xB3\xC0\xA8\x01\x01\x00\x1D', 'ascii'))
// }

// function read_power(){
// 	port.write(new Buffer('\xB2\xC0\xA8\x01\x01\x00\x1C', 'ascii'))
// }

// function read_current(){
// 	port.write(new Buffer('\xB1\xC0\xA8\x01\x01\x00\x1B', 'ascii'))
// }

// function read_voltage(){
// 	port.write(new Buffer('\xB0\xC0\xA8\x01\x01\x00\x1A', 'ascii'))
// }

// // open errors will be emitted as an error event
// port.on('error', function(err) {
//   console.log('Error: ', err.message);
// })

// port.on('data', function (data) {
//   // console.log('Data: ' + data.toString('hex'))
//   if(data.toString('hex') == 'a40000000000a4'){
//   	setInterval(read_power, 1000)
//   	setInterval(read_current, 4000)
//   	setInterval(read_voltage, 5000)
//   	setInterval(read_energy, 10000)
//   }
//   	var str = data.toString('hex')
//   	var str_split = str.match(/.{1,2}/g)
//   	// console.log(str_split)

//   	// energy
// 	if(str_split[0] == 'a3'){ 
// 		var energy = str_split[1] + str_split[2] + str_split[3]
// 		var value_energy = parseInt(energy, 16)
// 		console.log('Count: ' + count +', energy_value: '+ value_energy + ' Wh')


// 		// console.log(new Date())
// 		//var time = new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds()
// 		// var time = moment().format('h:mm:ss:ms a')
// 		t_g2 = moment()
// 		var info = {
// 			value_energy: value_energy,
// 			T_g1: t_g1,
// 			T_g2: t_g2,
// 			count: count
// 		}
// 		client.publish('test/res10000ms', JSON.stringify(info))

// 		// EnergyRealtime.forge({
// 		// 	energy_value: value_energy
// 		// }).save()
// 	}

// 	// power
// 	if(str_split[0] == 'a2'){
// 		var power = str_split[1] + str_split[2]
// 		var value_power = parseInt(power, 16)
// 		console.log(value_power + ' W')

		
// 		EnergyRealtime.forge({
// 			energy_value: value_power
// 		}).save()

// 	}

// 	// current
// 	if(str_split[0] == 'a1'){
// 		var current1 = str_split[2]
// 		var current2 = str_split[3]
// 		var value_ctemp1 = parseInt(current1, 16)
// 		var value_ctemp2 = parseInt(current2, 16)
// 		if(value_ctemp2 < 10){
// 			value_ctemp2 = value_ctemp2/10
// 		}else if(value_ctemp2 < 100){
// 			value_ctemp2 = value_ctemp2/100
// 		}else{
// 			value_ctemp2 = value_ctemp2/1000
// 		}
// 		var value_current = value_ctemp1 + value_ctemp2
// 		console.log(value_current + ' A')

// 		var timestemp = moment().format("hh:mm:ss")

// 		// PowerRealtime.forge({
// 		// 	power_value: value_current,
// 		// 	timestemp: timestemp
// 		// }).save()
// 	}

// 	// voltage
// 	if(str_split[0] == 'a0'){
// 		var voltage1 = str_split[1] + str_split[2]
// 		var voltage2 = str_split[3]
// 		var value_vtemp1 = parseInt(voltage1, 16)
// 		var value_vtemp2 = parseInt(voltage2, 16)
// 		if(value_vtemp2 < 10){
// 			value_vtemp2 = value_vtemp2/10
// 		}else if(value_ctemp2 < 100){
// 			value_vtemp2 = value_vtemp2/100
// 		}else{
// 			value_vtemp2 = value_vtemp2/1000
// 		}
// 		var value_voltage = value_vtemp1 + value_vtemp2
// 		console.log(value_voltage + ' V')

// 	}

// });


// app.get('/schedule', (req, res) => {
// 	schedule_rule.forge().fetchAll().then((collection) => {
// 		return collection.toJSON()
// 	})
// })

app.get('/schedule', (req, res) => {
	schedule_rule.forge().fetchAll().then((data) => {
		if(data == null){
			res.json({})
		} else {
			res.json(data.toJSON())
		}
	})
})

app.post('/schedule', (req, res) => {
	const { room, description, day, starttime, endtime } = req.body
	console.log("body"+req.body)
	schedule_rule.forge({ room, description, day, starttime, endtime }).save().then((schedule) => {
		res.json(schedule)
	}).catch((err) => {
		res.sendStatus(403)
	})
})

app.delete('/schedule/:id', (req, res) => {
	let { id } = req.params
	schedule_rule.forge({ id }).destroy().then((user) => {
		res.sendStatus(200)
	}).catch((err) => {
		res.sendStatus(403)
	})
})

app.get('/schedule/:id', (req, res) => {
	let { id } = req.params
	schedule_rule.forge({ id }).fetch().then((user) => {
		res.json(user.toJSON())
		res.sendStatus(200)
	}).catch((err) => {
		res.sendStatus(403)
	})
})

app.get('/energyrule', (req, res) => {
	energy_rule.forge().fetchAll().then((data) => {
		if(data == null){
			res.json({})
		} else {
			res.json(data.toJSON())
		}
	})
})

app.post('/energyrule', (req, res) => {
	const { room, description, maxenergy } = req.body
	console.log("body"+req.body)
	energy_rule.forge({ room, description, maxenergy }).save().then((schedule) => {
		res.json(schedule)
	}).catch((err) => {
		res.sendStatus(403)
	})
})

app.delete('/energyrule/:id', (req, res) => {
	let { id } = req.params
	energy_rule.forge({ id }).destroy().then((user) => {
		res.sendStatus(200)
	}).catch((err) => {
		res.sendStatus(403)
	})
})

app.get('/energyrule/:id', (req, res) => {
	let { id } = req.params
	energy_rule.forge({ id }).fetch().then((user) => {
		res.json(user.toJSON())
		res.sendStatus(200)
	}).catch((err) => {
		res.sendStatus(403)
	})
})

app.get('/test', (req, res) => {
	PowerRealtime.forge().fetchAll().then((data) => {
		if(data == null){
			res.json({})
		} else {
			res.json(data.toJSON())
		}
	})
})

// PowerRealtime.forge({
// 		// 	power_value: value_current,
// 		// 	timestemp: timestemp
// 		// }).save()


// app.get('/light', (req, res) => {
// 	let { room, day } = req.query
// 	room = room || '202'
// 	day = day || '2015-02-28'
// 	Light.forge({ room: room, day: day }).fetch().then((data) => {
// 		if(data == null){
// 			res.json({})
// 		} else {
// 			res.json(data.toJSON())
// 		}
// 	})
// })

// app.get('/temperature', (req, res) => {
// 	let { room, day } = req.query
// 	room = room || '202'
// 	day = day || '2015-02-28'
// 	Temperature.forge({ room: room, day: day }).fetch().then((data) => {
// 		if(data == null){
// 			res.json({})
// 		} else {
// 			res.json(data.toJSON())
// 		}
// 	})
// })


// MQTT Important

client.on('connect', () => {
	client.subscribe('#')
	// client.publish('/b', (new Date()).toString())
})
 
client.on('message', (topic, message) => {
	// message is Buffer 
  let msg = message.toString()
  let top = topic.toString()

  var info_energy = JSON.parse(message)

  // console.log("Topic: " + top)
  // console.log("Message: " + msg)

  // var receive_time = moment() // t_s
  // t_s = receive_time
  // var send_device_time = moment((JSON.parse(message)).T_g1)
  // var send_broker_time = moment((JSON.parse(message)).T_g2)

  // let timeDiff_device = moment.duration(send_broker_time - send_device_time, 'milliseconds')
  // let timeDiff_broker = moment.duration(receive_time - send_broker_time, 'milliseconds')
  // console.log("Send(device req&res): " + send_device_time.format('h:mm:ss:ms a'))
  // console.log("Send(broker req&res): " + receive_time.format('h:mm:ss:ms a'))
  // console.log("Receive: " + receive_time.format('h:mm:ss:ms a'))
  // console.log("Different(device to broker): " + timeDiff_device + ' ms')
  // console.log("Different(broker to server): " + timeDiff_broker + ' ms')
})

// client.on('connect', function () {
  // client.publish('dream/test', 'Success')
  // console.log('send mesg')
  // client.subscribe('#')
// })


// client.on('message', function (topic, message) {
  // message is Buffer 
  // let msg = message.toString()
  // let top = topic.toString()

  // var info_energy = JSON.parse(message)
  // console.log("Topic: " + top)
  // console.log("Message: " + msg)


  // var receive_time = moment()
  // var send_from_mqtt = moment((JSON.parse(message)).date_time)

// 2017-03-12T14:39:56.081Z
// 2017-03-12T18:39:56.081Z

  // var receive_time = moment('2017-03-12T14:39:56.081Z')
  // var send_from_mqtt = moment('2017-03-12T18:39:56.081Z')

  // var send =  moment(send_json)

  // var time_between = send.to(receive_time)
  // let timeDiff = moment.duration(receive_time - send_from_mqtt, 'milliseconds')
  // console.log("Send: " + send_from_mqtt.format('h:mm:ss:ms a'))
  // console.log("Receive: " + receive_time.format('h:mm:ss:ms a'))
  // console.log("Different: " + timeDiff + ' ms')

// })



