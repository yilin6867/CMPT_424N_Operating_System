/* ------------
     MemoryManager.ts

     Routines for the host CPU simulation, NOT for the OS itself.

     This code allows the Operating System to manage the memory
     ------------ */
module TSOS {
    export class MemoryManager {
        constructor(
            public memorySize = _MemoryAccessor.getMemorySize()
            , public memoryFill = new Array(_CPU.getMemorySegments()).fill(false)
            // false --> binary view
            , public memoryHexView = true 
            , public readyQueue: PCB[] = []
            , public residentQueue: PCB[] = []
            , public tempFileIdx: number = 1
        ) {
            
        }
        
        public addPCB(newpcb: PCB) {
            this.residentQueue.push(newpcb);
        }

        public addPCBtoReady(pcb: PCB) {
            pcb.updateStates(2);
            this.readyQueue.push(pcb);
        }

        public removeReadyPCB(pcb: PCB) {
            this.readyQueue.splice(this.readyQueue.indexOf(pcb), 1)
        }

        public getPCBbyID(pid: string) {
            if (typeof this.residentQueue[parseInt(pid)] !== 'undefined') {
                return this.residentQueue[parseInt(pid)];
            }
            else {
                return null
            }
        }
        public getNextPID() {
            return this.residentQueue.length;
        }
        public write(segment: number, data: string) {
            if (segment === -1) {
                let dataInNum = []
                for (let hex of data.split(" ")) {
                    dataInNum.push(String.fromCharCode(parseInt(hex, 16)))
                }
                console.log("Date at memory manager", dataInNum)
                let filename = "tempFile" + this.tempFileIdx
                let return_msg: (string | number)[] = _Kernel.krnCreateFile(filename)
                return_msg = _Kernel.krnWriteFile(filename, dataInNum.join(" "))
                console.log(return_msg)
                if (return_msg[0] !== 0) {
                    return "Please format the harddrive with a file system."
                } else {
                    let newPCB: PCB = new PCB(0, _MemoryManager.getNextPID(), 32, -1 * this.tempFileIdx
                                            , "0", 60);
                    _MemoryManager.addPCB(newPCB);
                    return [newPCB.getPid(), newPCB.location, newPCB.getCounter(), 0, 60];
                }
            } else {
                let writeReturn = _CPU.writeProgram(segment, data);
                let nextSegment = this.memoryFill.indexOf(false);
                if (nextSegment >= 0) {
                    this.memoryFill[this.memoryFill.indexOf(false)] = true;
                }
                writeReturn.push(segment)
                return writeReturn;    
            }
        }
        public getPBCsInfo() {
            let pbcsInfo: string[][] = [];
            for (let pcb of this.residentQueue) {
                pbcsInfo.push(pcb.getInfo());
            }
            return pbcsInfo;
        }

        public saveState(runningPCB: PCB) {
            if (runningPCB.state < 4) {
                this.residentQueue[runningPCB.pid].xReg = runningPCB.xReg
                this.residentQueue[runningPCB.pid].yReg = runningPCB.yReg
                this.residentQueue[runningPCB.pid].zReg = runningPCB.zReg
                this.residentQueue[runningPCB.pid].state = runningPCB.state
                this.residentQueue[runningPCB.pid].accumulator =  runningPCB.accumulator
                this.residentQueue[runningPCB.pid].counter = runningPCB.counter
                this.residentQueue[runningPCB.pid].waitBurst = runningPCB.waitBurst
                this.residentQueue[runningPCB.pid].cpuBurst = runningPCB.cpuBurst
                this.residentQueue[runningPCB.pid].state = 1
                this.readyQueue.push(runningPCB);
                console.log("save process ", _MemoryManager.readyQueue)
            }
        }

        public addWaitBurst() {
            for (let pcb of this.readyQueue) {
                pcb.waitBurst = pcb.waitBurst + 1
            }
        }
    }
}