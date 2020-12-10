/* ------------
     MemoryManager.ts

     Routines for the host CPU simulation, NOT for the OS itself.

     This code allows the Operating System to manage the memory
     ------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager(memorySize, memoryFill
        // false --> binary view
        , memoryHexView, readyQueue, residentQueue, tempFileIdx) {
            if (memorySize === void 0) { memorySize = _MemoryAccessor.getMemorySize(); }
            if (memoryFill === void 0) { memoryFill = new Array(_CPU.getMemorySegments()).fill(false); }
            if (memoryHexView === void 0) { memoryHexView = true; }
            if (readyQueue === void 0) { readyQueue = []; }
            if (residentQueue === void 0) { residentQueue = []; }
            if (tempFileIdx === void 0) { tempFileIdx = 1; }
            this.memorySize = memorySize;
            this.memoryFill = memoryFill;
            this.memoryHexView = memoryHexView;
            this.readyQueue = readyQueue;
            this.residentQueue = residentQueue;
            this.tempFileIdx = tempFileIdx;
        }
        MemoryManager.prototype.addPCB = function (newpcb) {
            this.residentQueue.push(newpcb);
        };
        MemoryManager.prototype.addPCBtoReady = function (pcb) {
            pcb.updateStates(2);
            this.readyQueue.push(pcb);
        };
        MemoryManager.prototype.removeReadyPCB = function (pcb) {
            this.readyQueue.splice(this.readyQueue.indexOf(pcb), 1);
        };
        MemoryManager.prototype.getPCBbyID = function (pid) {
            if (typeof this.residentQueue[parseInt(pid)] !== 'undefined') {
                return this.residentQueue[parseInt(pid)];
            }
            else {
                return null;
            }
        };
        MemoryManager.prototype.getNextPID = function () {
            return this.residentQueue.length;
        };
        MemoryManager.prototype.write = function (segment, data, priority) {
            if (segment === -1) {
                console.log("Date at memory manager", data);
                this.tempFileIdx = _Kernel.krnNextFreeFile();
                var filename = "temp_file" + this.tempFileIdx;
                var return_msg = _Kernel.krnCreateFile(filename);
                return_msg = _Kernel.krnWriteFile(filename, data, false);
                console.log(return_msg);
                if (return_msg[0] !== 0) {
                    return "Memory is full. Please format the harddrive with a file system to store the code or" +
                        " kill an existing process.";
                }
                else {
                    var newPCB = new TSOS.PCB(0, _MemoryManager.getNextPID(), priority, -1 * this.tempFileIdx, "0", 255);
                    _MemoryManager.addPCB(newPCB);
                    console.log(newPCB);
                    return [newPCB.getPid(), newPCB.location, newPCB.getCounter(), 0, 255];
                }
            }
            else {
                var newPCBInfo = _CPU.writeProgram(segment, data, priority);
                var newPCB = new TSOS.PCB(newPCBInfo[0], newPCBInfo[1], newPCBInfo[2], newPCBInfo[3], newPCBInfo[4].toString(16), newPCBInfo[5]);
                _MemoryManager.addPCB(newPCB);
                var writeReturn = [newPCB.getPid(), newPCB.location, newPCB.getCounter(), newPCBInfo[0], newPCBInfo[1]];
                var nextSegment = this.memoryFill.indexOf(false);
                if (nextSegment >= 0) {
                    this.memoryFill[this.memoryFill.indexOf(false)] = true;
                }
                writeReturn.push(segment);
                return writeReturn;
            }
        };
        MemoryManager.prototype.getPBCsInfo = function () {
            var pbcsInfo = [];
            for (var _i = 0, _a = this.residentQueue; _i < _a.length; _i++) {
                var pcb = _a[_i];
                pbcsInfo.push(pcb.getInfo());
            }
            return pbcsInfo;
        };
        MemoryManager.prototype.saveState = function (runningPCB) {
            if (runningPCB.state < 4) {
                this.residentQueue[runningPCB.pid].xReg = runningPCB.xReg;
                this.residentQueue[runningPCB.pid].yReg = runningPCB.yReg;
                this.residentQueue[runningPCB.pid].zReg = runningPCB.zReg;
                this.residentQueue[runningPCB.pid].state = runningPCB.state;
                this.residentQueue[runningPCB.pid].accumulator = runningPCB.accumulator;
                this.residentQueue[runningPCB.pid].counter = runningPCB.counter;
                this.residentQueue[runningPCB.pid].waitBurst = runningPCB.waitBurst;
                this.residentQueue[runningPCB.pid].cpuBurst = runningPCB.cpuBurst;
                this.residentQueue[runningPCB.pid].state = 1;
                this.readyQueue.push(runningPCB);
                console.log("save process ", _MemoryManager.readyQueue);
            }
        };
        MemoryManager.prototype.addWaitBurst = function () {
            for (var _i = 0, _a = this.readyQueue; _i < _a.length; _i++) {
                var pcb = _a[_i];
                pcb.waitBurst = pcb.waitBurst + 1;
            }
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
