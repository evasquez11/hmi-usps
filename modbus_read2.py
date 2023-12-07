import minimalmodbus

instrument = minimalmodbus.Instrument('/dev/ttyUSB0', 1)  # Replace 1 with your actual unit ID
instrument.serial.baudrate = 38400
instrument.serial.parity = 'N'
instrument.serial.stopbits = 1
instrument.serial.bytesize = 8
instrument.serial.timeout = 2  # Adjust as needed
instrument.serial.rtscts = True

try:
    # Read a register as a test
    adjusted_register = 40000
    analog_data_output = instrument.read_register(adjusted_register, functioncode=3, number_of_decimals=3)
    print(f"Register Value: {analog_data_output}")
except Exception as e:
    print(f"Error: {e}")



