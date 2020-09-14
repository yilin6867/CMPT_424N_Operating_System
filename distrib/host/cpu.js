/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Cpu = /** @class */ (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
        };
        Cpu.prototype.writeData = function (data) {
            var opcodes = data.split(" ");
            var binaryCodes = [];
            for (var _i = 0, opcodes_1 = opcodes; _i < opcodes_1.length; _i++) {
                var code = opcodes_1[_i];
                for (var i = 0; i < code.length; i++) {
                    var binary = ("0000" + (parseInt(code.charAt(i), 16)).toString(2));
                    var nibble = binary.substr(binary.length - 4);
                    binaryCodes.push(nibble);
                }
            }
            var binaryCode = binaryCodes.join("").split("");
            console.log(binaryCode);
            var writeInfo = _MemoryAccessor.write(binaryCode);
            var newPCB = new TSOS.pcb(1, _MemoryManager.getNextPID(), writeInfo[0], writeInfo[1]);
            _MemoryManager.addPCB(newPCB);
            return [newPCB.getPid(), newPCB.getChunk() * 8 + newPCB.getElement()];
        };
        Cpu.prototype.readData = function (pid) {
            var readPBC = _MemoryManager.getPCBbyID(pid);
            var startChunk = readPBC.getChunk();
            var startEle = readPBC.getElement();
            var user_program = _MemoryAccessor.read(startChunk, startEle);
            return user_program;
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
