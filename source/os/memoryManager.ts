/* ------------
     MemoryManager.ts

     Routines for the host CPU simulation, NOT for the OS itself.

     This code allows the Operating System to manage the memory
     ------------ */
module TSOS {
    export class MemoryManager {
        constructor(
            public pcbs = new Array()
            , public memorySize = _MemoryAccessor.getMemorySize()
            , public memoryFill = [false]
        ) {
            
        }
        
        public addPCB(newpcb: PCB) {
            this.pcbs.push(newpcb);
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
            if (segment === -1) {
                segment = 0;
            }
            console.log("Read first counter " + _CPU.readData(segment, "00"))
            console.log(_CPU.readData(segment, "00")[0] === "00")
            if (_CPU.readData(segment, "00")[0] === "00") {
                let writeReturn = _CPU.writeProgram(segment, data);
                this.memoryFill[_MemoryManager.memoryFill.indexOf(false)] = true
                return writeReturn
            } else {
                console.log("Start removing memory at ", segment, 0, 255)
                _CPU.removeMemory(segment, 0, 255)
                return _CPU.writeProgram(segment, data);
            }
        }
        public getPBCsInfo() {
            let pbcsInfo: string[][] = [];
            for (let pcb of this.pcbs) {
                pbcsInfo.push(pcb.getInfo());
            }
            return pbcsInfo;
        }
    }
}