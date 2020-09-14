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

        public writeData(binaryData: string[]): number[] {
            let startIdx = this.curEle;
            for(let data of binaryData) {
                if (this.curEle >= this.getMemorySize()) {
                    return []
                }
                this.memoryArr[this.curEle] = data;
                this.curEle = this.curEle + 1;
            }
            return [startIdx, this.curEle];
        }

        public readData(startChunk: number, counter: number) {
            let nextEle = 4;
            let hexCodes = ""
            let hex = ""
            for (let _ = 0; _ < 2; _++) {
                let nibble  = parseInt(this.memoryArr.slice(counter, counter+nextEle).join(""), 2);
                hex = nibble.toString(16).toUpperCase();
                console.log(counter, nextEle)
                console.log(this.memoryArr.slice(counter, nextEle).join(""), nibble, hex)
                hexCodes = hexCodes + hex
                counter = counter + nextEle;
            }
            return [hexCodes.trim(), nextEle];
        }
    }
}