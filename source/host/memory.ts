/* ------------
     memory.ts

     Routines for the host CPU simulation, NOT for the OS itself.

     This code creates the memory space of the Operating System
     ------------ */
module TSOS {
    export class Memory {
        constructor(
            // one bytes is 8 bits
            public memoryChunkSize = 8 
            // there is 256 bytes in total for the memory
            , public memoryChunckNum = 256
            , public memoryArr: string[][] = []
            , public curChunk = 0
            , public curEle = 0
        ) {

        }

        public init(): void {
            this.memoryArr = new Array(this.memoryChunckNum);
            for (let i = 0; i < this.memoryArr.length; i++) {
                this.memoryArr[i] = new Array(this.memoryChunkSize).fill(0);
            }
        }
        public getChunkNum(): number {
            return this.memoryChunckNum;
        }
        public getChunkSize(): number {
            return this.memoryChunkSize;
        }
        public getNextChunk(): number {
            return this.curChunk;
        }

        public writeData(chunkIdx: number, binaryData: string[]): number[] {
            let startChunk = this.curChunk;
            let startEle = this.curEle;
            for(let data of binaryData) {
                if (this.curEle >= this.memoryChunkSize) {
                    this.curEle = 0;
                    this.curChunk = this.curChunk + 1;
                }
                this.memoryArr[this.curChunk][this.curEle] = data;
                this.curEle = this.curEle + 1;
            }
            return [startChunk, startEle, this.curChunk, this.curEle];
        }

        public readData(startChunk: number, startEle: number) {
            let nextEle = 4;
            let hexCodes = ""
            let hex = ""
            do {
                for (let _ = 0; _ < 4; _++) {
                    let nibble  = parseInt(this.memoryArr[startChunk].slice(startEle, nextEle).join(""), 2);
                    hex = nibble.toString(16).toUpperCase();
                    hexCodes = hexCodes + hex + " ";
                    startEle = startEle + nextEle;
                    if(startEle >= this.memoryChunkSize) {
                        startChunk = startChunk + 1;
                    }
                }
            } while(hex != "00")
            return hexCodes.trim();
        }
    }
}