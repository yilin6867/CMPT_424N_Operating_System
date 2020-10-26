/* ------------
     MemoryAccessor.ts

     Routines for the Operating System, NOT the host.

     This code allows the access to the data store in memory
     ------------ */
var TSOS;
(function (TSOS) {
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor(nextChunk, memorySize, hexArrSize, hexArrNum, bitSiz, segmentSize, segmentBitSize) {
            if (nextChunk === void 0) { nextChunk = 0; }
            if (memorySize === void 0) { memorySize = _Memory.getMemorySize(); }
            if (hexArrSize === void 0) { hexArrSize = 64; }
            if (hexArrNum === void 0) { hexArrNum = 32; }
            if (bitSiz === void 0) { bitSiz = 8; }
            if (segmentSize === void 0) { segmentSize = _Memory.segmentSize; }
            if (segmentBitSize === void 0) { segmentBitSize = _Memory.segmentSize * bitSiz; }
            this.nextChunk = nextChunk;
            this.memorySize = memorySize;
            this.hexArrSize = hexArrSize;
            this.hexArrNum = hexArrNum;
            this.bitSiz = bitSiz;
            this.segmentSize = segmentSize;
            this.segmentBitSize = segmentBitSize;
        }
        MemoryAccessor.prototype.init = function () {
        };
        MemoryAccessor.prototype.read = function (segment, counter, numCounter) {
            var opCodeSize = 8;
            var param = ["", ""];
            if (numCounter == null) {
                var i = 0;
                do {
                    var nextReturn = _Memory.readData((segment * this.segmentBitSize) + ((counter + i) * opCodeSize));
                    param[0] = param[0] + " " + nextReturn[0];
                    param[1] = nextReturn[1];
                    i = i + 1;
                } while (param[0].slice(param[0].length - 2, param[0].length) !== "00");
            }
            else {
                for (var i = 0; i < numCounter; i++) {
                    console.log("Segment Num ", (segment), "counter", counter, "i", i);
                    console.log("Segment", (segment * this.segmentBitSize), "counter", ((counter + i) * opCodeSize));
                    console.log("Memory read", (segment * this.segmentBitSize) + ((counter + i) * opCodeSize));
                    var nextReturn = _Memory.readData((segment * this.segmentBitSize) + ((counter + i) * opCodeSize));
                    param[0] = nextReturn[0] + param[0];
                    param[1] = nextReturn[1];
                }
            }
            if (parseInt(param[0], 16) < this.memorySize) {
                return param;
            }
            else {
                return [];
            }
        };
        MemoryAccessor.prototype.write = function (segment, data, addr) {
            var start = segment * this.segmentBitSize;
            return _Memory.writeData(start, data, addr * this.bitSiz);
        };
        MemoryAccessor.prototype.getMemorySize = function () {
            return this.memorySize;
        };
        MemoryAccessor.prototype.getLoadMemory = function (segment) {
            var index = segment * this.segmentBitSize;
            return _Memory.getLoadMemory(index);
        };
        MemoryAccessor.prototype.removeMemory = function (segment, start, end) {
            var startIdx = segment * this.segmentBitSize + start;
            end = startIdx + end * this.bitSiz;
            console.log(startIdx, end);
            _Memory.remove(startIdx, end);
        };
        MemoryAccessor.prototype.getSegments = function () {
            return (_Memory.memoryArr.length / this.segmentBitSize);
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
