class MockRS485 {
    constructor() {
        // Initialize with any necessary default values
    }

    // Simulate reading distance data from the sensor
    readDistance() {
        return new Promise((resolve) => {
            // Simulate a distance reading between 0 and 50mm
            const distance = Math.random() * 50;
            setTimeout(() => resolve(distance), 100); // Simulate a delay in reading
        });
    }

    // Add other methods as required for your RS485 communication
}

module.exports = MockRS485;
