const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Determine if running on Raspberry Pi
const isRaspberryPi = true; // Change this based on your environment detection logic

// Conditional imports for GPIO
const Gpio = isRaspberryPi ? require('onoff').Gpio : require('./mock-gpio').Gpio;


const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // Serve static files from 'public' directory

io.on('connection', (socket) => {
    // Adjust GPIO pin numbers based on your hardware setup
    const gpioSensor1 = new Gpio(17, 'out'); // LED (output)
    const gpioSensor2 = new Gpio(4, 'in', 'both'); // Q2X sensor on the chute (input)
    const gpioSensor3 = new Gpio(6, 'out'); // New LED on GPIO 6
    const gpioSensor4 = new Gpio(5, 'in', 'both'); // Q2X sensor on the actuator (input)

    gpioSensor1.writeSync(1); // Turn LED on

    gpioSensor2.watch((err, value) => {
        if (err) {
            console.error('GPIO Error:', err);
        } else {
            // Adjust this logic based on your Q2X sensor behavior
            if (value === 1) {
                // Q2X sensor on the chute sensed something
                // Perform actions or emit notifications
                socket.emit('q2xChuteData', 'Package sensed at chute!');
            } else {
                // Q2X sensor on the chute didn't trigger
                // Emit notification or perform actions for missort
                socket.emit('q2xChuteData', 'Missort detected!');
            }
        }
    });



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
