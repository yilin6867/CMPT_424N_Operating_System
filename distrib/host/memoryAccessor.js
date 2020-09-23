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
        MemoryAccessor.prototype.read = function (segment, counter, numCounter) {
            var opCodeSize = 8;
            var param = ["", ""];
            if (numCounter == null) {
                var i = 0;
                do {
                    var nextReturn = _Memory.readData(segment, (counter + i) * opCodeSize);
                    console.log("Read " + nextReturn);
                    param[0] = param[0] + " " + nextReturn[0];
                    param[1] = nextReturn[1];
                    console.log(param[0].slice(param[0].length - 2, param[0].length));
                    i = i + 1;
                } while (param[0].slice(param[0].length - 2, param[0].length) !== "00");
                return param;
            }
            else {
                for (var i = 0; i < numCounter; i++) {
                    var nextReturn = _Memory.readData(segment, (counter + i) * opCodeSize);
                    console.log("Read " + nextReturn);
                    param[0] = nextReturn[0] + param[0];
                    param[1] = nextReturn[1];
                }
                console.log("return  " + param);
                return param;
            }
        };
        MemoryAccessor.prototype.write = function (segment, data, addr) {
            return _Memory.writeData(segment, data, addr * 8);
        };
        MemoryAccessor.prototype.getMemorySize = function () {
            return this.memorySize;
        };
        MemoryAccessor.prototype.getLoadMemory = function (segment) {
            return _Memory.getLoadMemory(segment);
        };
        MemoryAccessor.prototype.removeMemory = function (segment, start, end) {
            console.log("remove at memory access stage");
            _Memory.remove(segment, start * 8, end * 8);
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
