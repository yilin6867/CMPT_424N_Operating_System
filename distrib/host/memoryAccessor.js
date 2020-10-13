/* ------------
     MemoryAccessor.ts

     Routines for the Operating System, NOT the host.

     This code allows the access to the data store in memory
     ------------ */
var TSOS;
(function (TSOS) {
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor(nextChunk, memorySize, hexArrSize, hexArrNum, segmentSize) {
            if (nextChunk === void 0) { nextChunk = 0; }
            if (memorySize === void 0) { memorySize = _Memory.getMemorySize(); }
            if (hexArrSize === void 0) { hexArrSize = 64; }
            if (hexArrNum === void 0) { hexArrNum = 32; }
            if (segmentSize === void 0) { segmentSize = 256 * 8; }
            this.nextChunk = nextChunk;
            this.memorySize = memorySize;
            this.hexArrSize = hexArrSize;
            this.hexArrNum = hexArrNum;
            this.segmentSize = segmentSize;
        }
        MemoryAccessor.prototype.init = function () {
        };
        MemoryAccessor.prototype.read = function (segment, counter, numCounter) {
            var opCodeSize = 8;
            var param = ["", ""];
            if (numCounter == null) {
                var i = 0;
                do {
                    var nextReturn = _Memory.readData(segment, (counter + i) * opCodeSize);
                    param[0] = param[0] + " " + nextReturn[0];
                    param[1] = nextReturn[1];
                    i = i + 1;
                } while (param[0].slice(param[0].length - 2, param[0].length) !== "00");
                return param;
            }
            else {
                for (var i = 0; i < numCounter; i++) {
                    var nextReturn = _Memory.readData(segment, (counter + i) * opCodeSize);
                    param[0] = nextReturn[0] + param[0];
                    param[1] = nextReturn[1];
                }
                return param;
            }
        };
        MemoryAccessor.prototype.write = function (segment, data, addr) {
            var start = segment * this.segmentSize;
            return _Memory.writeData(start, data, addr * 8);
        };
        MemoryAccessor.prototype.getMemorySize = function () {
            return this.memorySize;
        };
        MemoryAccessor.prototype.getLoadMemory = function (segment) {
            var index = segment * this.segmentSize;
            return _Memory.getLoadMemory(index);
        };
        MemoryAccessor.prototype.removeMemory = function (segment, start, end) {
            var startIdx = segment * this.segmentSize + start;
            end = end * 8;
            _Memory.remove(startIdx, end);
        };
        MemoryAccessor.prototype.getSegments = function () {
            return (_Memory.memoryArr.length / this.segmentSize);
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
