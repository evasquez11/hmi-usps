import time
import board
import adafruit_mmc56x3
import adafruit_tlv493d
import websocket
import json
import threading

# Initialize I2C and sensors
i2c = board.I2C()
mmc_sensor = adafruit_mmc56x3.MMC5603(i2c)
tlv_sensor = adafruit_tlv493d.TLV493D(i2c)

# Function to read the absolute value of the Z-axis magnetic field
def read_magnetic_z(sensor):
    _, _, z = sensor.magnetic
    return abs(z)

# WebSocket connection setup
def on_message(ws, message):
    print(f"Message from server: {message}")

def on_error(ws, error):
    print(error)

def on_close(ws):
    print("Connection closed")

def on_open(ws):
    def run(*args):
        while True:
            # Current time
            current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())

            # Read absolute Z-axis magnetic field data from sensors
            mmc_z_abs = read_magnetic_z(mmc_sensor)
            tlv_z_abs = read_magnetic_z(tlv_sensor)

            # Check if the magnet is detected within the threshold range for each sensor
            mmc_magnet_detected = mmc_threshold_min_z <= mmc_z_abs <= mmc_threshold_max_z
            tlv_magnet_detected = tlv_threshold_min_z <= tlv_z_abs <= tlv_threshold_max_z

            # Create a JSON object with the data
            data = {
                "time": current_time,
                "mmc_z_abs": mmc_z_abs,
                "mmc_magnet_detected": mmc_magnet_detected,
                "tlv_z_abs": tlv_z_abs,
                "tlv_magnet_detected": tlv_magnet_detected
            }

            # Send data via WebSocket
            ws.send(json.dumps(data))

            # Wait before next reading
            time.sleep(0.5)

    threading.Thread(target=run).start()

if __name__ == "__main__":
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp("ws://localhost:3000",
                                on_message=on_message,
                                on_error=on_error,
                                on_close=on_close)
    ws.on_open = on_open
    ws.run_forever()
