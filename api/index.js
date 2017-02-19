import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import {
	Light,
	PowerRealtime,
	Temperature,
	Room1,
	Room2
} from './models'

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
		PowerRealtime.forge().orderBy('id', 'DESC').fetchAll().then((collection) => {
			let x = [...collection.toJSON()]
			x.splice(10)
			x.sort((a, b) => (a.id - b.id))
			socket.emit('power_realtime', x)
		})
	},3000)
})

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

