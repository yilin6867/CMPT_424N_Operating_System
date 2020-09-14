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
        ) {
        }
        public init() {
        }

        public read(chunk: number, counter: number) {
            let nibbleSize = 4;
            return _Memory.readData(chunk, counter * nibbleSize);
        }

        public write(data: string[]) {
            return _Memory.writeData(data);
        }
        public getMemorySize(): number {
            return this.memorySize;
        }
    }
}