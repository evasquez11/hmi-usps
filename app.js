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
    const gpioSensor1 = new Gpio(17, 'out'); // Use gpioSensor1 as LED (output)
    const gpioSensor2 = new Gpio(4, 'in', 'both'); // Use gpioSensor2 as Button (input)
    const gpioSensor3 = new Gpio(6, 'out'); // New LED on GPIO 6
    const gpioSensor4 = new Gpio(5, 'in', 'both'); // New switch (input) on GPIO 5

    // let actuatorActivated = false;

    // // Function to handle miss-sort detection
    // function checkForMissSort(binSensorValue) {
    //     if (actuatorActivated && binSensorValue === 0) { // 0 represents inactive
    //         console.log('Miss-sort detected: Actuator activated but no package detected.');
    //         // You can also emit this event to the client if needed
    //         socket.emit('missSort', 'Miss-sort detected');
    //         actuatorActivated = false; // Reset the state
    //     }
    // }

    gpioSensor1.writeSync(1); // Turn LED on

    // gpioSensor2.watch((err, value) => {
    //     if (err) {
    //         console.error('GPIO Error:', err);
    //     } else {
    //         gpioSensor1.writeSync(value); // Turn on/off LED based on button state
    //         socket.emit('gpioData2', value); // Emit button state to client
    //         if (value === 1) { // 1 represents active
    //             actuatorActivated = true; // Actuator is activated
    //         }
    //     }
    // });

    gpioSensor3.writeSync(1); // Turn new LED on

    // gpioSensor4.watch((err, value) => {
    //     if (err) {
    //         console.error('GPIO Error:', err);
    //     } else {
    //         gpioSensor3.writeSync(value); // Turn on/off the new LED based on the switch state
    //         socket.emit('gpioData1', value); // Emit the switch state to the client
    //         checkForMissSort(value);
    //     }
    // });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        if (isRaspberryPi) {
            gpioSensor1.unexport();
            gpioSensor2.unexport();
            gpioSensor3.unexport();
            gpioSensor4.unexport();
        }
    });
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});

// Cleanup on exit
process.on('SIGINT', () => {
    if (isRaspberryPi) {
        gpioSensor1.unexport();
        gpioSensor2.unexport();
        gpioSensor3.unexport();
        gpioSensor4.unexport();
    }
    process.exit();
});
