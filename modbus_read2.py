import minimalmodbus

instrument = minimalmodbus.Instrument('/dev/ttyUSB0', 1)  # Replace 1 with your actual unit ID
instrument.serial.baudrate = 9600
instrument.serial.parity = 'N'
instrument.serial.stopbits = 1
instrument.serial.bytesize = 8
instrument.serial.timeout = 2  # Adjust as needed

try:
    # Read a register as a test
    register_value = instrument.read_register(1, functioncode=3)
    print(f"Register Value: {register_value}")
except Exception as e:
    print(f"Error: {e}")



