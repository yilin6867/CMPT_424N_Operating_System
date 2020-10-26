/* ------------
     MemoryManager.ts

     Routines for the host CPU simulation, NOT for the OS itself.

     This code allows the Operating System to create Process Control Block for each process
     ------------ */
var TSOS;
(function (TSOS) {
    var PCB = /** @class */ (function () {
        function PCB(
        // process states: new <0>, ready<1>, running<2>, waiting<3>, terminate<4>
        state, pid, priority, location, counter, limit_ct, accumulator, xReg, yReg, zReg, cpuBurst, waitBurst) {
            if (accumulator === void 0) { accumulator = 0; }
            if (xReg === void 0) { xReg = 0; }
            if (yReg === void 0) { yReg = 0; }
            if (zReg === void 0) { zReg = 0; }
            if (cpuBurst === void 0) { cpuBurst = 0; }
            if (waitBurst === void 0) { waitBurst = 0; }
            this.state = state;
            this.pid = pid;
            this.priority = priority;
            this.location = location;
            this.counter = counter;
            this.limit_ct = limit_ct;
            this.accumulator = accumulator;
            this.xReg = xReg;
            this.yReg = yReg;
            this.zReg = zReg;
            this.cpuBurst = cpuBurst;
            this.waitBurst = waitBurst;
        }
        PCB.prototype.updateCounter = function (newCounter) {
            this.counter = pad(newCounter.toString(16).toUpperCase(), 2);
        };
        PCB.prototype.updateStates = function (state) {
            this.state = state;
        };
        PCB.prototype.getPid = function () {
            return this.pid;
        };
        PCB.prototype.getCounter = function () {
            return this.counter;
        };
        PCB.prototype.getInfo = function () {
            return [this.pid, this.state, this.location, this.priority,
                this.counter, this.accumulator, this.xReg, this.yReg, this.zReg];
        };
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
