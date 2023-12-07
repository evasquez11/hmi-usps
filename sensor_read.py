import board
import adafruit_tlv493d

i2c = board.I2C()  # uses board.SCL and board.SDA

tlv1 = adafruit_tlv493d.TLV493D(i2c, address=0x5e) // Initialize the first sensor (Slave #0)

// Initialize the second sensor (Slave #1)
// tlv2 = adafruit_tlv493d.TLV493D(i2c, address=)

while True:
    print("Sensor 1 - X: %s, Y: %s, Z: %s uT" % tlv1.magnetic)
    print("Sensor 2 - X: %s, Y: %s, Z: %s uT" % tlv2.magnetic)
    time.sleep(1)

