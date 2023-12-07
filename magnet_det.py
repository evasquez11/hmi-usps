# import time
# import board
# import adafruit_mmc56x3
# import adafruit_tlv493d
# # import logging

# # Initialize logging
# # logging.basicConfig(filename='conveyor_belt_log.txt', level=logging.INFO,
# #                     format='%(asctime)s:%(levelname)s:%(message)s')

# # Initialize I2C and sensors
# i2c = board.I2C()
# mmc_sensor = adafruit_mmc56x3.MMC5603(i2c)
# tlv_sensor = adafruit_tlv493d.TLV493D(i2c)

# def detect_magnet(sensor, threshold):
#     x, y, z = sensor.magnetic
#     return abs(x) > threshold or abs(y) > threshold or abs(z) > threshold

# # Define thresholds for magnet detection and acceptable difference
# mmc_threshold = 50  # Replace with your calibrated threshold
# tlv_threshold = 50  # Replace with your calibrated threshold
# some_acceptable_difference = 0.5  # 0.5 seconds

# # Initialize variables to store last detection times and cycle times
# last_time_mmc = time.time()
# last_time_tlv = time.time()
# cycle_time_mmc = 0
# cycle_time_tlv = 0

# while True:
#     current_time = time.time()

#     if detect_magnet(mmc_sensor, mmc_threshold):
#         cycle_time_mmc = current_time - last_time_mmc
#         last_time_mmc = current_time
#         print(f"MMC Cycle Time: {cycle_time_mmc:.2f} seconds")

#     if detect_magnet(tlv_sensor, tlv_threshold):
#         cycle_time_tlv = current_time - last_time_tlv
#         last_time_tlv = current_time
#         print(f"TLV Cycle Time: {cycle_time_tlv:.2f} seconds")

#     # Comparing the cycle times
#     if abs(cycle_time_mmc - cycle_time_tlv) > some_acceptable_difference:
#         print("Potential belt stretch detected")

#     time.sleep(0.1)  # Adjust as needed

import time
import board
import adafruit_mmc56x3
import adafruit_tlv493d

# Initialize I2C and sensors
i2c = board.I2C()
mmc_sensor = adafruit_mmc56x3.MMC5603(i2c)
tlv_sensor = adafruit_tlv493d.TLV493D(i2c)

print("Starting magnetic field data readings. Press Ctrl+C to stop.\n")

while True:
    # Current time
    current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())

    # Read magnetic field data from MMC5603 sensor
    mmc_x, mmc_y, mmc_z = mmc_sensor.magnetic

    # Read magnetic field data from TLV493D sensor
    tlv_x, tlv_y, tlv_z = tlv_sensor.magnetic

    # Print magnetic field data for MMC5603 sensor
    print(f"Time: {current_time}")
    print(f"MMC5603 - X: {mmc_x:.2f}, Y: {mmc_y:.2f}, Z: {mmc_z:.2f} uT")

    # Print magnetic field data for TLV493D sensor
    print(f"TLV493D - X: {tlv_x:.2f}, Y: {tlv_y:.2f}, Z: {tlv_z:.2f} uT")
    print("-" * 40)  # Separator

    # Wait before next reading
    time.sleep(0.5)
