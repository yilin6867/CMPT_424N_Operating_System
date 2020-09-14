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
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false,
                    public runningPCB: pcb
        ) {
        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            while(this.runningPCB) {
                let startChunk = this.runningPCB.getChunk();
                let startEle = this.runningPCB.getElement();
                let user_program = _MemoryAccessor.read(startChunk, startEle);
            }
            
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
            console.log(binaryCode)
            let writeInfo :number[] = _MemoryAccessor.write(binaryCode);
            let newPCB: pcb = new pcb(1, _MemoryManager.getNextPID(), writeInfo[0], writeInfo[1]);
            _MemoryManager.addPCB(newPCB);
            return [newPCB.getPid(), newPCB.getChunk() * 8 + newPCB.getElement()];
        }

        public readData(pid:number) {
            let readPBC: pcb = _MemoryManager.getPCBbyID(pid);
            this.runningPCB = readPBC;
        }
    }
}
