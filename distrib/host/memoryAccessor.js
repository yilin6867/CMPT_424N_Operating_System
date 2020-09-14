/* ------------
     MemoryAccessor.ts

     Routines for the Operating System, NOT the host.

     This code allows the access to the data store in memory
     ------------ */
var TSOS;
(function (TSOS) {
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor(nextChunk, memorySize) {
            if (nextChunk === void 0) { nextChunk = 0; }
            if (memorySize === void 0) { memorySize = _Memory.getMemorySize(); }
            this.nextChunk = nextChunk;
            this.memorySize = memorySize;
        }
        MemoryAccessor.prototype.init = function () {
        };
        MemoryAccessor.prototype.read = function (chunk, counter) {
            var nibbleSize = 4;
            return _Memory.readData(chunk, counter * nibbleSize);
        };
        MemoryAccessor.prototype.write = function (data) {
            return _Memory.writeData(data);
        };
        MemoryAccessor.prototype.getMemorySize = function () {
            return this.memorySize;
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
