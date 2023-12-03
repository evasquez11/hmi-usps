const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Determine if running on Raspberry Pi
const isRaspberryPi = true; // Change this based on your environment detection logic

// Conditional imports for GPIO
const Gpio = isRaspberryPi ? require('onoff').Gpio : require('./mock-gpio').Gpio;

// Conditional imports for I2C
const I2C = isRaspberryPi ? require('i2c-bus') : require('./mock-i2c');

const RS485 = require(isRaspberryPi ? 'serialport' : './mock-rs485');


const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // Serve static files from 'public' directory

io.on('connection', (socket) => {
    // Example GPIO sensor setup
    // const gpioSensor1 = new Gpio(17, 'in', 'both'); // First GPIO sensor
    // const gpioSensor2 = new Gpio(18, 'in', 'both'); // Second GPIO sensor
    // Replace 17 and 18 with actual GPIO pins for real sensors
    const gpioSensor1 = new Gpio(17, 'out'); // Use gpioSensor1 as LED (output)
    const gpioSensor2 = new Gpio(4, 'in', 'both'); // Use gpioSensor2 as Button (input)


    gpioSensor1.watch((err, value) => {
        if (err) console.error('GPIO Error:', err);
        else socket.emit('gpioData1', value);
    });

    gpioSensor2.watch((err, value) => {
        if (err) console.error('GPIO Error:', err);
        else socket.emit('gpioData2', value);
    });

    // Example I2C sensor setup
    const i2cSensor1 = new I2C(0x00, 1); // First I2C sensor
    const i2cSensor2 = new I2C(0x01, 1); // Second I2C sensor
    // Replace 0x00 and 0x01 with actual I2C addresses for real sensors

    setInterval(async () => {
        const magneticStrength1 = await i2cSensor1.readSensorData();
        socket.emit('i2cData1', { magneticStrength: magneticStrength1 });

        const magneticStrength2 = await i2cSensor2.readSensorData();
        socket.emit('i2cData2', { magneticStrength: magneticStrength2 });
    }, 2000);

    // Example RS485 sensor setup
    const rs485Sensor1 = new RS485(); // First RS485 sensor
    const rs485Sensor2 = new RS485(); // Second RS485 sensor

    setInterval(async () => {
        const distance1 = await rs485Sensor1.readDistance();
        socket.emit('rs485Data1', { distance: distance1 });

        const distance2 = await rs485Sensor2.readDistance();
        socket.emit('rs485Data2', { distance: distance2 });
    }, 1000);

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        if (!isRaspberryPi) {
            gpioSensor1.unexport();
            gpioSensor2.unexport();
        }
    });
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});

// Cleanup on exit
process.on('SIGINT', () => {
    if (!isRaspberryPi) {
        gpioSensor1.unexport();
        gpioSensor2.unexport();
    }
    process.exit();
});
