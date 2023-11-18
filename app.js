const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Gpio = require('./mock-gpio').Gpio; // Using mock GPIO
// const Gpio = require('onoff').Gpio; // Real GPIO

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // Serve static files

io.on('connection', (socket) => {
    const sensor = new Gpio(17, 'in', 'both'); // Mock GPIO pin

    sensor.watch((err, value) => {
        if (err) {
            console.error('Error:', err);
        } else {
            socket.emit('gpioData', value);
        }
    });

    socket.on('disconnect', () => {
        sensor.unexport();
        console.log('Client disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
