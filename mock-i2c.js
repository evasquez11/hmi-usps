// mock-i2c.js

// adafruit-tlv493-i2c.js
const { TLV493 } = require('adafruit-circuitpython-tlv493');

class MockI2C {
    constructor(address, bus) {
        this.tlv493 = new TLV493({address, bus});
        console.log(`Adafruit TLV493 device at address ${address} on bus ${bus}`);
    }

    // Simulate reading magnetic field strength
    readSensorData() {
        return new Promise((resolve, reject) => {
            try {
                const data = this.tlv493.read();  // Adjust method based on the actual library
                resolve(data);
            } catch (error) {
                reject(error);
            }
        });
    }
}
    // Add other methods if needed

module.exports = MockI2C;
