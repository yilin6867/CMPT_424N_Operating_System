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
        , memoryHexView, readyQueue, residentQueue, quantum) {
            if (pcbs === void 0) { pcbs = new Array(); }
            if (memorySize === void 0) { memorySize = _MemoryAccessor.getMemorySize(); }
            if (memoryFill === void 0) { memoryFill = new Array(_CPU.getMemorySegments()).fill(false); }
            if (memoryHexView === void 0) { memoryHexView = true; }
            if (readyQueue === void 0) { readyQueue = []; }
            if (residentQueue === void 0) { residentQueue = []; }
            if (quantum === void 0) { quantum = 6; }
            this.pcbs = pcbs;
            this.memorySize = memorySize;
            this.memoryFill = memoryFill;
            this.memoryHexView = memoryHexView;
            this.readyQueue = readyQueue;
            this.residentQueue = residentQueue;
            this.quantum = quantum;
        }
        MemoryManager.prototype.addPCB = function (newpcb) {
            this.pcbs.push(newpcb);
        };
        MemoryManager.prototype.addPCBtoReady = function (pcb) {
            pcb.updateStates(2);
            this.readyQueue.push(pcb);
        };
        MemoryManager.prototype.removeReadyPCB = function (pcb) {
            this.readyQueue.splice(this.readyQueue.indexOf(pcb), 1);
        };
        MemoryManager.prototype.getPCBbyID = function (pid) {
            if (typeof this.pcbs[parseInt(pid)] !== 'undefined') {
                return this.pcbs[parseInt(pid)];
            }
            else {
                return null;
            }
        };
        MemoryManager.prototype.getNextPID = function () {
            return this.pcbs.length;
        };
        MemoryManager.prototype.write = function (segment, data) {
            if (segment === -1) {
                return "All memory segments are occupied by some process." +
                    " Please kill or run a process to release the memory.";
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
        MemoryManager.prototype.shortTermSchedule = function (curPCB) {
            if (this.quantum == 0) {
                console.log("Schedule next process");
                console.log(_Memory.memoryArr);
                this.quantum = 6;
                this.saveState(curPCB);
                var nextProcess = this.readyQueue.shift();
                console.log(nextProcess);
                _Kernel.krnRunProgram(nextProcess.getPid().toString());
            }
        };
        MemoryManager.prototype.saveState = function (runningPCB) {
            this.pcbs[runningPCB.pid].x_reg = runningPCB.x_reg;
            this.pcbs[runningPCB.pid].y_reg = runningPCB.y_reg;
            this.pcbs[runningPCB.pid].z_reg = runningPCB.z_reg;
            this.pcbs[runningPCB.pid].state = runningPCB.state;
            this.pcbs[runningPCB.pid].accumulator = runningPCB.accumulator;
            this.pcbs[runningPCB.pid].counter = runningPCB.counter;
            this.readyQueue.push(runningPCB);
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
