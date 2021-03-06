/* ------------
     memory.ts

     Routines for the host CPU simulation, NOT for the OS itself.

     This code creates the memory space of the Operating System
     ------------ */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory(
        // one bytes is 8 bits
        // there is 256 bytes in total for the memory
        memorySize, memoryArr, segmentSize, curEle) {
            if (memorySize === void 0) { memorySize = 8 * 768; }
            if (memoryArr === void 0) { memoryArr = []; }
            if (segmentSize === void 0) { segmentSize = 256; }
            if (curEle === void 0) { curEle = 0; }
            this.memorySize = memorySize;
            this.memoryArr = memoryArr;
            this.segmentSize = segmentSize;
            this.curEle = curEle;
            this.memoryArr = new Array(this.memorySize).fill("0");
        }
        Memory.prototype.getMemorySize = function () {
            return this.memorySize;
        };
        Memory.prototype.writeData = function (segment, binaryData, addr) {
            if (addr === void 0) { addr = null; }
            var startIdx;
            if (addr != null) {
                startIdx = addr;
            }
            else {
                startIdx = this.curEle;
            }
            for (var _i = 0, binaryData_1 = binaryData; _i < binaryData_1.length; _i++) {
                var data = binaryData_1[_i];
                if (addr != null) {
                    this.memoryArr[segment + addr] = data;
                    addr = addr + 1;
                }
                else {
                    if (this.curEle >= this.getMemorySize()) {
                        return [];
                    }
                    this.memoryArr[segment + this.curEle] = data;
                    this.curEle = this.curEle + 1;
                }
            }
            return [startIdx, (addr != null ? addr : this.curEle) / 8];
        };
        Memory.prototype.readData = function (counter) {
            var nextEle = 4;
            var hexCodes = "";
            var hex = "";
            for (var _ = 0; _ < 2; _++) {
                var nibble = parseInt(this.memoryArr.slice(counter, counter + nextEle).join(""), 2);
                hex = nibble.toString(16).toUpperCase();
                hexCodes = hexCodes + hex;
                counter = counter + nextEle;
            }
            return [hexCodes.trim(), (counter / 8) % this.segmentSize];
        };
        Memory.prototype.getLoadMemory = function (segment) {
            return this.memoryArr.slice(segment, segment + 256 * 8);
        };
        Memory.prototype.remove = function (start, end) {
            for (var memoryIdx = start; memoryIdx < end; memoryIdx++) {
                this.memoryArr[memoryIdx] = "0";
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
