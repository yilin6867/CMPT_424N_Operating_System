/* ------------
     MemoryManager.ts

     Routines for the host CPU simulation, NOT for the OS itself.

     This code allows the Operating System to manage the memory
     ------------ */
module TSOS {
    export class MemoryManager {
        constructor(
            public pcbs = new Map<number, pcb>()
            , public memoryChunkSize = _MemoryAccessor.getChunkSize()
        ) {
            
        }
        
        public addPCB(newpcb: pcb) {
            this.pcbs.set(newpcb.getPid(), newpcb);
        }

        public getPCBbyID(pid: number) {
            this.pcbs.get(pid);
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
            , public chunk: number
            , public element: number
            , public register: number = null
        ){
        }
        public updatePcounter(curChunk: number, curElement: number) {
            this.chunk = curChunk;
            this.element = curElement;
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

        public getChunk(): number {
            return this.chunk;
        }

        public getElement(): number {
            return this.element;
        }
    }
}