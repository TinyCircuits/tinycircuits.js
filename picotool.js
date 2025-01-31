// Basic implementation of https://github.com/raspberrypi/picotool
// Only implemented functions needed
class Picotool{
    constructor(picoboot){
        this.picoboot = picoboot;
    }

    // https://github.com/raspberrypi/picotool?tab=readme-ov-file#load
    // Loads the binary to the start of flash (not very flexible implementation)
    async load(uf2Data){
        if(!this.picoboot.connected()){
            return;
        }

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
                this.picoboot.flashEraseSector(blockDataAddr);
            }

            this.picoboot.flashWrite(blockDataAddr, blockDataSize, blockData);
        }
    }
}