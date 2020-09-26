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
                    let nextReturn: any[] = _Memory.readData(segment, (counter + i) * opCodeSize);
                    console.log("Read "+ nextReturn)
                    param[0] = param[0] + " " + nextReturn[0]
                    param[1] = nextReturn[1]
                    console.log(param[0].slice(param[0].length -2 , param[0].length))
                    i = i + 1
                } while (param[0].slice(param[0].length -2 , param[0].length) !== "00")
                return param;
            } else {
                for (let i = 0; i < numCounter; i++) {
                    let nextReturn: any[] = _Memory.readData(segment, (counter + i) * opCodeSize);
                    console.log("Read "+ nextReturn)
                    param[0] = nextReturn[0] + param[0]
                    param[1] = nextReturn[1]
                }   
                console.log("return  "+ param)
                return param
            }
        }

        public write(segment: number, data: string[], addr: number) {
            return _Memory.writeData(segment, data, addr * 8);
        }
        public getMemorySize(): number {
            return this.memorySize;
        }

        public getLoadMemory(segment: number) {
            return _Memory.getLoadMemory(segment);
        }

        public removeMemory(segment:number, start:number, end:number) {
            _Memory.remove(segment, start, end);
        }

        public getSegments() {
            return _Memory.memoryArr.length;
        }
    }
}