/* ------------
     memory.ts

     Routines for the host CPU simulation, NOT for the OS itself.

     This code creates the memory space of the Operating System
     ------------ */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory(memoryChunkSize, memoryChunckNum, memoryArr, curChunk, curEle) {
            if (memoryChunkSize === void 0) { memoryChunkSize = 256; }
            if (memoryChunckNum === void 0) { memoryChunckNum = 1028; }
            if (memoryArr === void 0) { memoryArr = []; }
            if (curChunk === void 0) { curChunk = 0; }
            if (curEle === void 0) { curEle = 0; }
            this.memoryChunkSize = memoryChunkSize;
            this.memoryChunckNum = memoryChunckNum;
            this.memoryArr = memoryArr;
            this.curChunk = curChunk;
            this.curEle = curEle;
        }
        Memory.prototype.init = function () {
            this.memoryArr = new Array(this.memoryChunckNum);
            for (var i = 0; i < this.memoryArr.length; i++) {
                this.memoryArr[i] = new Array(this.memoryChunkSize).fill(0);
            }
        };
        Memory.prototype.getChunkNum = function () {
            return this.memoryChunckNum;
        };
        Memory.prototype.getChunkSize = function () {
            return this.memoryChunkSize;
        };
        Memory.prototype.getNextChunk = function () {
            return this.curChunk;
        };
        Memory.prototype.writeData = function (chunkIdx, binaryData) {
            var startChunk = this.curChunk;
            var startEle = this.curEle;
            for (var _i = 0, binaryData_1 = binaryData; _i < binaryData_1.length; _i++) {
                var data = binaryData_1[_i];
                if (this.curEle >= this.memoryChunkSize) {
                    this.curEle = 0;
                    this.curChunk = this.curChunk + 1;
                }
                this.memoryArr[this.curChunk][this.curEle] = data;
                console.log(this.memoryArr[this.curChunk][this.curEle]);
                this.curEle = this.curEle + 1;
            }
            return [startChunk, startEle, this.curChunk, this.curEle];
        };
        Memory.prototype.readData = function (startChunk, startEle) {
            var nextEle = 4;
            var hexCodes = "";
            var hex = "";
            do {
                for (var _ = 0; _ < 4; _++) {
                    var nibble = parseInt(this.memoryArr[startChunk].slice(startEle, nextEle).join(""), 2);
                    hex = nibble.toString(16).toUpperCase();
                    hexCodes = hexCodes + hex + " ";
                    startEle = startEle + nextEle;
                    if (startEle >= this.memoryChunkSize) {
                        startChunk = startChunk + 1;
                    }
                }
            } while (hex != "00");
            return hexCodes.trim();
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
