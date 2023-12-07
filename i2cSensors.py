import time
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
mmc_threshold_min_z = 40  # Replace with calibrated minimum threshold for MMC5603
mmc_threshold_max_z = 60  # Replace with calibrated maximum threshold for MMC5603
tlv_threshold_min_z = 45  # Replace with calibrated minimum threshold for TLV493D
tlv_threshold_max_z = 65  # Replace with calibrated maximum threshold for TLV493D

print("Starting magnetic field Z-axis data readings. Press Ctrl+C to stop.\n")

while True:
    # Current time
    current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())

    # Read absolute Z-axis magnetic field data from sensors
    mmc_z_abs = read_magnetic_z(mmc_sensor)
    tlv_z_abs = read_magnetic_z(tlv_sensor)

    # Check if the magnet is detected within the threshold range for each sensor
    mmc_magnet_detected = mmc_threshold_min_z <= mmc_z_abs <= mmc_threshold_max_z
    tlv_magnet_detected = tlv_threshold_min_z <= tlv_z_abs <= tlv_threshold_max_z

    # Print Z-axis magnetic field data and detection status for both sensors
    print(f"Time: {current_time}")
    print(f"MMC5603 - Absolute Z: {mmc_z_abs:.2f} uT, Detected: {mmc_magnet_detected}")
    print(f"TLV493D - Absolute Z: {tlv_z_abs:.2f} uT, Detected: {tlv_magnet_detected}")
    print("-" * 40)  # Separator

    # Wait before next reading
    time.sleep(0.5)
