/* ------------
     MemoryManager.ts

     Routines for the host CPU simulation, NOT for the OS itself.

     This code allows the Operating System to manage the memory
     ------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager(pcbs, memorySize, memoryFill) {
            if (pcbs === void 0) { pcbs = new Array(); }
            if (memorySize === void 0) { memorySize = _MemoryAccessor.getMemorySize(); }
            if (memoryFill === void 0) { memoryFill = [false]; }
            this.pcbs = pcbs;
            this.memorySize = memorySize;
            this.memoryFill = memoryFill;
        }
        MemoryManager.prototype.addPCB = function (newpcb) {
            this.pcbs.push(newpcb);
        };
        MemoryManager.prototype.getPCBbyID = function (pid) {
            if (typeof this.pcbs[parseInt(pid)] !== 'undefined') {
                return this.pcbs[parseInt(pid)];
            }
            else {
                return "There is not user program with pid of " + pid;
            }
        };
        MemoryManager.prototype.getNextPID = function () {
            return this.pcbs.length;
        };
        MemoryManager.prototype.write = function (segment, data) {
            if (segment === -1) {
                segment = 0;
            }
            console.log("Read first counter " + _CPU.readData(segment, "00"));
            console.log(_CPU.readData(segment, "00")[0] === "00");
            if (_CPU.readData(segment, "00")[0] === "00") {
                var writeReturn = _CPU.writeProgram(segment, data);
                this.memoryFill[_MemoryManager.memoryFill.indexOf(false)] = true;
                return writeReturn;
            }
            else {
                console.log("Start removing memory at ", segment, 0, 255);
                _CPU.removeMemory(segment, 0, 255);
                return _CPU.writeProgram(segment, data);
            }
        };
        MemoryManager.prototype.getPBCsInfo = function () {
            var pbcsInfo = [];
            for (var _i = 0, _a = this.pcbs; _i < _a.length; _i++) {
                var pcb = _a[_i];
                pbcsInfo.push(pcb.getInfo());
            }
            return pbcsInfo;
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
