import Picoboot from "/picoboot.js"
import { log } from "/tests/utility.js";

// Always log test name to console
console.log("--- picoboot-connect.test.js ---")
log("Step #1: Make sure to put RP240/RP2350 device into BOOTSEL mode...");
log("Step #2: Click 'Run test' button...");

// Wait for user input to run test
document.getElementById('runbtn').addEventListener('click', async () => {

    log("Step #3: Select device and click connect...");
    log("WAITING: User should select device and click connect...");
    const picoboot = new Picoboot();
    await picoboot.connect([{vendorId: 0x2E8A, productId: 0x0003}, {vendorId: 0x2E8A, productId: 0x000F}]);
    log("SUCCESS: Connected!");
});