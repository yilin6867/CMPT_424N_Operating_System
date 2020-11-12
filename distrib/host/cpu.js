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
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting, runningPCB, singleStep, defaultQuantum, quantum) {
            if (PC === void 0) { PC = "00"; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (runningPCB === void 0) { runningPCB = null; }
            if (singleStep === void 0) { singleStep = false; }
            if (defaultQuantum === void 0) { defaultQuantum = 6; }
            if (quantum === void 0) { quantum = 6; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.runningPCB = runningPCB;
            this.singleStep = singleStep;
            this.defaultQuantum = defaultQuantum;
            this.quantum = quantum;
        }
        Cpu.prototype.init = function () {
            this.PC = "00";
            this.Acc = "00";
            this.Xreg = "00";
            this.Yreg = "00";
            this.Zflag = 0;
            this.isExecuting = false;
            this.singleStep = false;
            this.defaultQuantum = 6;
            this.quantum = 6;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            if (this.runningPCB.state < 4) {
                this.runningPCB.state = 1;
                var counter = parseInt(this.runningPCB.getCounter(), 16);
                var returnValues = _MemoryAccessor.read(this.runningPCB.location, counter, 1);
                this.updateCounters(returnValues[1]);
                var hexicode = returnValues[0];
                this.runningPCB.updateStates(2);
                console.log("running " + hexicode + " at " + pad(counter.toString(16).toUpperCase(), 2)
                    + " next counter" + this.PC);
                switch (hexicode) {
                    case "A9":
                        this.ldaConst();
                        break;
                    case "AD":
                        this.ldaVar();
                        break;
                    case "8D":
                        this.store();
                        break;
                    case "6D":
                        var addResult = this.add();
                        this.Acc = pad(addResult, 2);
                        this.runningPCB.accumulator = this.Acc;
                        break;
                    case "A2":
                        this.storeXReg();
                        break;
                    case "AE":
                        this.storeXRegVar();
                        break;
                    case "A0":
                        this.storeYReg();
                        break;
                    case "AC":
                        this.storeYRegVar();
                        break;
                    case "EA":
                        break;
                    case "00":
                        _Console.advanceLine();
                        this.terminates();
                        break;
                    case "EC":
                        this.ifeqX();
                        break;
                    case "D0":
                        this.branchOnZ();
                        break;
                    case "EE":
                        this.incrAcc();
                        break;
                    case "FF":
                        this.systemCall();
                        break;
                }
                if (parseInt(this.runningPCB.getCounter(), 16) % 256 >= this.runningPCB.limit_ct) {
                    TSOS.Control.hostLog("Terminating PCB by counter limit", "OS");
                    console.log(parseInt(this.runningPCB.getCounter(), 16) % 256, this.runningPCB.limit_ct);
                    this.isExecuting = false;
                    this.runningPCB.updateStates(4);
                    console.log("Current process is terminate with counter limit", parseInt(this.runningPCB.getCounter(), 16) % 256, this.runningPCB.limit_ct);
                }
                if (this.singleStep) {
                    this.isExecuting = false;
                }
            }
        };
        Cpu.prototype.ldaConst = function () {
            var nextReturn = this.readParams(1);
            this.Acc = nextReturn[0];
            console.log("set const acc " + this.Acc);
            this.runningPCB.accumulator = this.Acc;
            this.updateCounters(nextReturn[1]);
        };
        Cpu.prototype.ldaVar = function () {
            var nextReturn = this.readParams(2);
            var varData = this.readData(this.runningPCB.location, nextReturn[0]);
            this.Acc = varData[0];
            console.log("set vat  acc " + this.Acc);
            this.runningPCB.accumulator = varData[0];
            this.updateCounters(nextReturn[1]);
        };
        Cpu.prototype.store = function () {
            var nextReturn = this.readParams(2);
            var cnter = parseInt(nextReturn[0], 16);
            console.log("Store " + this.Acc + " in " + nextReturn[0] + " " + cnter);
            var writeReturn = this.writeData(this.runningPCB.location, this.Acc, cnter);
            this.updateCounters(nextReturn[1]);
        };
        Cpu.prototype.storeXReg = function () {
            var nextReturn = this.readParams(1);
            this.Xreg = nextReturn[0];
            this.runningPCB.xReg = nextReturn[0];
            console.log("Load x register const " + nextReturn[0]);
            this.updateCounters(nextReturn[1]);
        };
        Cpu.prototype.storeXRegVar = function () {
            var nextReturn = this.readParams(2);
            var varData = this.readData(this.runningPCB.location, nextReturn[0]);
            this.Xreg = varData[0];
            this.runningPCB.xReg = this.Xreg;
            this.updateCounters(nextReturn[1]);
        };
        Cpu.prototype.storeYReg = function () {
            var nextReturn = this.readParams(1);
            this.Yreg = nextReturn[0];
            this.runningPCB.yReg = this.Yreg;
            this.updateCounters(nextReturn[1]);
        };
        Cpu.prototype.storeYRegVar = function () {
            var nextReturn = this.readParams(2);
            var varData = this.readData(this.runningPCB.location, nextReturn[0]);
            console.log("data store in y reg var " + varData[0] + " " + nextReturn[0]);
            this.Yreg = varData[0];
            this.runningPCB.yReg = this.Yreg;
            this.updateCounters(nextReturn[1]);
        };
        Cpu.prototype.ifeqX = function () {
            var nextReturn = this.readParams(2);
            var byteValue = this.readData(this.runningPCB.location, nextReturn[0]);
            console.log("Comparing " + this.Xreg + " " + byteValue[0]);
            if (this.Xreg == byteValue[0]) {
                this.Zflag = 1;
            }
            else {
                this.Zflag = 0;
            }
            this.runningPCB.zReg = this.Zflag;
            this.updateCounters(nextReturn[1]);
        };
        Cpu.prototype.branchOnZ = function () {
            var nextReturn = this.readParams(1);
            this.updateCounters(nextReturn[1]);
            if (this.Zflag == 0) {
                this.runningPCB.updateCounter(parseInt(this.PC, 16) + parseInt(nextReturn[0], 16));
                var newCounter = parseInt(this.runningPCB.getCounter(), 16);
                console.log(this.runningPCB.getCounter(), newCounter);
                if (newCounter > 255) {
                    this.runningPCB.updateCounter(newCounter - 256);
                }
                this.PC = this.runningPCB.getCounter();
                console.log("Branch to " + this.PC + " for z " + this.Zflag);
            }
        };
        Cpu.prototype.incrAcc = function () {
            var nextReturn = this.readParams(2);
            var byteValue = this.readData(this.runningPCB.location, nextReturn[0]);
            var incre = (parseInt(String(byteValue[0]), 16) + 1).toString(16);
            console.log(incre.length, incre, " length increment");
            if (incre.length <= 2) {
                this.writeData(this.runningPCB.location, pad(incre, 2), parseInt(nextReturn[0], 16));
                console.log("increment " + byteValue[0] + " at " + nextReturn[0] + " to " + incre + " at " + nextReturn[0]);
                this.updateCounters(nextReturn[1]);
            }
            else {
                console.log("Memeory out of bound error");
                _Console.putText("Memory out of bound error. Terminate process " + this.runningPCB.pid);
                _Console.advanceLine();
                this.terminates();
            }
        };
        Cpu.prototype.add = function () {
            var nextReturn = this.readParams(2);
            var readData = this.readData(this.runningPCB.location, nextReturn[0]);
            var accBin = this.hexToBinary(this.Acc.toString(16));
            var binVal = this.hexToBinary(readData[0]);
            var tmpSize = Math.max(accBin.length, binVal.length);
            console.log(accBin, binVal, nextReturn[0]);
            accBin = pad(accBin, tmpSize);
            binVal = pad(binVal, tmpSize);
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
            this.updateCounters(nextReturn[1]);
            return parseInt(carry ? carry + sum : sum, 2).toString(16).toUpperCase();
        };
        Cpu.prototype.systemCall = function () {
            console.log("Check x register " + this.Xreg);
            if (this.Xreg === "01") {
                console.log("Output y reg " + this.Yreg + " to " + parseInt(this.Yreg, 16));
                _Console.putText(parseInt(this.Yreg, 16).toString());
            }
            else if (this.Xreg === "02") {
                var returnVal = _MemoryAccessor.read(this.runningPCB.location, parseInt(this.Yreg, 16), null);
                var readHexs = returnVal[0];
                var readString = "";
                for (var _i = 0, _a = readHexs.split(" "); _i < _a.length; _i++) {
                    var hex = _a[_i];
                    readString = readString + String.fromCharCode(parseInt(hex, 16));
                }
                console.log(readString);
                _Console.putText(readString);
            }
        };
        Cpu.prototype.updateCounters = function (newCounter) {
            this.runningPCB.updateCounter(newCounter);
            this.PC = this.runningPCB.getCounter();
            console.log("Update counter to " + this.runningPCB.getCounter());
        };
        Cpu.prototype.readData = function (segment, counter) {
            var counterNum = parseInt(counter, 16);
            return _MemoryAccessor.read(segment, counterNum, 1);
        };
        Cpu.prototype.writeData = function (segment, data, addr) {
            var opcodes = data.split(" ");
            var binaryCodes = [];
            for (var _i = 0, opcodes_1 = opcodes; _i < opcodes_1.length; _i++) {
                var code = opcodes_1[_i];
                for (var i = 0; i < code.length; i++) {
                    var binary = pad(this.hexToBinary(code.charAt(i)), 4);
                    var nibble = binary.substr(binary.length - 4);
                    binaryCodes.push(nibble);
                }
            }
            var binaryCode = binaryCodes.join("").split("");
            var writeInfo = _MemoryAccessor.write(segment, binaryCode, addr);
            return writeInfo;
        };
        Cpu.prototype.writeProgram = function (segment, codes, addr) {
            if (addr === void 0) { addr = null; }
            var writeInfo = this.writeData(segment, codes, addr);
            if (writeInfo.length == 0) {
                return [];
            }
            return [0, _MemoryManager.getNextPID(), 32, segment, writeInfo[0], writeInfo[1]];
        };
        Cpu.prototype.readPCB = function (pid) {
            return _MemoryManager.getPCBbyID(pid);
        };
        Cpu.prototype.readParams = function (paramNum) {
            var nextCounter = parseInt(this.runningPCB.getCounter(), 16);
            var nextReturn = _MemoryAccessor.read(this.runningPCB.location, nextCounter, paramNum);
            if (nextReturn.length < 2) {
                _Console.putText("Memory out of bound error. Terminating the process");
                this.kill(this.runningPCB.getPid());
            }
            else {
                return nextReturn;
            }
        };
        Cpu.prototype.runUserProgram = function (pid) {
            var returnInfo = this.readPCB(pid);
            console.log("PCB to run ", returnInfo);
            if (returnInfo !== null) {
                if (returnInfo.state === 4) {
                    return "The user program have been terminated";
                }
                else {
                    this.runningPCB = returnInfo;
                    this.Acc = this.runningPCB.accumulator;
                    this.PC = this.runningPCB.counter;
                    this.Xreg = this.runningPCB.xReg;
                    this.Yreg = this.runningPCB.yReg;
                    this.Zflag = this.runningPCB.zReg;
                    this.isExecuting = true;
                    console.log("Load new program", returnInfo);
                    return "";
                }
            }
            else {
                return returnInfo;
            }
        };
        Cpu.prototype.terminates = function () {
            this.isExecuting = false;
            this.runningPCB.updateStates(4);
            console.log("Remove memory from segment ", this.runningPCB.location, " and end in ", this.runningPCB.limit_ct);
            this.removeMemory(this.runningPCB.location, 0, this.runningPCB.limit_ct);
            _MemoryManager.memoryFill[this.runningPCB.location] = false;
            _Kernel.krnShowMemory(this.runningPCB.location);
            _Console.putText("Process " + this.runningPCB.getPid() + " is finished");
            _Console.advanceLine();
            _Console.putText("Turnaround Time is " + (this.runningPCB.cpuBurst + this.runningPCB.waitBurst) +
                " CPU burst");
            _Console.advanceLine();
            _Console.putText("Waiting Time is " + this.runningPCB.waitBurst + " CPU brust");
            _Console.advanceLine();
            _OsShell.putPrompt();
        };
        Cpu.prototype.removeMemory = function (location, startCounter, endCounter) {
            _MemoryAccessor.removeMemory(location, startCounter, endCounter);
        };
        Cpu.prototype.getLoadMemory = function (segment, hexView) {
            var memoryArr = _MemoryAccessor.getLoadMemory(segment);
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
                    var nibble = void 0;
                    if (hexView) {
                        nibble = parseInt(memoryArr.splice(0, 4).join(""), 2);
                    }
                    else {
                        nibble = memoryArr.splice(0, 4).join("");
                    }
                    hex = hex + nibble.toString(16).toUpperCase();
                    hexNum = hexNum + 4;
                }
                memoryArrMatrix[memoryChunk].push(hex);
            }
            return memoryArrMatrix;
        };
        Cpu.prototype.getMemorySegments = function () {
            return _MemoryAccessor.getSegments();
        };
        Cpu.prototype.getInfo = function () {
            return [this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag];
        };
        Cpu.prototype.getRunningPCB = function () {
            return this.runningPCB.getInfo();
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
        Cpu.prototype.kill = function (pid) {
            if (pid === -1) {
                pid = this.runningPCB.getPid();
                this.runningPCB.updateStates(4);
                console.log("Current process is kill");
                this.isExecuting = false;
            }
            else {
                var pcb = _MemoryManager.residentQueue[pid];
                if (typeof pcb === "undefined") {
                    return "Process " + pid + " does not exist";
                }
                else if (pcb.state === 4) {
                    return 4;
                }
                else {
                    pcb.updateStates(4);
                    console.log("process is kill");
                    this.removeMemory(pcb.location, 0, _MemoryAccessor.memorySize);
                    _MemoryManager.memoryFill[pcb.location] = false;
                    _MemoryManager.removeReadyPCB(pcb);
                    _Kernel.krnShowMemory(pcb.location);
                    return null;
                }
            }
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
