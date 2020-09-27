/* ------------
     MemoryManager.ts

     Routines for the host CPU simulation, NOT for the OS itself.

     This code allows the Operating System to manage the memory
     ------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager(pcbs, memorySize, memoryFill
        // false --> binary view
        , memoryHexView) {
            if (pcbs === void 0) { pcbs = new Array(); }
            if (memorySize === void 0) { memorySize = _MemoryAccessor.getMemorySize(); }
            if (memoryFill === void 0) { memoryFill = new Array(_CPU.getMemorySegments()).fill(false); }
            if (memoryHexView === void 0) { memoryHexView = true; }
            this.pcbs = pcbs;
            this.memorySize = memorySize;
            this.memoryFill = memoryFill;
            this.memoryHexView = memoryHexView;
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
                _CPU.removeMemory(segment, 0, this.memorySize);
                this.pcbs[this.pcbs.length - 1].updateStates(4);
            }
            var writeReturn = _CPU.writeProgram(segment, data);
            var nextSegment = this.memoryFill.indexOf(false);
            if (nextSegment >= 0) {
                this.memoryFill[this.memoryFill.indexOf(false)] = true;
            }
            writeReturn.push(segment);
            return writeReturn;
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
