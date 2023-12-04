const socket = io.connect();

// Initialize charts for each sensor
const gpioCtx1 = document.getElementById('gpioChart1').getContext('2d');
const gpioCtx2 = document.getElementById('gpioChart2').getContext('2d');
const i2cCtx1 = document.getElementById('i2cChart1').getContext('2d');
const rs485Ctx1 = document.getElementById('rs485Chart1').getContext('2d');
const rs485Ctx2 = document.getElementById('rs485Chart2').getContext('2d');

const gpioChart1 = createSensorChart(gpioCtx1, 'GPIO Sensor 1');
const gpioChart2 = createSensorChart(gpioCtx2, 'GPIO Sensor 2');
const magneticFieldChart = createMagneticFieldChart(i2cCtx1, 'Magnetic Field Strength');
const rs485Chart1 = createSensorChart(rs485Ctx1, 'Distance Sensor 1');
const rs485Chart2 = createSensorChart(rs485Ctx2, 'Distance Sensor 2');

// Function to create a generic sensor chart
function createSensorChart(ctx, label) {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: label,
                data: [],
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
}

// Function to create a magnetic field chart with three datasets
function createMagneticFieldChart(ctx, label) {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: `${label} X`,
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 1
                },
                {
                    label: `${label} Y`,
                    data: [],
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1
                },
                {
                    label: `${label} Z`,
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Function to update a chart with new data
function updateChart(chart, value) {
    const now = new Date();
    chart.data.labels.push(now.toLocaleTimeString());
    chart.data.datasets[0].data.push(value);
    if (chart.data.labels.length > 20) { // Limit number of data points
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    chart.update();
}

// Function to update a magnetic field chart with new data
function updateMagneticFieldChart(chart, data) {
    const now = new Date().toLocaleTimeString();
    chart.data.labels.push(now);

    chart.data.datasets[0].data.push(data.Bx);
    chart.data.datasets[1].data.push(data.By);
    chart.data.datasets[2].data.push(data.Bz);

    if (chart.data.labels.length > 20) { // Limit number of data points
        chart.data.labels.shift();
        chart.data.datasets.forEach(dataset => {
            dataset.data.shift();
        });
    }

    chart.update();
}

// WebSocket event listeners for sensor data
socket.on('gpioData1', (value) => updateChart(gpioChart1, value));
socket.on('gpioData2', (value) => updateChart(gpioChart2, value));
socket.on('i2cData1', (data) => updateMagneticFieldChart(magneticFieldChart, data));
socket.on('rs485Data1', (data) => updateChart(rs485Chart1, data.distance));
socket.on('rs485Data2', (data) => updateChart(rs485Chart2, data.distance));
