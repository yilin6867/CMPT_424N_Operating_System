/* ------------
     MemoryAccessor.ts

     Routines for the Operating System, NOT the host.

     This code allows the access to the data store in memory
     ------------ */
var TSOS;
(function (TSOS) {
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor(nextChunk, memorySize, hexArrSize, hexArrNum) {
            if (nextChunk === void 0) { nextChunk = 0; }
            if (memorySize === void 0) { memorySize = _Memory.getMemorySize(); }
            if (hexArrSize === void 0) { hexArrSize = 64; }
            if (hexArrNum === void 0) { hexArrNum = 32; }
            this.nextChunk = nextChunk;
            this.memorySize = memorySize;
            this.hexArrSize = hexArrSize;
            this.hexArrNum = hexArrNum;
        }
        MemoryAccessor.prototype.init = function () {
        };
        MemoryAccessor.prototype.read = function (counter) {
            var nibbleSize = 4;
            return _Memory.readData(counter * nibbleSize);
        };
        MemoryAccessor.prototype.write = function (data) {
            return _Memory.writeData(data);
        };
        MemoryAccessor.prototype.getMemorySize = function () {
            return this.memorySize;
        };
        MemoryAccessor.prototype.getLoadMemory = function () {
            return _Memory.getLoadMemory();
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
