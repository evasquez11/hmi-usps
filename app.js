const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { Gpio } = require('onoff');
const { spawn } = require('child_process');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // Serve static files from 'public' directory

io.on('connection', (socket) => {
    const gpioSensor1 = new Gpio(17, 'out'); // Example LED (output)
    const gpioSensor2 = new Gpio(4, 'in', 'both'); // Actuator sensor
    const gpioSensor3 = new Gpio(6, 'out'); // Miss-sort LED
    const gpioSensor4 = new Gpio(5, 'in', 'both'); // Bin sensor
    const missSortLedOnDuration = 5000; // 5 seconds, adjust as needed
    const debounceTime = 1000; // 1 second debounce time

    let actuatorActivated = false;
    let packageExpectedTime = 5000; // 5 seconds for package to reach bin after actuator activation
    let lastSensor2TriggerTime = 0;
    let lastSensor4TriggerTime = 0;

    function resetSystem() {
        actuatorActivated = false;
        gpioSensor1.writeSync(0); // Turn off actuator LED
        gpioSensor3.writeSync(0); // Turn off miss-sort LED
        console.log('System reset for next cycle');
    }

    function checkForMissSort() {
        const binSensorValue = gpioSensor4.readSync();
        if (actuatorActivated && binSensorValue === 0) {
            console.log('Miss-sort detected: Actuator activated but no package detected.');
            gpioSensor3.writeSync(1); // Turn on LED for miss-sort detection
            socket.emit('missSort', 'Miss-sort detected');
            setTimeout(resetSystem, missSortLedOnDuration); // Delay the reset system
        } else {
            resetSystem();
        }
    }

    gpioSensor2.watch((err, value) => {
        if (err) {
            console.error('GPIO Sensor 2 Error:', err);
            return;
        }
        const now = Date.now();
        if (now - lastSensor2TriggerTime > debounceTime) {
            lastSensor2TriggerTime = now;
            socket.emit('gpioData2', value); // Emit actuator sensor state to client
            if (value === 1) { // Actuator sensor activated
                actuatorActivated = true;
                gpioSensor1.writeSync(1); // Turn on LED for actuator activation
                console.log('Actuator activated, awaiting package...');
                setTimeout(checkForMissSort, packageExpectedTime);
            }
        }
    });
    
    gpioSensor4.watch((err, value) => {
        if (err) {
            console.error('GPIO Sensor 4 Error:', err);
            return;
        }
        const now = Date.now();
        if (now - lastSensor4TriggerTime > debounceTime) {
            lastSensor4TriggerTime = now;
            socket.emit('gpioData1', value); // Emit bin sensor state to client
            if (value === 1) { // Package detected at the bin
                if (actuatorActivated) {
                    console.log('Package correctly sorted.');
                    gpioSensor1.writeSync(0); // Turn off actuator LED
                    resetSystem();
                } else {
                    console.log('Miss-sort detected: Package arrived without actuator activation.');
                    gpioSensor3.writeSync(1); // Turn on LED for miss-sort detection
                    socket.emit('missSort', 'Miss-sort detected: Package without actuator activation');
                    setTimeout(resetSystem, missSortLedOnDuration); // Delay the reset system
                }
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


    const pythonProcess = spawn('python', ['i2cSensors.py']);



    pythonProcess.stdout.on('data', (data) => {
        try {
            const sensorData = JSON.parse(data.toString());
            if (sensorData.mmc_magnet_detected || sensorData.tlv_magnet_detected) {
                // Emitting to the frontend
                socket.emit('magnetDetection', sensorData);
            }
        } catch (err) {
            console.error('Error parsing Python script output:', err);
        }
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
    });

    socket.on('disconnect', () => {
        pythonProcess.kill(); // Terminate Python script on disconnect
    });


});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});

process.on('SIGINT', () => {
    pythonProcess.kill();

    if (gpioSensor1) {
        gpioSensor1.unexport();
    }
    if (gpioSensor2) {
        gpioSensor2.unexport();
    }
    if (gpioSensor3) {
        gpioSensor3.unexport();
    }
    if (gpioSensor4) {
        gpioSensor4.unexport();
    }
    process.exit();
});
