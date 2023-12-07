import minimalmodbus
import time

# Modbus communication parameters
modbus_unit_id = 1
modbus_port = '/dev/ttyUSB0'
modbus_baudrate = 19200
modbus_parity = 0
modbus_stopbits = 1
modbus_bytesize = 8
modbus_timeout = 5

# Create Modbus instrument
instrument = minimalmodbus.Instrument(modbus_port, modbus_unit_id)
instrument.serial.baudrate = modbus_baudrate
instrument.serial.parity = modbus_parity
instrument.serial.stopbits = modbus_stopbits
instrument.serial.bytesize = modbus_bytesize
instrument.serial.timeout = modbus_timeout

try:
    # Read Analog Data output (Register 40001)
    analog_data_output = instrument.read_register(40001, functioncode=3, number_of_decimals=3)
    print(f"Analog Data Output: {analog_data_output} mA")
except minimalmodbus.ModbusException as e:
    print(f"Modbus error: {e}")
except Exception as e:
    print(f"General error: {e}")
finally:
    # Close the Modbus connection (not necessary for MinimalModbus)
    pass


