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
        PCB.prototype.updateCounter = function (newCounter) {
            this.counter = this.pad(newCounter.toString(16).toUpperCase(), 2);
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
                this.counter, this.accumulator, this.x_reg, this.y_reg, this.z_reg];
        };
        PCB.prototype.pad = function (num, size) {
            var s = num + "";
            while (s.length < size)
                s = "0" + s;
            return s;
        };
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
