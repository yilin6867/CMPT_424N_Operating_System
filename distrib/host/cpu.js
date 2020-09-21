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
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting, runningPCB, singleStep) {
            if (PC === void 0) { PC = "00"; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 1; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (runningPCB === void 0) { runningPCB = null; }
            if (singleStep === void 0) { singleStep = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.runningPCB = runningPCB;
            this.singleStep = singleStep;
        }
        Cpu.prototype.init = function () {
            this.PC = "00";
            this.Acc = "00";
            this.Xreg = "00";
            this.Yreg = "00";
            this.Zflag = 1;
            this.isExecuting = false;
            this.singleStep = false;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            if (this.runningPCB.state < 4) {
                this.runningPCB.state = 1;
                var counter = parseInt(this.runningPCB.getCounter(), 16);
                var returnValues = _MemoryAccessor.read(counter);
                var hexicode = returnValues[0];
                this.updateCounters(returnValues[1]);
                var nextCounter = parseInt(this.runningPCB.getCounter(), 16);
                var nextReturn = _MemoryAccessor.read(nextCounter);
                this.runningPCB.updateStates(2);
                console.log("running " + hexicode + " at " + this.pad(counter.toString(16).toUpperCase(), 2)
                    + " next counter" + this.PC);
                switch (hexicode) {
                    case "A9":
                        this.ldaConst(nextReturn[0]);
                        this.updateCounters(nextReturn[1]);
                        break;
                    case "AD":
                        this.ldaVar(nextReturn[0]);
                        this.updateCounters(nextReturn[1]);
                        break;
                    case "8D":
                        this.store(nextReturn[0]);
                        this.updateCounters(nextReturn[1]);
                        break;
                    case "6D":
                        var addResult = this.add(nextReturn[0]);
                        this.Acc = addResult;
                        this.runningPCB.accumulator = addResult;
                        this.updateCounters(nextReturn[1]);
                        break;
                    case "A2":
                        this.storeXReg(nextReturn[0]);
                        this.updateCounters(nextReturn[1]);
                        break;
                    case "AE":
                        this.storeXRegVar(nextReturn[0]);
                        this.updateCounters(nextReturn[1]);
                        break;
                    case "A0":
                        this.storeYReg(nextReturn[0]);
                        this.updateCounters(nextReturn[1]);
                        break;
                    case "AC":
                        this.storeYRegVar(nextReturn[0]);
                        this.updateCounters(nextReturn[1]);
                        break;
                    case "EA":
                        this.updateCounters(nextReturn[1]);
                        break;
                    case "00":
                        break;
                    case "EC":
                        this.ifeqX(nextReturn[0]);
                        this.updateCounters(nextReturn[1]);
                        break;
                    case "D0":
                        this.branchOnZ(nextReturn[0], nextReturn[1]);
                        break;
                    case "EE":
                        this.incrAcc(nextReturn[0]);
                        this.updateCounters(nextReturn[1]);
                        break;
                    case "FF":
                        this.systemCall();
                        break;
                }
                if (parseInt(this.runningPCB.getCounter(), 16) >= this.runningPCB.limit_ct / 8) {
                    this.isExecuting = false;
                    this.runningPCB.updateStates(4);
                }
                if (this.singleStep) {
                    this.isExecuting = false;
                }
            }
        };
        Cpu.prototype.ldaConst = function (hex) {
            this.Acc = hex;
            console.log("set const acc " + this.Acc);
            this.runningPCB.accumulator = hex;
        };
        Cpu.prototype.ldaVar = function (counter) {
            var varData = this.readData(counter);
            this.Acc = varData[0];
            console.log("set vat  acc " + this.Acc);
            this.runningPCB.accumulator = varData[0];
        };
        Cpu.prototype.store = function (counter) {
            var cnter = parseInt(counter, 16);
            console.log("Store " + this.Acc + " in " + counter + " " + cnter);
            var writeReturn = this.writeData(this.Acc, cnter);
        };
        Cpu.prototype.storeXReg = function (hex) {
            this.Xreg = hex;
            this.runningPCB.x_reg = hex;
            console.log("Load x register const " + hex);
        };
        Cpu.prototype.storeXRegVar = function (counter) {
            var varData = this.readData(counter);
            this.Xreg = varData[0];
        };
        Cpu.prototype.storeYReg = function (hex) {
            this.Yreg = hex;
        };
        Cpu.prototype.storeYRegVar = function (counter) {
            var varData = this.readData(counter);
            console.log("data store in y reg var " + varData[0] + " " + counter);
            this.Yreg = varData[0];
        };
        Cpu.prototype.ifeqX = function (addr) {
            var byteValue = this.readData(addr);
            console.log("Comparing " + this.Xreg + " " + byteValue[0]);
            if (this.Xreg == byteValue[0]) {
                this.Zflag = 0;
            }
            else {
                this.Zflag = 1;
            }
        };
        Cpu.prototype.branchOnZ = function (brCounter, nextCounter) {
            if (this.Zflag == 0) {
                this.runningPCB.updateCounter(brCounter);
                this.PC = this.runningPCB.getCounter();
                console.log("Branch to " + this.PC + " for z " + this.Zflag);
                this.isExecuting = false;
            }
            else {
                this.updateCounters(nextCounter);
            }
        };
        Cpu.prototype.incrAcc = function (addr) {
            var byteValue = this.readData(addr);
            var incre = (parseInt(String(byteValue[0]), 16) + 1).toString(16);
            this.writeData(incre, parseInt(addr, 16));
            console.log("increment " + byteValue[0] + " at " + addr + " to " + incre + " at " + addr);
        };
        Cpu.prototype.add = function (hexVal) {
            var accBin = this.hexToBinary(this.Acc.toString(16));
            var binVal = this.hexToBinary(parseInt(hexVal).toString(16));
            var tmpSize = Math.max(accBin.length, binVal.length);
            console.log(accBin, binVal, hexVal);
            accBin = this.pad(accBin, tmpSize);
            binVal = this.pad(binVal, tmpSize);
            console.log(accBin, binVal);
            var sum = '';
            var carry = '';
            for (var i = accBin.length - 1; i >= 0; i--) {
                if (i == accBin.length - 1) {
                    //half add the first pair
                    var halfAdd1 = this.halfAdder(accBin[i], binVal[i]);
                    sum = halfAdd1[0] + sum;
                    carry = halfAdd1[1];
                }
                else {
                    //full add the rest
                    var fullAdd = this.fullAdder(accBin[i], binVal[i], carry);
                    sum = fullAdd[0] + sum;
                    carry = fullAdd[1];
                }
            }
            return parseInt(carry ? carry + sum : sum, 2).toString(16).toUpperCase();
        };
        Cpu.prototype.systemCall = function () {
            if (this.Xreg == "01") {
                _Console.putText(this.Yreg);
            }
            else if (this.Xreg == "02") {
                var charVal = String.fromCharCode(parseInt(this.Yreg));
                console.log(charVal);
                _Console.putText(charVal);
            }
        };
        Cpu.prototype.updateCounters = function (newCounter) {
            this.runningPCB.updateCounter(newCounter);
            this.PC = this.runningPCB.getCounter();
        };
        Cpu.prototype.readData = function (counter) {
            var counterNum = parseInt(counter, 16);
            return _MemoryAccessor.read(counterNum);
        };
        Cpu.prototype.writeData = function (data, addr) {
            var opcodes = data.split(" ");
            var binaryCodes = [];
            for (var _i = 0, opcodes_1 = opcodes; _i < opcodes_1.length; _i++) {
                var code = opcodes_1[_i];
                console.log("writing " + code);
                for (var i = 0; i < code.length; i++) {
                    var binary = this.pad(this.hexToBinary(code.charAt(i)), 4);
                    var nibble = binary.substr(binary.length - 4);
                    binaryCodes.push(nibble);
                }
            }
            var binaryCode = binaryCodes.join("").split("");
            var writeInfo = _MemoryAccessor.write(binaryCode, addr * 8);
            return writeInfo;
        };
        Cpu.prototype.writeProgram = function (codes, addr) {
            if (addr === void 0) { addr = null; }
            var writeInfo = this.writeData(codes, addr);
            if (writeInfo.length == 0) {
                return [];
            }
            var newPCB = new TSOS.pcb(0, _MemoryManager.getNextPID(), 32, writeInfo[0].toString(16), writeInfo[1]);
            _MemoryManager.addPCB(newPCB);
            return [newPCB.getPid(), newPCB.getCounter(), writeInfo[0], writeInfo[1]];
        };
        Cpu.prototype.readPCB = function (pid) {
            var readPCB = _MemoryManager.getPCBbyID(pid);
            if (typeof readPCB === "string") {
                return readPCB;
            }
            else {
                this.runningPCB = readPCB;
                return undefined;
            }
        };
        Cpu.prototype.runUserProgram = function (pid) {
            var returnMsg = this.readPCB(pid);
            if (typeof returnMsg === "undefined") {
                this.isExecuting = true;
            }
            else {
                _StdOut.putText(returnMsg);
            }
        };
        Cpu.prototype.getLoadMemory = function () {
            var memoryArr = _Memory.getLoadMemory();
            var memoryArrMatrix = new Array(32).fill([]);
            var memoryChunk = 0;
            var hexNum = 0;
            while (memoryArr.length) {
                if (hexNum >= 64) {
                    memoryChunk = memoryChunk + 1;
                    memoryArrMatrix[memoryChunk] = [];
                    hexNum = 0;
                }
                var hex = "";
                for (var _ = 0; _ < 2; _++) {
                    var nibble = parseInt(memoryArr.splice(0, 4).join(""), 2);
                    hex = hex + nibble.toString(16).toUpperCase();
                    hexNum = hexNum + 4;
                }
                memoryArrMatrix[memoryChunk].push(hex);
            }
            return memoryArrMatrix;
        };
        Cpu.prototype.getInfo = function () {
            return [this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag];
        };
        Cpu.prototype.getPCBs = function () {
            return _MemoryManager.getPBCsInfo();
        };
        Cpu.prototype.hexToBinary = function (hexCode) {
            var binary = parseInt(hexCode, 16).toString(2);
            return binary;
        };
        Cpu.prototype.halfAdder = function (a, b) {
            var sum = this.xor(a, b);
            var carry = this.and(a, b);
            return [sum, carry];
        };
        Cpu.prototype.fullAdder = function (a, b, carry) {
            var alfAdd = this.halfAdder(a, b);
            var sum = this.xor(carry, alfAdd[0]);
            carry = this.and(carry, alfAdd[0]);
            carry = this.or(carry, alfAdd[1]);
            return [sum, carry];
        };
        Cpu.prototype.xor = function (a, b) { return (a === b ? 0 : 1); };
        Cpu.prototype.and = function (a, b) { return a == 1 && b == 1 ? 1 : 0; };
        Cpu.prototype.or = function (a, b) { return (a || b); };
        Cpu.prototype.pad = function (num, size) {
            var s = num + "";
            while (s.length < size)
                s = "0" + s;
            return s;
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
