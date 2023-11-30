// mock-i2c.js
class MockI2C {
    constructor(address, bus) {
        this.address = address;
        this.bus = bus;
        console.log(`Mock I2C device at address ${address} on bus ${bus}`);
    }

    // Simulate reading magnetic field strength
    readSensorData() {
        return new Promise((resolve) => {
            // Simulate magnetic field strength
            const magneticFieldStrength = Math.random() * 100; // Adjust the range as per your sensor's typical values
            setTimeout(() => resolve(magneticFieldStrength), 100);
        });
    }

    // Add other methods if needed
}

module.exports = MockI2C;
