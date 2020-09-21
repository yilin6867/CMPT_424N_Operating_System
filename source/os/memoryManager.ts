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
        ) {
            
        }
        
        public addPCB(newpcb: pcb) {
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
        public readData(pid) {
            return _CPU.readData(pid);
        }
        public write(data: string) {
            return _CPU.writeProgram(data);
        }
        public getPBCsInfo() {
            let pbcsInfo: string[][] = [];
            for (let pcb of this.pcbs) {
                pbcsInfo.push(pcb.getInfo());
            }
            return pbcsInfo;
        }
    }

    export class pcb {

        constructor(
            // process states: new <0>, ready<1>, running<2>, waiting<3>, terminate<4>
            public state: number 
            , public pid : number
            , public priority: number
            , public counter: string
            , public limit_ct: number
            , public accumulator: any = 0
            , public location: string = "Memory"
            , public x_reg: any = 0
            , public y_reg: any = 0
            , public z_reg: any = 0
        ){
        }
        public updateCounter(newCounter: number) {
            this.counter = this.pad(newCounter.toString(16).toUpperCase(), 2);
        }
        public updateStates(state: number) {
            this.state = state;
        }
        public getPid(): number {
            return this.pid;
        }
        public getCounter(): string {
            return this.counter;
        }

        public getInfo(): any[] {
            return [this.pid, this.state, this.location, this.priority
                , this.counter, this.accumulator, this.x_reg, this.y_reg, this.z_reg]
        }
        public pad(num, size) {
            var s = num+"";
            while (s.length < size) s = "0" + s;
            return s;
        }
    }
}