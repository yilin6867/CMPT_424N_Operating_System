/* ------------
     MemoryAccessor.ts

     Routines for the Operating System, NOT the host.

     This code allows the access to the data store in memory
     ------------ */
module TSOS {
    export class MemoryAccessor {
        constructor(
            public nextChunk: number = 0
            , public memoryChunkNum: number = _Memory.getChunkNum()
            , public memoryChunkSize: number = _Memory.getChunkSize()
        ) {
        }
        public init() {
        }

        public read(chunk: number, element: number) {
            return _Memory.readData(chunk, element);
        }

        public write(data: string[]) {
            return _Memory.writeData(_Memory.getNextChunk(), data);
        }
        public getChunkNum(): number {
            return this.memoryChunkNum
        }
        public getChunkSize(): number {
            return this.memoryChunkSize
        }
    }
}