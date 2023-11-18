const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Determine if running on Raspberry Pi
const isRaspberryPi = false; // Change this based on your environment detection logic

// Conditional imports for GPIO
const Gpio = isRaspberryPi ? require('onoff').Gpio : require('./mock-gpio').Gpio;

// Conditional imports for I2C
const I2C = isRaspberryPi ? require('real-i2c-library') : require('./mock-i2c');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // Serve static files from 'public' directory

io.on('connection', (socket) => {
    // Example GPIO sensor
    const gpioSensor = new Gpio(17, 'in', 'both'); // Using GPIO pin 17 as an example
    gpioSensor.watch((err, value) => {
        if (err) {
            console.error('GPIO Error:', err);
        } else {
            socket.emit('gpioData', value);
        }
    });

// Inside io.on('connection', ...)
const i2cSensor = new I2C(0x00, 1); // Using mock I2C

setInterval(async () => {
    const magneticStrength = await i2cSensor.readSensorData();
    // console.log("Emitting magnetic strength:", magneticStrength); // Check the output
    socket.emit('i2cData', { magneticStrength });
}, 2000);



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
