# tinycircuits.js
This is a repository of common JavaScript modules used throughout TinyCircuits online products.

## Modules:
* `picoboot.js`: WebUSB module that connects to RP2040/RP2350 devices and interacts with them through the USB PICOBOOT interface. Includes some convenience functions
* `picotool.js`: Basic implementation of https://github.com/raspberrypi/picotool using `picoboot.js`
* `pyboard.js`: Basic and extended implementation of https://github.com/micropython/micropython/blob/master/tools/pyboard.py
* `serial.js`: Custom abstraction over WebSerial that is a little more convenient for connecting, disconnecting, writing, and reading

## Running tests manually individually
`npx http-server -d` then navigate to each test and follow the instructions

## Running all tests
TODO