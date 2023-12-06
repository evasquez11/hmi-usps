const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { Gpio } = require('onoff');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // Serve static files from 'public' directory

io.on('connection', (socket) => {
    const gpioSensor1 = new Gpio(17, 'out'); // Example LED (output)
    const gpioSensor2 = new Gpio(4, 'in', 'both'); // Actuator sensor
    const gpioSensor3 = new Gpio(6, 'out'); // Another example LED
    const gpioSensor4 = new Gpio(5, 'in', 'both'); // Bin sensor

    let actuatorActivated = false;
    let packageExpectedTime = 5000; // 5 seconds for package to reach bin after actuator activation

    function resetSystem() {
        actuatorActivated = false;
        console.log('System reset for next cycle');
    }

    function checkForMissSort(binSensorValue) {
        if (actuatorActivated && binSensorValue === 0) {
            console.log('Miss-sort detected: Actuator activated but no package detected.');
            socket.emit('missSort', 'Miss-sort detected');
        }
        resetSystem();
    }

    gpioSensor2.watch((err, value) => {
        if (err) {
            console.error('GPIO Sensor 2 Error:', err);
            return;
        }
        if (value === 1) {
            actuatorActivated = true;
            console.log('Actuator activated, awaiting package...');
            setTimeout(() => checkForMissSort(gpioSensor4.readSync()), packageExpectedTime);
        }
    });

    gpioSensor4.watch((err, value) => {
        if (err) {
            console.error('GPIO Sensor 4 Error:', err);
            return;
        }
        if (value === 1) { // Package detected at the bin
            if (actuatorActivated) {
                console.log('Package correctly sorted.');
                resetSystem();
            } else {
                // Actuator was never activated, but package detected
                console.log('Miss-sort detected: Package arrived without actuator activation.');
                socket.emit('missSort', 'Miss-sort detected: Package without actuator activation');
                resetSystem();
            }
        }
    });    

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        gpioSensor1.unexport();
        gpioSensor2.unexport();
        gpioSensor3.unexport();
        gpioSensor4.unexport();
    });
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});

process.on('SIGINT', () => {
    gpioSensor1.unexport();
    gpioSensor2.unexport();
    gpioSensor3.unexport();
    gpioSensor4.unexport();
    process.exit();
});
