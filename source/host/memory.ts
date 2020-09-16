/* ------------
     memory.ts

     Routines for the host CPU simulation, NOT for the OS itself.

     This code creates the memory space of the Operating System
     ------------ */
module TSOS {
    export class Memory {
        constructor(
            // one bytes is 8 bits
            // there is 256 bytes in total for the memory
            public memorySize = 8 * 256
            , public memoryArr: string[] = []
            , public curEle = 0
        ) {

        }

        public init(): void {
            this.memoryArr = new Array(this.memorySize).fill(0);
        }
        public getMemorySize(): number {
            return this.memorySize;
        }

        public writeData(binaryData: string[], addr): number[] {
            let startIdx = this.curEle;
            for(let data of binaryData) {
                if (addr != null) {
                    this,this.memoryArr[addr] = data
                    addr = addr + 1
                } else {
                    if (this.curEle >= this.getMemorySize()) {
                        return []
                    }
                    this.memoryArr[this.curEle] = data;
                    this.curEle = this.curEle + 1;
                }
            }
            return [startIdx, this.curEle];
        }

        public readData(counter: number) {
            let nextEle = 4;
            let hexCodes = ""
            let hex = ""
            for (let _ = 0; _ < 2; _++) {
                let nibble  = parseInt(this.memoryArr.slice(counter, counter+nextEle).join(""), 2);
                hex = nibble.toString(16).toUpperCase();
                hexCodes = hexCodes + hex;
                counter = counter + nextEle;
            }
            console.log("read data " + hexCodes + " for counter " + counter)
            return [hexCodes.trim(), String(counter)];
        }

        public getLoadMemory(): string[] {
            return this.memoryArr.slice();
        }
    }
}