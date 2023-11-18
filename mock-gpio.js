// mock-gpio.js
class MockGpio {
    constructor(pin, direction, edge) {
        this.pin = pin;
        this.direction = direction;
        this.edge = edge;
        console.log(`Mock GPIO ${pin} set as ${direction}`);
    }

    watch(callback) {
        setInterval(() => {
            const mockValue = Math.round(Math.random()); // Simulate a sensor value change
            callback(null, mockValue);
        }, 1000); // Change interval as needed for testing
    }

    unexport() {
        console.log(`Unexporting mock GPIO ${this.pin}`);
    }
}

module.exports.Gpio = MockGpio;
