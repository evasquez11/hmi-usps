const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
// const MockRS485 = require('./mock-rs485'); // Import mock RS485

// Determine if running on Raspberry Pi
const isRaspberryPi = false; // Change this based on your environment detection logic

// Conditional imports for GPIO
const Gpio = isRaspberryPi ? require('onoff').Gpio : require('./mock-gpio').Gpio;

// Conditional imports for I2C
const I2C = isRaspberryPi ? require('real-i2c-library') : require('./mock-i2c');

const RS485 = require(isRaspberryPi ? 'serialport' : './mock-rs485');


const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // Serve static files from 'public' directory

io.on('connection', (socket) => {
    // GPIO sensor setup
    const gpioSensor = new Gpio(17, 'in', 'both'); // Using GPIO pin 17 as an example
    gpioSensor.watch((err, value) => {
        if (err) {
            console.error('GPIO Error:', err);
        } else {
            socket.emit('gpioData', value);
        }
    });

    // I2C sensor setup
    const i2cSensor = new I2C(0x00, 1); // Using mock I2C
    setInterval(async () => {
        const magneticStrength = await i2cSensor.readSensorData();
        socket.emit('i2cData', { magneticStrength });
    }, 2000); // Adjust the interval as needed

    // RS485 sensor setup
    const rs485Sensor = new RS485(); // Using mock RS485
    setInterval(async () => {
        const distance = await rs485Sensor.readDistance();
        socket.emit('rs485Data', { distance });
    }, 1000); // Adjust the interval as needed

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        if (!isRaspberryPi) {
            gpioSensor.unexport();
        }
    });
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});

// Cleanup on exit
process.on('SIGINT', () => {
    if (!isRaspberryPi) {
        gpioSensor.unexport();
    }
    process.exit();
});
