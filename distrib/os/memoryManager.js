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
            if (memoryFill === void 0) { memoryFill = [false, false, false]; }
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
            if (_CPU.readData(segment, "00")[0] != "00") {
                return _CPU.writeProgram(segment, data);
            }
            else {
                _CPU.removeMemory(segment, 0, 255);
                return _CPU.writeProgram(segment, data);
            }
        };
        MemoryManager.prototype.getPBCsInfo = function () {
            var pbcsInfo = [];
            for (var _i = 0, _a = this.pcbs; _i < _a.length; _i++) {
                var pcb_1 = _a[_i];
                pbcsInfo.push(pcb_1.getInfo());
            }
            return pbcsInfo;
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
    var pcb = /** @class */ (function () {
        function pcb(
        // process states: new <0>, ready<1>, running<2>, waiting<3>, terminate<4>
        state, pid, priority, location, counter, limit_ct, accumulator, x_reg, y_reg, z_reg) {
            if (accumulator === void 0) { accumulator = 0; }
            if (x_reg === void 0) { x_reg = 0; }
            if (y_reg === void 0) { y_reg = 0; }
            if (z_reg === void 0) { z_reg = 0; }
            this.state = state;
            this.pid = pid;
            this.priority = priority;
            this.location = location;
            this.counter = counter;
            this.limit_ct = limit_ct;
            this.accumulator = accumulator;
            this.x_reg = x_reg;
            this.y_reg = y_reg;
            this.z_reg = z_reg;
        }
        pcb.prototype.updateCounter = function (newCounter) {
            this.counter = this.pad(newCounter.toString(16).toUpperCase(), 2);
        };
        pcb.prototype.updateStates = function (state) {
            this.state = state;
        };
        pcb.prototype.getPid = function () {
            return this.pid;
        };
        pcb.prototype.getCounter = function () {
            return this.counter;
        };
        pcb.prototype.getInfo = function () {
            return [this.pid, this.state, this.location, this.priority,
                this.counter, this.accumulator, this.x_reg, this.y_reg, this.z_reg];
        };
        pcb.prototype.pad = function (num, size) {
            var s = num + "";
            while (s.length < size)
                s = "0" + s;
            return s;
        };
        return pcb;
    }());
    TSOS.pcb = pcb;
})(TSOS || (TSOS = {}));
