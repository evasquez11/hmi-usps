const socket = io.connect();

socket.on('gpioData', (data) => {
    console.log('Received GPIO data:', data);
    // Update the web page with new data
    updateSensorDisplay(data);
});

function updateSensorDisplay(data) {
    // This function updates the web page based on sensor data
    const sensorDisplayElement = document.getElementById('sensorDisplay');
    sensorDisplayElement.textContent = `Sensor Value: ${data}`;
}
