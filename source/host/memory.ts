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
            , public memoryArr: string[][] = [[]]
            , public curEle = 0
        ) {

        }

        public init(): void {
            for (let i = 0; i < this.memoryArr.length; i++) {
                this.memoryArr[i] = new Array(this.memorySize).fill(0);
            }
        }
        public getMemorySize(): number {
            return this.memorySize;
        }

        public writeData(segment: number, binaryData: string[], addr=null): number[] {
            let startIdx;
            if (addr != null) {
                startIdx = addr
            } else {
                startIdx = this.curEle
            }
            for(let data of binaryData) {
                if (addr != null) {
                    this.memoryArr[segment][addr] = data
                    addr = addr + 1
                } else {
                    if (this.curEle >= this.getMemorySize()) {
                        return []
                    }
                    this.memoryArr[segment][this.curEle] = data;
                    this.curEle = this.curEle + 1;
                }
            }
            return [startIdx, addr != null ? addr : this.curEle ];
        }

        public readData(segment: number, counter: number) {
            let nextEle = 4;
            let hexCodes = ""
            let hex = ""
            for (let _ = 0; _ < 2; _++) {
                let nibble  = parseInt(this.memoryArr[segment].slice(counter, counter+nextEle).join(""), 2);
                hex = nibble.toString(16).toUpperCase();
                hexCodes = hexCodes + hex;
                counter = counter + nextEle;
            }
            return [hexCodes.trim(), counter/8];
        }

        public getLoadMemory(segment:number): string[] {
            return this.memoryArr[segment].slice();
        }

        public remove(segment: number, start: number, end: number) {
            for (start < end; start ++;) {
                this.memoryArr[segment][start] = "0";
            }
        }
    }
}