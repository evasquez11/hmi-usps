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

const ctx = document.getElementById('sensorChart').getContext('2d');
let currentSensor = 'gpio'; // Default sensor
let chartData = [];

const sensorChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], // Time labels
        datasets: [{
            label: 'Sensor Value',
            data: chartData,
            backgroundColor: 'rgba(0, 123, 255, 0.5)',
            borderColor: 'rgba(0, 123, 255, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

function updateChart(sensorType, value) {
    if (currentSensor === sensorType) {
        const now = new Date();
        sensorChart.data.labels.push(now.toLocaleTimeString());
        sensorChart.data.datasets[0].data.push(value);
        if (sensorChart.data.labels.length > 20) { // Limit number of data points
            sensorChart.data.labels.shift();
            sensorChart.data.datasets[0].data.shift();
        }
        sensorChart.update();
    }
}

document.getElementById('gpioButton').onclick = () => currentSensor = 'gpio';
document.getElementById('i2cButton').onclick = () => currentSensor = 'i2c';
document.getElementById('rs485Button').onclick = () => currentSensor = 'rs485';

// ... existing socket.on handlers ...
socket.on('gpioData', (value) => updateChart('gpio', value));
socket.on('i2cData', (data) => updateChart('i2c', data.magneticStrength));
socket.on('rs485Data', (data) => updateChart('rs485', data.distance));
