/* ------------
     MemoryManager.ts

     Routines for the host CPU simulation, NOT for the OS itself.

     This code allows the Operating System to manage the memory
     ------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager(resident_queue, memorySize, memoryFill
        // false --> binary view
        , memoryHexView, readyQueue, residentQueue) {
            if (resident_queue === void 0) { resident_queue = new Array(); }
            if (memorySize === void 0) { memorySize = _MemoryAccessor.getMemorySize(); }
            if (memoryFill === void 0) { memoryFill = new Array(_CPU.getMemorySegments()).fill(false); }
            if (memoryHexView === void 0) { memoryHexView = true; }
            if (readyQueue === void 0) { readyQueue = []; }
            if (residentQueue === void 0) { residentQueue = []; }
            this.resident_queue = resident_queue;
            this.memorySize = memorySize;
            this.memoryFill = memoryFill;
            this.memoryHexView = memoryHexView;
            this.readyQueue = readyQueue;
            this.residentQueue = residentQueue;
        }
        MemoryManager.prototype.addPCB = function (newpcb) {
            this.resident_queue.push(newpcb);
        };
        MemoryManager.prototype.addPCBtoReady = function (pcb) {
            pcb.updateStates(2);
            this.readyQueue.push(pcb);
        };
        MemoryManager.prototype.removeReadyPCB = function (pcb) {
            this.readyQueue.splice(this.readyQueue.indexOf(pcb), 1);
        };
        MemoryManager.prototype.getPCBbyID = function (pid) {
            if (typeof this.resident_queue[parseInt(pid)] !== 'undefined') {
                return this.resident_queue[parseInt(pid)];
            }
            else {
                return null;
            }
        };
        MemoryManager.prototype.getNextPID = function () {
            return this.resident_queue.length;
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
            for (var _i = 0, _a = this.resident_queue; _i < _a.length; _i++) {
                var pcb = _a[_i];
                pbcsInfo.push(pcb.getInfo());
            }
            return pbcsInfo;
        };
        MemoryManager.prototype.saveState = function (runningPCB) {
            if (runningPCB.state < 4) {
                this.resident_queue[runningPCB.pid].xReg = runningPCB.xReg;
                this.resident_queue[runningPCB.pid].yReg = runningPCB.yReg;
                this.resident_queue[runningPCB.pid].zReg = runningPCB.zReg;
                this.resident_queue[runningPCB.pid].state = runningPCB.state;
                this.resident_queue[runningPCB.pid].accumulator = runningPCB.accumulator;
                this.resident_queue[runningPCB.pid].counter = runningPCB.counter;
                this.resident_queue[runningPCB.pid].waitBurst = runningPCB.waitBurst;
                this.resident_queue[runningPCB.pid].cpuBurst = runningPCB.cpuBurst;
                this.resident_queue[runningPCB.pid].state = 1;
                this.readyQueue.push(runningPCB);
                console.log("save process ", _MemoryManager.readyQueue);
            }
        };
        MemoryManager.prototype.addWaitBurst = function () {
            console.log(this.readyQueue);
            for (var _i = 0, _a = this.readyQueue; _i < _a.length; _i++) {
                var pcb = _a[_i];
                pcb.waitBurst = pcb.waitBurst + 1;
            }
            console.log(this.readyQueue);
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
