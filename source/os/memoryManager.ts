/* ------------
     MemoryManager.ts

     Routines for the host CPU simulation, NOT for the OS itself.

     This code allows the Operating System to manage the memory
     ------------ */
module TSOS {
    export class MemoryManager {
        constructor(
            public pcbs: PCB[] = new Array()
            , public memorySize = _MemoryAccessor.getMemorySize()
            , public memoryFill = new Array(_CPU.getMemorySegments()).fill(false)
            // false --> binary view
            , public memoryHexView = true 
            , public readyQueue: PCB[] = []
            , public residentQueue: PCB[] = []
            , public quantum: Number = 6
        ) {
            
        }
        
        public addPCB(newpcb: PCB) {
            this.pcbs.push(newpcb);
        }

        public addPCBtoReady(pcb: PCB) {
            pcb.updateStates(2);
            this.readyQueue.push(pcb);
        }

        public removeReadyPCB(pcb: PCB) {
            this.readyQueue.splice(this.readyQueue.indexOf(pcb), 1)
        }

        public getPCBbyID(pid: string) {
            if (typeof this.pcbs[parseInt(pid)] !== 'undefined') {
                return this.pcbs[parseInt(pid)];
            }
            else {
                return "There is not user program with pid of " + pid
            }
        }
        public getNextPID() {
            return this.pcbs.length;
        }
        public write(segment: number, data: string) {
            console.log(segment)
            if (segment === -1) {
                return "All memory segments are occupied by some process."+
                    " Please kill or run a process to release the memory."
            }
            let writeReturn = _CPU.writeProgram(segment, data);
            let nextSegment = this.memoryFill.indexOf(false);
            if (nextSegment >= 0) {
                this.memoryFill[this.memoryFill.indexOf(false)] = true;
            }
            writeReturn.push(segment)
            return writeReturn;
        }
        public getPBCsInfo() {
            let pbcsInfo: string[][] = [];
            for (let pcb of this.pcbs) {
                pbcsInfo.push(pcb.getInfo());
            }
            return pbcsInfo;
        }

        public shortTermSchedule(curPCB: PCB) {
            if(this.quantum == 0) {
                console.log("Schedule next process")
                this.quantum = 6;
                this.saveState(curPCB)
                let nextProcess = this.readyQueue.shift();
                console.log(curPCB, nextProcess)
                _Kernel.krnRunProgram(nextProcess.getPid().toString());
            }
        }

        public saveState(runningPCB: PCB) {
            console.log(this.pcbs, runningPCB)
            this.pcbs[runningPCB.pid].x_reg = runningPCB.x_reg
            this.pcbs[runningPCB.pid].y_reg = runningPCB.y_reg
            this.pcbs[runningPCB.pid].z_reg = runningPCB.z_reg
            this.pcbs[runningPCB.pid].state = runningPCB.state
            this.pcbs[runningPCB.pid].accumulator =  runningPCB.accumulator
            this.pcbs[runningPCB.pid].counter = runningPCB.counter
            this.readyQueue.push(runningPCB);
        }
    }
}