/* ------------
     MemoryAccessor.ts

     Routines for the Operating System, NOT the host.

     This code allows the access to the data store in memory
     ------------ */
module TSOS {
    export class MemoryAccessor {
        constructor(
            public nextChunk: number = 0
            , public memorySize: number = _Memory.getMemorySize()
            , public hexArrSize: number = 64
            , public hexArrNum: number = 32
            , public bitSiz: number = 8
            , public segmentBitSize: number = 256 * bitSiz
            
        ) {
        }
        public init() {
        }

        public read(segment: number, counter: number, numCounter: number) {
            let opCodeSize = 8;
            let param = ["", ""];
            if (numCounter == null) {
                let i = 0
                do {
                    let nextReturn: any[] = _Memory.readData((segment * this.segmentBitSize) + ((counter + i) * opCodeSize));
                    param[0] = param[0] + " " + nextReturn[0]
                    param[1] = nextReturn[1]
                    i = i + 1
                } while (param[0].slice(param[0].length -2 , param[0].length) !== "00")
                return param;
            } else {
                for (let i = 0; i < numCounter; i++) {
                    console.log("Segment Num ", (segment), "counter", counter, "i", i)
                    console.log("Segment", (segment * this.segmentBitSize), "counter", ((counter + i) * opCodeSize))
                    console.log("Memory read", (segment * this.segmentBitSize) + ((counter + i) * opCodeSize))
                    let nextReturn: any[] = _Memory.readData((segment * this.segmentBitSize) + ((counter + i) * opCodeSize));
                    param[0] = nextReturn[0] + param[0]
                    param[1] = nextReturn[1]
                }
                return param
            }
        }

        public write(segment: number, data: string[], addr: number) {
            let start = segment * this.segmentBitSize
            return _Memory.writeData(start, data, addr * this.bitSiz);
        }
        public getMemorySize(): number {
            return this.memorySize;
        }

        public getLoadMemory(segment: number) {
            let index = segment * this.segmentBitSize
            return _Memory.getLoadMemory(index);
        }

        public removeMemory(segment:number, start:number, end:number) {
            let startIdx = segment * this.segmentBitSize  + start
            end = startIdx + end * this.bitSiz
            console.log(startIdx, end)
            _Memory.remove(startIdx, end);
        }

        public getSegments() {
            return (_Memory.memoryArr.length / this.segmentBitSize);
        }
    }
}