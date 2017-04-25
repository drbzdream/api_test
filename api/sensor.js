import mqtt from 'mqtt'
import config from './config'

const client = mqtt.connect(config.mqtt)

var SerialPort = require('serialport');

var port = new SerialPort('/dev/tty.cpj01-DevB', {
	parser: SerialPort.parsers.byteLength(7),
	baudRate: 9600
});

let infopower = {}
let infoenergy = {}

// connect to serial port 
port.on('open', function() {
	// set ip for active power sensor 
	port.write(new Buffer('\xB4\xC0\xA8\x01\x01\x00\x1E', 'ascii'), function(err) {
    	if (err) return console.log('Error on write: ', err.message)
    	// time = moment().format('h:mm:ss:ms a')
    	console.log('Set IP Success!!!');
    	console.log('---------------------------')
  })


});

function read_energy(){
	// console.log("count:" + count)
	port.write(new Buffer('\xB3\xC0\xA8\x01\x01\x00\x1D', 'ascii'))
}

function read_power(){
	port.write(new Buffer('\xB2\xC0\xA8\x01\x01\x00\x1C', 'ascii'))
}

function read_current(){
	port.write(new Buffer('\xB1\xC0\xA8\x01\x01\x00\x1B', 'ascii'))
}

function read_voltage(){
	port.write(new Buffer('\xB0\xC0\xA8\x01\x01\x00\x1A', 'ascii'))
}

// open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message);
})

port.on('data', function (data) {
  // console.log('Data: ' + data.toString('hex'))
  if(data.toString('hex') == 'a40000000000a4'){
  	setInterval(read_power, 4000)
  	// setInterval(read_current, 4000)
  	// setInterval(read_voltage, 5000)
  	setInterval(read_energy, 5000)
  }
  	var str = data.toString('hex')
  	var str_split = str.match(/.{1,2}/g)
  	// console.log(str_split)

  	// energy
	if(str_split[0] == 'a3'){ 
		var energy = str_split[1] + str_split[2] + str_split[3]
		var value_energy = parseInt(energy, 16)
		console.log(value_energy + 'Wh')
		// console.log('Count: ' + count +', energy_value: '+ value_energy + ' Wh')


		// console.log(new Date())
		//var time = new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds()
		// var time = moment().format('h:mm:ss:ms a')

		infoenergy = {
			data_value: value_energy,
			time: new Date()
		}

		client.publish('/energy/202', JSON.stringify(infoenergy))

		// EnergyRealtime.forge({
		// 	energy_value: value_energy
		// }).save()
	}

	// power
	if(str_split[0] == 'a2'){
		var power = str_split[1] + str_split[2]
		var value_power = parseInt(power, 16)
		console.log(value_power + ' W')

		infopower = {
			data_value: value_power,
			time: new Date()
		}

		client.publish('/power/202', JSON.stringify(infopower))
		// EnergyRealtime.forge({
		// 	energy_value: value_power
		// }).save()

	}

	// current
	if(str_split[0] == 'a1'){
		var current1 = str_split[2]
		var current2 = str_split[3]
		var value_ctemp1 = parseInt(current1, 16)
		var value_ctemp2 = parseInt(current2, 16)
		if(value_ctemp2 < 10){
			value_ctemp2 = value_ctemp2/10
		}else if(value_ctemp2 < 100){
			value_ctemp2 = value_ctemp2/100
		}else{
			value_ctemp2 = value_ctemp2/1000
		}
		var value_current = value_ctemp1 + value_ctemp2
		console.log(value_current + ' A')


		// PowerRealtime.forge({
		// 	power_value: value_current,
		// 	timestemp: timestemp
		// }).save()
	}

	// voltage
	if(str_split[0] == 'a0'){
		var voltage1 = str_split[1] + str_split[2]
		var voltage2 = str_split[3]
		var value_vtemp1 = parseInt(voltage1, 16)
		var value_vtemp2 = parseInt(voltage2, 16)
		if(value_vtemp2 < 10){
			value_vtemp2 = value_vtemp2/10
		}else if(value_ctemp2 < 100){
			value_vtemp2 = value_vtemp2/100
		}else{
			value_vtemp2 = value_vtemp2/1000
		}
		var value_voltage = value_vtemp1 + value_vtemp2
		console.log(value_voltage + ' V')

	}

});