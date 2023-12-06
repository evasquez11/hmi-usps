import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)

sensor_pin = 4  # GPIO pin for the sensor

GPIO.setup(sensor_pin, GPIO.IN)

def callback(channel):
    if GPIO.input(sensor_pin):
        print("Sensor Value: 1 (Active)")
    else:
        print("Sensor Value: 0 (Inactive)")

GPIO.add_event_detect(sensor_pin, GPIO.BOTH, callback=callback)

print("Sensor test script is running. Press Ctrl+C to exit.")

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("\nScript terminated by user.")
finally:
    GPIO.cleanup()

