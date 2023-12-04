const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const i2c = require('i2c-bus');

// Determine if running on Raspberry Pi
const isRaspberryPi = true;

// Conditional imports for GPIO
const Gpio = isRaspberryPi ? require('onoff').Gpio : require('./mock-gpio').Gpio;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const MAGNETOMETER_I2C_ADDRESS = 0x5E;
const i2cBus = i2c.openSync(1);

const MOD1_REGISTER = 0x1;
const FAST_MODE_BIT = 0b00000010; // Bit for Fast Mode enabled

// Function to calculate parity bit
const calculateParity = (value) => {
  let parity = 0;
  while (value) {
    parity ^= value & 1;
    value >>= 1;
  }
  return parity;
};

// Function to configure the sensor for Fast Mode
const configureSensorForFastMode = () => {
  // Combine the configuration bits
  let configValue = FAST_MODE_BIT;
  // Calculate the parity bit
  let parityBit = calculateParity(configValue) << 7;
  // Combine the parity bit with the configuration value
  configValue |= parityBit;

  try {
    i2cBus.writeByteSync(MAGNETOMETER_I2C_ADDRESS, MOD1_REGISTER, configValue);
    console.log(`Sensor configured for Fast Mode with MOD1 = ${configValue.toString(2)}`);
  } catch (error) {
    console.error('Error configuring sensor for Fast Mode:', error);
  }
};

// Function to reset the sensor
const resetSensor = () => {
  try {
    i2cBus.writeByteSync(MAGNETOMETER_I2C_ADDRESS, 0x00, 0x00);
    console.log('Sensor reset command sent');
  } catch (error) {
    console.error('Error sending reset command to sensor:', error);
  }
};

// Call resetSensor and configureSensorForFastMode after setting up the server
server.listen(3000, () => {
  console.log('Server listening on port 3000');
  resetSensor();
  setTimeout(() => {
    configureSensorForFastMode();
  }, 100); // Adjust delay as necessary
});

// GPIO logic
const gpioSensor1 = new Gpio(17, 'out');
const gpioSensor2 = new Gpio(4, 'in', 'both');
const gpioSensor3 = new Gpio(6, 'out');
const gpioSensor4 = new Gpio(5, 'in', 'both');

gpioSensor1.writeSync(1); // Turn on LED
gpioSensor3.writeSync(1); // Turn on new LED

gpioSensor2.watch((err, value) => {
  if (err) {
    console.error('GPIO Error:', err);
  } else {
    gpioSensor1.writeSync(value);
    io.emit('gpioData2', value);
  }
});

gpioSensor4.watch((err, value) => {
  if (err) {
    console.error('GPIO Error:', err);
  } else {
    gpioSensor3.writeSync(value);
    io.emit('gpioData1', value);
  }
});

// Magnetometer reading logic
setInterval(() => {
  const magnetometerData = readSensorData();
  io.emit('i2cData1', magnetometerData);
}, 1000);

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Cleanup on exit
process.on('SIGINT', () => {
  gpioSensor1.unexport();
  gpioSensor2.unexport();
  gpioSensor3.unexport();
  gpioSensor4.unexport();
  i2cBus.closeSync();
  process.exit();
});

// Function to read axis data from the magnetometer
const readAxisData = (registerPair) => {
  const highByte = i2cBus.readByteSync(MAGNETOMETER_I2C_ADDRESS, registerPair[0]);
  const lowByte = i2cBus.readByteSync(MAGNETOMETER_I2C_ADDRESS, registerPair[1]);
  let combined = (highByte << 8) | lowByte;
  if (combined & 0x8000) {
    combined = -(0x10000 - combined);
  }
  return combined * 0.098; // Adjust the multiplication factor based on your sensor's datasheet
};

// Function to read all sensor data
const readSensorData = () => {
  let Bx = readAxisData([0x00, 0x01]);
  let By = readAxisData([0x02, 0x03]);
  let Bz = readAxisData([0x04, 0x05]);
  return { Bx, By, Bz };
};
