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
        memorySize, memoryArr, curEle) {
            if (memorySize === void 0) { memorySize = 8 * 256; }
            if (memoryArr === void 0) { memoryArr = []; }
            if (curEle === void 0) { curEle = 0; }
            this.memorySize = memorySize;
            this.memoryArr = memoryArr;
            this.curEle = curEle;
        }
        Memory.prototype.init = function () {
            this.memoryArr = new Array(this.memorySize).fill(0);
        };
        Memory.prototype.getMemorySize = function () {
            return this.memorySize;
        };
        Memory.prototype.writeData = function (binaryData) {
            var startIdx = this.curEle;
            for (var _i = 0, binaryData_1 = binaryData; _i < binaryData_1.length; _i++) {
                var data = binaryData_1[_i];
                if (this.curEle >= this.getMemorySize()) {
                    return [];
                }
                this.memoryArr[this.curEle] = data;
                this.curEle = this.curEle + 1;
            }
            return [startIdx, this.curEle];
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
            return [hexCodes.trim(), String(counter)];
        };
        Memory.prototype.getLoadMemory = function () {
            return this.memoryArr.slice();
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
