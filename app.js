const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { Gpio } = require('onoff');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // Serve static files from 'public' directory

io.on('connection', (socket) => {
    const led = new Gpio(17, 'out'); // LED for signaling
    const sensor = new Gpio(4, 'in', 'both'); // Sensor for input

    sensor.watch((err, value) => {
        if (err) {
            console.error('Sensor Error:', err);
            return;
        }
        led.writeSync(value); // Turn LED on/off based on sensor value
        socket.emit('sensorData', value); // Emit sensor data to client
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        led.unexport();
        sensor.unexport();
    });
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});

process.on('SIGINT', () => {
    led.unexport();
    sensor.unexport();
    process.exit();
});
