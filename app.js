const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const i2c = require('i2c-bus');

// Determine if running on Raspberry Pi
const isRaspberryPi = true; // Change this based on your environment detection logic

// Conditional imports for GPIO
const Gpio = isRaspberryPi ? require('onoff').Gpio : require('./mock-gpio').Gpio;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // Serve static files from 'public' directory

// Magnetometer setup
const MAGNETOMETER_I2C_ADDRESS = 0x5E; // Magnetometer I2C address
const i2cBus = i2c.openSync(1); // Open I2C bus
const REGISTERS = {
  Bx: [0x00, 0x01], // Bx high byte, Bx low byte
  By: [0x02, 0x03], // By high byte, By low byte
  Bz: [0x04, 0x05], // Bz high byte, Bz low byte
};

const readAxisData = (registerPair) => {
    const highByte = i2cBus.readByteSync(MAGNETOMETER_I2C_ADDRESS, registerPair[0]);
    const lowByte = i2cBus.readByteSync(MAGNETOMETER_I2C_ADDRESS, registerPair[1]);
    console.log(`High byte for ${registerPair}:`, highByte); // Log high byte
    console.log(`Low byte for ${registerPair}:`, lowByte); // Log low byte
  
    let combined = (highByte << 8) | lowByte;
    if (combined & 0x8000) { // If the value is negative
      combined = -(0x10000 - combined);
    }
  
    const magneticFieldValue = combined * 0.098; // Convert to milliteslas
    console.log(`Magnetic field value for ${registerPair}:`, magneticFieldValue); // Log magnetic field value
    return magneticFieldValue;
  };
  

const readSensorData = () => {
  let Bx = readAxisData(REGISTERS.Bx);
  let By = readAxisData(REGISTERS.By);
  let Bz = readAxisData(REGISTERS.Bz);
  return { Bx, By, Bz };
};

io.on('connection', (socket) => {
    // GPIO LED/Button logic
    const gpioSensor1 = new Gpio(17, 'out'); // Use gpioSensor1 as LED (output)
    gpioSensor1.writeSync(1); // Turn LED on

    const gpioSensor2 = new Gpio(4, 'in', 'both'); // Use gpioSensor2 as Button (input)
    gpioSensor2.watch((err, value) => {
        if (err) {
            console.error('GPIO Error:', err);
        } else {
            gpioSensor1.writeSync(value); // Turn on/off LED based on button state
            socket.emit('gpioData2', value); // Emit button state to client
        }
    });

    const gpioSensor3 = new Gpio(6, 'out'); // New LED on GPIO 6
    gpioSensor3.writeSync(1); // Turn new LED on and keep it on

    const gpioSensor4 = new Gpio(5, 'in', 'both'); // New switch (input) on GPIO 5
    gpioSensor4.watch((err, value) => {
        if (err) {
            console.error('GPIO Error:', err);
        } else {
            gpioSensor3.writeSync(value); // Turn on/off the new LED based on the switch state
            socket.emit('gpioData1', value); // Emit the switch state to the client
        }
    });

    // Magnetometer reading logic
    setInterval(() => {
        const magnetometerData = readSensorData();
        socket.emit('i2cData1', magnetometerData); // Emit magnetometer data to client
    }, 1000);

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

// Cleanup on exit
process.on('SIGINT', () => {
    gpioSensor1.unexport();
    gpioSensor2.unexport();
    gpioSensor3.unexport();
    gpioSensor4.unexport();
    i2cBus.closeSync(); // Close the I2C bus
    process.exit();
});
