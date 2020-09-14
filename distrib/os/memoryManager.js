/* ------------
     MemoryManager.ts

     Routines for the host CPU simulation, NOT for the OS itself.

     This code allows the Operating System to manage the memory
     ------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager(pcbs, memoryChunkSize) {
            if (pcbs === void 0) { pcbs = new Map(); }
            if (memoryChunkSize === void 0) { memoryChunkSize = _MemoryAccessor.getChunkSize(); }
            this.pcbs = pcbs;
            this.memoryChunkSize = memoryChunkSize;
        }
        MemoryManager.prototype.addPCB = function (newpcb) {
            this.pcbs.set(newpcb.getPid(), newpcb);
        };
        MemoryManager.prototype.getPCBbyID = function (pid) {
            this.pcbs.get(pid);
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
        pState, pid, chunk, element, register) {
            if (register === void 0) { register = null; }
            this.pState = pState;
            this.pid = pid;
            this.chunk = chunk;
            this.element = element;
            this.register = register;
        }
        pcb.prototype.updatePcounter = function (curChunk, curElement) {
            this.chunk = curChunk;
            this.element = curElement;
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
        pcb.prototype.getChunk = function () {
            return this.chunk;
        };
        pcb.prototype.getElement = function () {
            return this.element;
        };
        return pcb;
    }());
    TSOS.pcb = pcb;
})(TSOS || (TSOS = {}));
