from pymodbus.client import ModbusSerialClient as ModbusClient
from pymodbus.exceptions import ModbusException
import time

modbus_client = ModbusClient(method='rtu', port='/dev/ttyUSB0', baudrate=38400, parity='N', stopbits=1, bytesize=8, timeout=5)

try:
    modbus_client.connect()
    for attempt in range(5):
        result = modbus_client.read_holding_registers(0, 1, unit=1)  # Read the first register
        if not result.isError():
            print("Register value:", result.registers[0])
            break
        else:
            print("Read error, retrying...")
        time.sleep(1)
except ModbusException as e:
    print(f"Modbus error: {e}")
except Exception as e:
    print(f"General error: {e}")
finally:
    modbus_client.close()
