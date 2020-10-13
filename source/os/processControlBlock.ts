/* ------------
     MemoryManager.ts

     Routines for the host CPU simulation, NOT for the OS itself.

     This code allows the Operating System to create Process Control Block for each process
     ------------ */
module TSOS {
    export class PCB {

        constructor(
            // process states: new <0>, ready<1>, running<2>, waiting<3>, terminate<4>
            public state: number 
            , public pid : number
            , public priority: number
            , public location: number
            , public counter: string
            , public limit_ct: number
            , public accumulator: any = 0
            , public x_reg: any = 0
            , public y_reg: any = 0
            , public z_reg: any = 0
        ){
        }
        public updateCounter(newCounter: number) {
            this.counter = pad(newCounter.toString(16).toUpperCase(), 2);
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
    }
}