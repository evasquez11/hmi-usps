from pymodbus.client.sync import ModbusSerialClient

# Modbus communication parameters
modbus_unit_id = 1
modbus_port = '/dev/ttyUSB0'
modbus_baudrate = 38400
modbus_parity = 'N'
modbus_stopbits = 1
modbus_bytesize = 8
modbus_timeout = 5

# Create Modbus client
modbus_client = ModbusSerialClient(
    method='rtu',
    port=modbus_port,
    baudrate=modbus_baudrate,
    parity=modbus_parity,
    stopbits=modbus_stopbits,
    bytesize=modbus_bytesize,
    timeout=modbus_timeout
)

try:
    # Connect to the Modbus device
    modbus_client.connect()

    # Read Analog Data output (Register 40001)
    result = modbus_client.read_holding_registers(40001, 1, unit=modbus_unit_id)
    print(result)
    print(result.registers)
    if not result.isError():
        analog_data_output = result.registers[0] / 1000.0  # Convert to mA
        print(f"Analog Data Output: {analog_data_output} mA")
    else:
        print(f"Error reading Analog Data Output: {result}")
except Exception as e:
    print(f"Error: {e}")
finally:
    # Close the Modbus connection
    modbus_client.close()

