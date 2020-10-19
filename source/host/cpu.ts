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

module TSOS {

    export class Cpu {

        constructor(public PC: string = "00",
                    public Acc: any = 0,
                    public Xreg: any = 0,
                    public Yreg: any = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false,
                    public runningPCB: PCB = null,
                    public singleStep: boolean = false
        ) {
        }

        public init(): void {
            this.PC = "00";
            this.Acc = "00";
            this.Xreg = "00";
            this.Yreg = "00";
            this.Zflag = 0;
            this.isExecuting = false;
            this.singleStep = false;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            if (this.runningPCB.state < 4) {
                console.log(_Memory.memoryArr[2098])
                this.runningPCB.state = 1;
                let counter = parseInt(this.runningPCB.getCounter(), 16);
                let returnValues: any[] = _MemoryAccessor.read(this.runningPCB.location, counter, 1);
                this.updateCounters(returnValues[1]);
                let hexicode = returnValues[0];
                this.runningPCB.updateStates(2);
                console.log("running " + hexicode + " at " + pad(counter.toString(16).toUpperCase(), 2)
                             + " next counter" + this.PC);
                switch(hexicode) {
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
                        let addResult = this.add();
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
                        _Console.advanceLine()
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
                    console.log("Terminating PCB by counter limit")
                    console.log(parseInt(this.runningPCB.getCounter(), 16) % 256, this.runningPCB.limit_ct)
                    this.isExecuting = false;
                    this.runningPCB.updateStates(4);
                }
                if (this.singleStep) {
                    this.isExecuting = false;
                } 
            }
            _MemoryManager.quantum =_MemoryManager.quantum - 1
            console.log(_MemoryManager.quantum)
            console.log(_Memory.memoryArr[2098])
        }

        public ldaConst() {
            let nextCounter = parseInt(this.runningPCB.getCounter(), 16);
            let nextReturn: any[] = _MemoryAccessor.read(this.runningPCB.location, nextCounter, 1);
            this.Acc = nextReturn[0];
            console.log("set const acc " + this.Acc);
            this.runningPCB.accumulator = this.Acc;
            this.updateCounters(nextReturn[1])
        }
        public ldaVar() {
            let nextCounter = parseInt(this.runningPCB.getCounter(), 16)
            let nextReturn: any[] = _MemoryAccessor.read(this.runningPCB.location, nextCounter, 2)
            let varData = this.readData(this.runningPCB.location, nextReturn[0]);
            this.Acc = varData[0];
            console.log("set vat  acc " + this.Acc);
            this.runningPCB.accumulator = varData[0];
            this.updateCounters(nextReturn[1]);
        }
        public store() {
            let nextCounter = parseInt(this.runningPCB.getCounter(), 16)
            let nextReturn: any[] = _MemoryAccessor.read(this.runningPCB.location, nextCounter, 2)
            let cnter: number = parseInt(nextReturn[0], 16);
            console.log("Store " + this.Acc + " in " + nextReturn[0] + " " + cnter);
            let writeReturn = this.writeData(this.runningPCB.location, this.Acc, cnter);
            this.updateCounters(nextReturn[1]);
        }
        public storeXReg() {
            let nextCounter = parseInt(this.runningPCB.getCounter(), 16);
            let nextReturn: any[] = _MemoryAccessor.read(this.runningPCB.location, nextCounter, 1);
            this.Xreg = nextReturn[0];
            this.runningPCB.x_reg = nextReturn[0];
            console.log("Load x register const " + nextReturn[0]);
            this.updateCounters(nextReturn[1]);
        }
        public storeXRegVar() {
            let nextCounter = parseInt(this.runningPCB.getCounter(), 16);
            let nextReturn: any[] = _MemoryAccessor.read(this.runningPCB.location, nextCounter, 2);
            let varData = this.readData(this.runningPCB.location, nextReturn[0]);
            this.Xreg = varData[0];
            this.runningPCB.x_reg = this.Xreg;
            this.updateCounters(nextReturn[1]);
        }
        public storeYReg() {
            let nextCounter = parseInt(this.runningPCB.getCounter(), 16)
            let nextReturn: any[] = _MemoryAccessor.read(this.runningPCB.location, nextCounter, 1);
            this.Yreg = nextReturn[0];
            this.runningPCB.y_reg = this.Yreg
            this.updateCounters(nextReturn[1]);
        }
        public storeYRegVar() {
            let nextCounter = parseInt(this.runningPCB.getCounter(), 16);
            let nextReturn: any[] = _MemoryAccessor.read(this.runningPCB.location, nextCounter, 2);
            let varData = this.readData(this.runningPCB.location, nextReturn[0]);
            console.log("data store in y reg var " + varData[0] + " " + nextReturn[0])
            this.Yreg = varData[0];
            this.runningPCB.y_reg = this.Yreg;
            this.updateCounters(nextReturn[1]);
        }
        public ifeqX() {
            let nextCounter = parseInt(this.runningPCB.getCounter(), 16);
            let nextReturn: any[] = _MemoryAccessor.read(this.runningPCB.location, nextCounter, 2);
            let byteValue = this.readData(this.runningPCB.location, nextReturn[0]);
            console.log("Comparing " + this.Xreg + " " + byteValue[0]);
            if(this.Xreg == byteValue[0]) {
                this.Zflag = 1
            } else {
                this.Zflag = 0
            }
            this.runningPCB.z_reg = this.Zflag
            this.updateCounters(nextReturn[1]);
        }
        public branchOnZ() {
            let nextCounter = parseInt(this.runningPCB.getCounter(), 16);
            let nextReturn: any[] = _MemoryAccessor.read(this.runningPCB.location, nextCounter, 1);
            this.updateCounters(nextReturn[1]);
            if(this.Zflag == 0) {
                this.runningPCB.updateCounter(parseInt(this.PC, 16) + parseInt(nextReturn[0], 16))
                let newCounter = parseInt(this.runningPCB.getCounter(), 16);
                if (newCounter >  255) {
                    this.runningPCB.updateCounter(newCounter - 256);
                }
                this.PC = this.runningPCB.getCounter();
                console.log("Branch to " + this.PC + " for z " + this.Zflag);
            }
        }
        public incrAcc() {
            let nextCounter = parseInt(this.runningPCB.getCounter(), 16);
            let nextReturn: any[] = _MemoryAccessor.read(this.runningPCB.location, nextCounter, 2);
            let byteValue = this.readData(this.runningPCB.location, nextReturn[0]);
            let incre = (parseInt(String(byteValue[0]) ,16) + 1).toString(16);
            this.writeData(this.runningPCB.location, pad(incre, 2), parseInt(nextReturn[0], 16));
            console.log("increment " + byteValue[0] + " at " + nextReturn[0] + " to " + incre + " at " + nextReturn[0]);
            this.updateCounters(nextReturn[1]);
        }
        public add() {
            let nextCounter = parseInt(this.runningPCB.getCounter(), 16);
            let nextReturn: any[] = _MemoryAccessor.read(this.runningPCB.location, nextCounter, 2);
            let readData = this.readData(this.runningPCB.location, nextReturn[0]);
            let accBin = this.hexToBinary(this.Acc.toString(16));
            let binVal = this.hexToBinary(readData[0]);
            let tmpSize = Math.max(accBin.length, binVal.length);
            console.log(accBin, binVal, nextReturn[0]);
            accBin = pad(accBin, tmpSize);
            binVal = pad(binVal, tmpSize);
            console.log(accBin, binVal);
            let sum = '';
            let carry = '';
            for(var i = accBin.length-1;i>=0; i--){
                if(i == accBin.length-1){
                //half add the first pair
                const halfAdd1 = this.halfAdder(accBin[i],binVal[i]);
                sum = halfAdd1[0]+sum;
                carry = halfAdd1[1];
                }else{
                //full add the rest
                const fullAdd = this.fullAdder(accBin[i],binVal[i],carry);
                sum = fullAdd[0]+sum;
                carry = fullAdd[1];
                }
            }
            this.updateCounters(nextReturn[1]);
            return parseInt(carry ? carry + sum : sum, 2).toString(16).toUpperCase();
        }

        public systemCall() {
            console.log("Check x register " + this.Xreg);
            if(this.Xreg === "01") {
                console.log("Output y reg " + this.Yreg + " to " + parseInt(this.Yreg, 16));
                _Console.putText(parseInt(this.Yreg, 16).toString());
            } else if(this.Xreg === "02") {
                let returnVal = _MemoryAccessor.read(this.runningPCB.location, parseInt(this.Yreg, 16), null);
                let readHexs = returnVal[0];
                let readString = "";
                for (let hex of readHexs.split(" ")) {
                    readString = readString + String.fromCharCode(parseInt(hex, 16));
                }
                console.log(readString);
                _Console.putText(readString);
            }
        }

        public updateCounters(newCounter) {
            this.runningPCB.updateCounter(newCounter);
            this.PC = this.runningPCB.getCounter();
            console.log("Update counter to " + this.runningPCB.getCounter());
        }
        public readData(segment:number, counter: string) {
            let counterNum = parseInt(counter, 16);
            return _MemoryAccessor.read(segment, counterNum, 1);
        }

        public writeData(segment: number, data: string, addr: number) {
            let opcodes: string[] = data.split(" ");
            let binaryCodes: string[] = [];
            for (let code of opcodes) {
                for (let i = 0; i < code.length; i++) {
                    let binary = pad(this.hexToBinary(code.charAt(i)), 4);
                    let nibble = binary.substr(binary.length - 4);
                    binaryCodes.push(nibble);
                }
            }
            let binaryCode: string[] = binaryCodes.join("").split("");
            let writeInfo :number[] = _MemoryAccessor.write(segment, binaryCode, addr);
            return writeInfo;
        }
        public writeProgram(segment: number, codes: string, addr: number = null) {
            let writeInfo = this.writeData(segment, codes, addr);
            if (writeInfo.length == 0) {
                return []
            }
            let newPCB: PCB = new PCB(0, _MemoryManager.getNextPID(), 32, segment
                                        , writeInfo[0].toString(16), writeInfo[1]);
            _MemoryManager.addPCB(newPCB);
            return [newPCB.getPid(), newPCB.getCounter(), writeInfo[0], writeInfo[1]];
        }

        public readPCB(pid:string): PCB {
            return _MemoryManager.getPCBbyID(pid);
        }

        public runUserProgram(pid: string) {
            let returnInfo: any = this.readPCB(pid);
            console.log("return info", returnInfo)
            if (typeof returnInfo !== null) {
                if (returnInfo.state === 4) {
                    return "The user program have been terminated"
                } else {
                    this.runningPCB = returnInfo;
                    this.Acc = this.runningPCB.accumulator;
                    this.PC = this.runningPCB.counter;
                    this.Xreg = this.runningPCB.x_reg;
                    this.Yreg = this.runningPCB.y_reg;
                    this.Zflag = this.runningPCB.z_reg;
                    this.isExecuting = true;
                    console.log("Load new program",returnInfo)
                    return ""
                }
            }
            else {
                return returnInfo
            }
        }

        public terminates() {
            this.isExecuting = false;
            this.runningPCB.updateStates(4);
            console.log("Remove memory from segment ", this.runningPCB.location, " and end in ", this.runningPCB.limit_ct)
            this.removeMemory(this.runningPCB.location, 0, this.runningPCB.limit_ct);
            _MemoryManager.memoryFill[this.runningPCB.location] = false;
            _Kernel.krnShowMemory(this.runningPCB.location);
            _Console.putText("Process " + this.runningPCB.getPid() + " is finished");
            _Console.advanceLine();
            _OsShell.putPrompt();
        }
        
        public removeMemory(location: number, startCounter: number, endCounter: number) {
            _MemoryAccessor.removeMemory(location, startCounter, endCounter);
        }

        public getLoadMemory(segment:number, hexView: boolean): string[][]{
            let memoryArr: string[] = _MemoryAccessor.getLoadMemory(segment);
            let memoryArrMatrix: string[][] = new Array(32).fill([]);
            let memoryChunk: number = 0;
            let hexNum = 0;
            while(memoryArr.length) {
                if (hexNum >= 64) {
                    memoryChunk = memoryChunk + 1;
                    memoryArrMatrix[memoryChunk] = [];
                    hexNum = 0;
                }
                let hex = "";
                for (let _ = 0; _ < 2; _++) {
                    let nibble;
                    if (hexView) {
                        nibble  = parseInt(memoryArr.splice(0, 4).join(""), 2);
                    } else {
                        nibble  = memoryArr.splice(0, 4).join("");
                    }
                    hex = hex + nibble.toString(16).toUpperCase();
                    hexNum = hexNum + 4;
                }
                memoryArrMatrix[memoryChunk].push(hex);
            }
            return memoryArrMatrix;
        }

        public getMemorySegments() {
            return _MemoryAccessor.getSegments();
        }

        public getInfo() {
            return [this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag];
        }

        public getRunningPCB() {
            return this.runningPCB.getInfo();
        }

        public hexToBinary(hexCode: string) {
            let binary = parseInt(hexCode, 16).toString(2);
            return binary;
        }

        public halfAdder(a, b){
            const sum:any = this.xor(a, b);
            const carry:any = this.and(a, b);
            return [sum, carry];
        }
        public fullAdder(a, b, carry){
            let alfAdd = this.halfAdder(a,b);
            const sum:any = this.xor(carry, alfAdd[0]);
            carry = this.and(carry, alfAdd[0]);
            carry = this.or(carry, alfAdd[1]);
            return [sum, carry];
        }

        public xor(a, b){return (a === b ? 0 : 1);}
        public and(a, b){return a == 1 && b == 1 ? 1 : 0;}
        public or(a, b){return (a || b);}

        public kill(pid: number) {
            if (pid === -1) {
                pid = this.runningPCB.getPid();
                this.runningPCB.updateStates(4);
                this.isExecuting = false;
            } else {
                let pcb = _MemoryManager.pcbs[pid];
                pcb.updateStates(4)
                this.removeMemory(pcb.location, 0, pcb.limit_ct);
                _MemoryManager.memoryFill[pcb.location] = false;
                _MemoryManager.removeReadyPCB(pcb);
                _Kernel.krnShowMemory(pcb.location);
            }
        }
    }
}
