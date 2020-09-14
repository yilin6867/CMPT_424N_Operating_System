/* ------------
     MemoryManager.ts

     Routines for the host CPU simulation, NOT for the OS itself.

     This code allows the Operating System to manage the memory
     ------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager(pcbs, memorySize) {
            if (pcbs === void 0) { pcbs = new Map(); }
            if (memorySize === void 0) { memorySize = _MemoryAccessor.getMemorySize(); }
            this.pcbs = pcbs;
            this.memorySize = memorySize;
        }
        MemoryManager.prototype.addPCB = function (newpcb) {
            this.pcbs.set(newpcb.getPid(), newpcb);
        };
        MemoryManager.prototype.getPCBbyID = function (pid) {
            return this.pcbs.get(parseInt(pid));
        };
        MemoryManager.prototype.getNextPID = function () {
            return this.pcbs.size;
        };
        MemoryManager.prototype.readData = function (pid) {
            return _CPU.readData(pid);
        };
        MemoryManager.prototype.write = function (data) {
            return _CPU.writeData(data);
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
    var pcb = /** @class */ (function () {
        function pcb(
        // process states: new <1>, ready<2>, running<3>, waiting<4>, terminate<5>
        pState, pid, based_address, counter, register) {
            if (counter === void 0) { counter = 0; }
            if (register === void 0) { register = null; }
            this.pState = pState;
            this.pid = pid;
            this.based_address = based_address;
            this.counter = counter;
            this.register = register;
        }
        pcb.prototype.updatePcounter = function (newCounter) {
            this.counter = newCounter;
        };
        pcb.prototype.updateStates = function (pState) {
            this.pState = pState;
        };
        pcb.prototype.updateRegister = function (value) {
            this.register = value;
        };
        pcb.prototype.getPid = function () {
            return this.pid;
        };
        pcb.prototype.getBasedAddr = function () {
            return this.based_address;
        };
        pcb.prototype.getCounter = function () {
            return this.counter;
        };
        return pcb;
    }());
    TSOS.pcb = pcb;
})(TSOS || (TSOS = {}));
