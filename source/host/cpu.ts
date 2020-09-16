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

        constructor(public PC: number = 0,
                    public Acc: any = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false,
                    public runningPCB: pcb = null
        ) {
        }

        public init(): void {
            this.PC = 0;
            this.Acc = null;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            let counter = this.runningPCB.getCounter();
            let returnValues = _MemoryAccessor.read(counter);
            console.log(returnValues[1])
            this.runningPCB.updateCounter(returnValues[1])
            let hexicode = returnValues[0];
            switch(hexicode) {
                case "A9":
                    let nextReturn = _MemoryAccessor.read(this.runningPCB.getCounter())
                    console.log(nextReturn)
                    this.runningPCB.updateCounter(nextReturn[1]);
                    this.ldaConst(nextReturn[0]);
                    break
                    
            }
            this.isExecuting = false;
        }

        public ldaConst(hex: string) {
            this.Acc = hex
            this.runningPCB.accumulator = hex;
            console.log(this.runningPCB.getCounter())
        }
        public readData(counter: number) {
            return _MemoryAccessor.read(counter);
        }

        public writeData(data: string) {
            let opcodes: string[] = data.split(" ");
            let binaryCodes: string[] = []
            for (let code of opcodes) {
                for (let i = 0; i < code.length; i++) {
                    let binary = ("0000" + (parseInt(code.charAt(i), 16)).toString(2));
                    let nibble = binary.substr(binary.length - 4);
                    binaryCodes.push(nibble);
                }
            }
            let binaryCode: string[] = binaryCodes.join("").split("");
            let writeInfo :number[] = _MemoryAccessor.write(binaryCode);
            if (writeInfo.length == 0) {
                return []
            }
            let newPCB: pcb = new pcb(0, _MemoryManager.getNextPID(), 32, writeInfo[0]);
            _MemoryManager.addPCB(newPCB);
            return [newPCB.getPid(), newPCB.getCounter(), writeInfo[0], writeInfo[1]];
        }

        public readPCB(pid:string) {
            let readPCB: pcb = _MemoryManager.getPCBbyID(pid[0]);
            this.runningPCB = readPCB;
        }

        public runUserProgram(pid: string) {
            this.readPCB(pid);
            this.isExecuting = true;
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
    }
}
