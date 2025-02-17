import Picoboot, {PICOBOOT_EXCLUSIVE_MODES } from "./picoboot";

// Basic implementation of https://github.com/raspberrypi/picotool
// Only implemented functions needed
export default class Picotool{
    constructor(picoboot){
        this.picoboot = picoboot;
    }

    // https://github.com/raspberrypi/picotool?tab=readme-ov-file#load
    // Loads the uf2 data into respective flash locations
    async load(uf2Data, progressCB){
        // Connect
        await this.picoboot.connect([{vendorId: 0x2E8A, productId: 0x0003}, {vendorId: 0x2E8A, productId: 0x000F}]);

        // Get exclusive access to the USB interface and make
        // MSC file manager popup disappear
        await this.picoboot.exclusive(PICOBOOT_EXCLUSIVE_MODES.EXCLUSIVE_AND_EJECT);

        // Wireshark shows this after every erase and write but it seems to work by just doing it once
        await this.picoboot.exitXIP();

        // Used for storing and checking which sectors have
        // been erased. UF2 blocks can be in any order, need
        // to track them
        let erasedSectors = {};
        const erased = (address) => {
            const sectorIndex = Math.floor(address/this.picoboot.sectorSize);

            // Check if erased and then make sure it is marked erased
            const erased = sectorIndex in erasedSectors;
            erasedSectors[sectorIndex] = true;

            // Return if it was erased
            return erased;
        }

        // Cast to common `Uint8Array`
        const data = new Uint8Array(uf2Data);

        // https://github.com/microsoft/uf2
        const blockSize = 512;
        const blockCount = uf2Data.byteLength/blockSize;

        // Parse the UF2 block by block, extract the data sections
        // and write them to the device flash
        for(let i=0; i<blockCount; i++){
            const blockStartOffset = i*blockSize;
            const blockEndOffset   = blockStartOffset + blockSize;
            
            const block     = data.slice(blockStartOffset, blockEndOffset);
            const blockView = new DataView(block);

            const blockDataAddr = blockView.getUint32(12, true);
            const blockDataSize = blockView.getUint32(16, true);
            const blockData     = block.slice(32, 32+blockDataSize);

            // Erase sector containing where data will be written
            // if not already tracked as erased
            if(!erased(blockDataAddr)){
                await this.picoboot.flashEraseSector(blockDataAddr);
            }

            await this.picoboot.flashWrite(blockDataAddr, blockDataSize, blockData);

            if(progressCB) progressCB(i/blockCount);
        }

        // Figure out device type for correct reboot command, and then reboot
        const info = await this.picoboot.info();

        if(info.productName.indexOf("RP2") != -1){
            await this.picoboot.rebootRP2040();
        }else if(info.productName.indexOf("RP2350") != -1){
            await this.picoboot.rebootRP2350();
        }else{
            throw new Error("picotool.js: ERROR: Could not identify device based on product name, could not reboot!");
        }
    }
}