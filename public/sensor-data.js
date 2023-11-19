const socket = io.connect();

// Handle incoming GPIO data
socket.on('gpioData', (gpioValue) => {
    console.log('Received GPIO data:', gpioValue);
    updateGpioDisplay(gpioValue);
});

// Handle incoming I2C data
socket.on('i2cData', (data) => {
    console.log('Received I2C data:', data); // Check if data is received
    updateI2CDisplay(data);
});

socket.on('rs485Data', (data) => {
    updateRs485Display(data.distance);
});

function updateGpioDisplay(value) {
    // Update the GPIO sensor display on the webpage
    const gpioDisplayElement = document.getElementById('gpioDisplay');
    if (gpioDisplayElement) {
        gpioDisplayElement.textContent = `GPIO Sensor Value: ${value}`;
    }
}

function updateI2CDisplay(data) {
    const i2cDisplayElement = document.getElementById('i2cDisplay');
    if (i2cDisplayElement) {
        i2cDisplayElement.textContent = `Magnetic Field Strength: ${data.magneticStrength.toFixed(2)}`;
    }
}

function updateRs485Display(distance) {
    const rs485DisplayElement = document.getElementById('rs485Display');
    if (rs485DisplayElement) {
        rs485DisplayElement.textContent = `Distance: ${distance.toFixed(2)} mm`;
    }
}

