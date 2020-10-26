/* ------------
     MemoryManager.ts

     Routines for the host CPU simulation, NOT for the OS itself.

     This code allows the Operating System to manage the memory
     ------------ */
module TSOS {
    export class MemoryManager {
        constructor(
            public resident_queue: PCB[] = new Array()
            , public memorySize = _MemoryAccessor.getMemorySize()
            , public memoryFill = new Array(_CPU.getMemorySegments()).fill(false)
            // false --> binary view
            , public memoryHexView = true 
            , public readyQueue: PCB[] = []
            , public residentQueue: PCB[] = []
        ) {
            
        }
        
        public addPCB(newpcb: PCB) {
            this.resident_queue.push(newpcb);
        }

        public addPCBtoReady(pcb: PCB) {
            pcb.updateStates(2);
            this.readyQueue.push(pcb);
        }

        public removeReadyPCB(pcb: PCB) {
            this.readyQueue.splice(this.readyQueue.indexOf(pcb), 1)
        }

        public getPCBbyID(pid: string) {
            if (typeof this.resident_queue[parseInt(pid)] !== 'undefined') {
                return this.resident_queue[parseInt(pid)];
            }
            else {
                return null
            }
        }
        public getNextPID() {
            return this.resident_queue.length;
        }
        public write(segment: number, data: string) {
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
            for (let pcb of this.resident_queue) {
                pbcsInfo.push(pcb.getInfo());
            }
            return pbcsInfo;
        }

        public saveState(runningPCB: PCB) {
            if (runningPCB.state < 4) {
                this.resident_queue[runningPCB.pid].xReg = runningPCB.xReg
                this.resident_queue[runningPCB.pid].yReg = runningPCB.yReg
                this.resident_queue[runningPCB.pid].zReg = runningPCB.zReg
                this.resident_queue[runningPCB.pid].state = runningPCB.state
                this.resident_queue[runningPCB.pid].accumulator =  runningPCB.accumulator
                this.resident_queue[runningPCB.pid].counter = runningPCB.counter
                this.resident_queue[runningPCB.pid].waitBurst = runningPCB.waitBurst
                this.resident_queue[runningPCB.pid].cpuBurst = runningPCB.cpuBurst
                this.resident_queue[runningPCB.pid].state = 1
                this.readyQueue.push(runningPCB);
                console.log("save process ", _MemoryManager.readyQueue)
            }
        }

        public addWaitBurst() {
            console.log(this.readyQueue)
            for (let pcb of this.readyQueue) {
                pcb.waitBurst = pcb.waitBurst + 1
            }
            console.log(this.readyQueue)
        }
    }
}