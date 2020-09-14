/* ------------
     MemoryManager.ts

     Routines for the host CPU simulation, NOT for the OS itself.

     This code allows the Operating System to manage the memory
     ------------ */
module TSOS {
    export class MemoryManager {
        constructor(
            public pcbs = new Map<number, pcb>()
            , public memorySize = _MemoryAccessor.getMemorySize()
        ) {
            
        }
        
        public addPCB(newpcb: pcb) {
            this.pcbs.set(newpcb.getPid(), newpcb);
        }

        public getPCBbyID(pid: string) {
            return this.pcbs.get(parseInt(pid));
        }
        public getNextPID() {
            return this.pcbs.size;
        }
        public readData(pid) {
            return _CPU.readData(pid);
        }
        public write(data: string) {
            return _CPU.writeData(data);
        }
    }

    export class pcb {

        constructor(
            // process states: new <1>, ready<2>, running<3>, waiting<4>, terminate<5>
            public pState: number 
            , public pid : number
            , public based_address: number
            , public counter: number = 0
            , public register: number = null
        ){
        }
        public updatePcounter(newCounter: number) {
            this.counter = newCounter;
        }
        public updateStates(pState: number) {
            this.pState = pState;
        }

        public updateRegister(value: number) {
            this.register = value;
        }
        public getPid(): number {
            return this.pid;
        }
        public getBasedAddr(): number {
            return this.based_address;
        }
        public getCounter(): number {
            return this.counter;
        }
    }
}