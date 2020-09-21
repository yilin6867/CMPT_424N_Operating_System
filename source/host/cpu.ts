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
                    public Zflag: number = 1,
                    public isExecuting: boolean = false,
                    public runningPCB: pcb = null,
                    public singleStep: boolean = false
        ) {
        }

        public init(): void {
            this.PC = "00";
            this.Acc = "00";
            this.Xreg = "00";
            this.Yreg = "00";
            this.Zflag = 1;
            this.isExecuting = false;
            this.singleStep = false
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            if (this.runningPCB.state < 4) {
                this.runningPCB.state = 1
                let counter = parseInt(this.runningPCB.getCounter(), 16);
                let returnValues: any[] = _MemoryAccessor.read(counter);
                let hexicode = returnValues[0];

                this.updateCounters(returnValues[1]);
                let nextCounter = parseInt(this.runningPCB.getCounter(), 16)
                let nextReturn: any[] = _MemoryAccessor.read(nextCounter);
                this.runningPCB.updateStates(2);
                console.log("running " + hexicode + " at " + this.pad(counter.toString(16).toUpperCase(), 2)
                             + " next counter" + this.PC)
                switch(hexicode) {
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
                        let addResult = this.add(nextReturn[0]);
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

                if (parseInt(this.runningPCB.getCounter(), 16) >= this.runningPCB.limit_ct/8) {
                    this.isExecuting = false
                    this.runningPCB.updateStates(4)
                }
                if (this.singleStep) {
                    this.isExecuting = false
                }
            }
        }

        public ldaConst(hex: string) {
            this.Acc = hex
            console.log("set const acc " + this.Acc)
            this.runningPCB.accumulator = hex;
            
        }
        public ldaVar(counter) {
            let varData = this.readData(counter);
            this.Acc = varData[0];
            console.log("set vat  acc " + this.Acc)
            this.runningPCB.accumulator = varData[0];
        }
        public store(counter: string) {
            let cnter: number = parseInt(counter, 16)
            console.log("Store " + this.Acc + " in " + counter + " " + cnter)
            let writeReturn = this.writeData(this.Acc, cnter);
        }
        public storeXReg(hex:string) {
            this.Xreg = hex;
            this.runningPCB.x_reg = hex;
            console.log("Load x register const " + hex)
        }
        public storeXRegVar(counter) {
            let varData = this.readData(counter);
            this.Xreg = varData[0];
        }
        public storeYReg(hex) {
            this.Yreg = hex
        }
        public storeYRegVar(counter) {
            let varData = this.readData(counter);
            console.log("data store in y reg var " + varData[0] + " " + counter)
            this.Yreg = varData[0];
        }
        public ifeqX(addr) {
            let byteValue = this.readData(addr)
            console.log("Comparing " + this.Xreg + " " + byteValue[0])
            if(this.Xreg == byteValue[0]) {
                this.Zflag = 0
            } else {
                this.Zflag = 1
            }
        }
        public branchOnZ(brCounter, nextCounter) {
            if(this.Zflag == 0) {
                this.runningPCB.updateCounter(brCounter)
                this.PC = this.runningPCB.getCounter()
                console.log("Branch to " + this.PC + " for z " + this.Zflag)
                this.isExecuting = false
            } else {
                this.updateCounters(nextCounter)
            }
        }
        public incrAcc(addr) {
            let byteValue = this.readData(addr)
            let incre = (parseInt(String(byteValue[0]) ,16) + 1).toString(16)
            this.writeData(incre, parseInt(addr, 16));
            console.log("increment " + byteValue[0] + " at " + addr + " to " + incre + " at " + addr);
        }
        public add(hexVal) {
            let accBin = this.hexToBinary(this.Acc.toString(16));
            let binVal = this.hexToBinary(parseInt(hexVal).toString(16));
            let tmpSize = Math.max(accBin.length, binVal.length);
            console.log(accBin, binVal, hexVal);
            accBin = this.pad(accBin, tmpSize)
            binVal = this.pad(binVal, tmpSize)
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
            return parseInt(carry ? carry + sum : sum, 2).toString(16).toUpperCase();
        }

        public systemCall() {
            if(this.Xreg == "01") {
                _Console.putText(this.Yreg);
            } else if(this.Xreg == "02") {
                let charVal = String.fromCharCode(parseInt(this.Yreg))
                console.log(charVal);
                _Console.putText(charVal);
            }
        }

        public updateCounters(newCounter) {
            this.runningPCB.updateCounter(newCounter);
            this.PC = this.runningPCB.getCounter();
        }
        public readData(counter: string) {
            let counterNum = parseInt(counter, 16);
            return _MemoryAccessor.read(counterNum);
        }

        public writeData(data: string, addr: number) {
            let opcodes: string[] = data.split(" ");
            let binaryCodes: string[] = []
            for (let code of opcodes) {
                console.log("writing " + code)
                for (let i = 0; i < code.length; i++) {
                    let binary = this.pad(this.hexToBinary(code.charAt(i)), 4);
                    let nibble = binary.substr(binary.length - 4);
                    binaryCodes.push(nibble);
                }
            }
            let binaryCode: string[] = binaryCodes.join("").split("");
            let writeInfo :number[] = _MemoryAccessor.write(binaryCode, addr * 8);
            return writeInfo;
        }
        public writeProgram(codes: string, addr: number = null) {
            let writeInfo = this.writeData(codes, addr);
            if (writeInfo.length == 0) {
                return []
            }
            let newPCB: pcb = new pcb(0, _MemoryManager.getNextPID(), 32, writeInfo[0].toString(16), writeInfo[1]);
            _MemoryManager.addPCB(newPCB);
            return [newPCB.getPid(), newPCB.getCounter(), writeInfo[0], writeInfo[1]];
        }

        public readPCB(pid:string) {
            let readPCB: pcb = _MemoryManager.getPCBbyID(pid);
            if (typeof readPCB === "string") {
                return readPCB
            }
            else {
                this.runningPCB = readPCB;
                return undefined
            }
        }

        public runUserProgram(pid: string) {
            let returnMsg = this.readPCB(pid);
            if (typeof returnMsg === "undefined") {
                this.isExecuting = true;
            }
            else {
                _StdOut.putText(returnMsg)
            }
        }

        public getLoadMemory(): string[][]{
            let memoryArr: string[] = _Memory.getLoadMemory();
            let memoryArrMatrix: string[][] = new Array(32).fill([]);
            let memoryChunk: number = 0;
            let hexNum = 0;
            while(memoryArr.length) {
                if (hexNum >= 64) {
                    memoryChunk = memoryChunk + 1
                    memoryArrMatrix[memoryChunk] = [];
                    hexNum = 0;
                }
                let hex = ""
                for (let _ = 0; _ < 2; _++) {
                    let nibble  = parseInt(memoryArr.splice(0, 4).join(""), 2);
                    hex = hex + nibble.toString(16).toUpperCase();
                    hexNum = hexNum + 4;
                    
                }
                memoryArrMatrix[memoryChunk].push(hex);
            }
            return memoryArrMatrix;
        }

        public getInfo() {
            return [this.PC, this.Acc, this.Xreg, this.Yreg, this.Zflag];
        }

        public getPCBs() {
            return _MemoryManager.getPBCsInfo();
            
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

        public pad(num, size) {
            var s = num+"";
            while (s.length < size) s = "0" + s;
            return s;
        }
    }
}
