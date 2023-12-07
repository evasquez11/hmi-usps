import time
import json
import board
import adafruit_mmc56x3
import adafruit_tlv493d

# Initialize I2C and sensors
i2c = board.I2C()
mmc_sensor = adafruit_mmc56x3.MMC5603(i2c)
tlv_sensor = adafruit_tlv493d.TLV493D(i2c)

# Function to read the absolute value of the Z-axis magnetic field
def read_magnetic_z(sensor):
    _, _, z = sensor.magnetic
    return abs(z)

# Define threshold ranges for magnet detection on Z-axis for each sensor
mmc_threshold_min_z = 40  # Replace with your calibrated minimum threshold for MMC5603
mmc_threshold_max_z = 60  # Replace with your calibrated maximum threshold for MMC5603
tlv_threshold_min_z = 45  # Replace with your calibrated minimum threshold for TLV493D
tlv_threshold_max_z = 65  # Replace with your calibrated maximum threshold for TLV493D

try:
    print("Starting magnetic field Z-axis data readings. Press Ctrl+C to stop.\n")

    while True:
        # Read absolute Z-axis magnetic field data from sensors
        mmc_z_abs = read_magnetic_z(mmc_sensor)
        tlv_z_abs = read_magnetic_z(tlv_sensor)

        # Check if the magnet is detected within the threshold range for each sensor
        mmc_magnet_detected = mmc_threshold_min_z <= mmc_z_abs <= mmc_threshold_max_z
        tlv_magnet_detected = tlv_threshold_min_z <= tlv_z_abs <= tlv_threshold_max_z

        # Create a JSON object with the data
        data = {
            "time": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()),
            "mmc_z_abs": mmc_z_abs,
            "mmc_magnet_detected": mmc_magnet_detected,
            "tlv_z_abs": tlv_z_abs,
            "tlv_magnet_detected": tlv_magnet_detected
        }

        # Print the data for debugging
        print(f"Debug: Time: {data['time']}, MMC Z: {data['mmc_z_abs']}, MMC Detected: {data['mmc_magnet_detected']}, TLV Z: {data['tlv_z_abs']}, TLV Detected: {data['tlv_magnet_detected']}")

        # Output the data as a JSON string with a unique identifier
        print("JSON_OUTPUT:" + json.dumps(data))

        # Wait before next reading
        time.sleep(0.5)

except KeyboardInterrupt:
    print("Script terminated by user.")
