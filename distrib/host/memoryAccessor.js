/* ------------
     MemoryAccessor.ts

     Routines for the Operating System, NOT the host.

     This code allows the access to the data store in memory
     ------------ */
var TSOS;
(function (TSOS) {
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor(nextChunk, memoryChunkNum, memoryChunkSize) {
            if (nextChunk === void 0) { nextChunk = 0; }
            if (memoryChunkNum === void 0) { memoryChunkNum = _Memory.getChunkNum(); }
            if (memoryChunkSize === void 0) { memoryChunkSize = _Memory.getChunkSize(); }
            this.nextChunk = nextChunk;
            this.memoryChunkNum = memoryChunkNum;
            this.memoryChunkSize = memoryChunkSize;
        }
        MemoryAccessor.prototype.init = function () {
        };
        MemoryAccessor.prototype.read = function (chunk, element) {
            return _Memory.readData(chunk, element);
        };
        MemoryAccessor.prototype.write = function (data) {
            return _Memory.writeData(_Memory.getNextChunk(), data);
        };
        MemoryAccessor.prototype.getChunkNum = function () {
            return this.memoryChunkNum;
        };
        MemoryAccessor.prototype.getChunkSize = function () {
            return this.memoryChunkSize;
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
