/* ------------
     Kernel.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */


module TSOS {

    export class Kernel {
        constructor(
            public cpu_scheduler="rr"
        ) {
        }
        //
        // OS Startup and Shutdown Routines
        //
        public krnBootstrap() {      // Page 8. {
            Control.hostLog("bootstrap", "host");  // Use hostLog because we ALWAYS want this, even if _Trace is off.

            // Initialize our global queues.
            _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array();         // Buffers... for the kernel.
            _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.

            // Initialize the console.
            _Console = new Console();             // The command line interface / console I/O device.
            _Console.init();

            // Initialize standard input and output to the _Console.
            _StdIn  = _Console;
            _StdOut = _Console;

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
            this.krnTrace(_krnKeyboardDriver.status);

            // Load the Harddrive Device Driver
            this.krnTrace("Loading the Harddrive device driver");
            _krnHarddriveDriver = new DeviceDriverFS();
            this.krnTrace(_krnHarddriveDriver.status);

            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new Shell();
            _OsShell.init();

            // Create manager for the memory
            _MemoryManager = new MemoryManager();

            // Set flag to mark Operating System to be on
            osOn = true;

            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }

            // Render the Graphic Taskbar content
            this.krnUpdateDisplayValue();
            // Render memory
            document.getElementById("memorySeg1").click();
        }

        public krnShutdown() {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  If there are some, alert and stop. Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
            osOn = false
        }


        public krnOnCPUClockPulse() {
            /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.                          
            */

            // Render OS values dynamically in the console
            this.krnUpdateDisplayValue();

            if (_KernelInterruptQueue.getSize() > 0) {
                // Check for an interrupt, if there are any. Page 560
                // Process the first interrupt on the interrupt queue.
                // TODO (maybe): Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            } else if (_CPU.isExecuting) { 
                // If there are no interrupts then run one CPU cycle if there is anything being processed.
                _CPU.cycle();
                _CPU.quantum =_CPU.quantum - 1
                Control.hostLog("Current Round Robin Quantum value is " + _CPU.quantum, "OS")
                Control.hostLog("Updating CPU burst time for running process " + _CPU.runningPCB.getPid(), "OS")
                _CPU.runningPCB.cpuBurst = _CPU.runningPCB.cpuBurst + 1
                console.log("Process " + _CPU.runningPCB.getPid(), _CPU.runningPCB.cpuBurst)
                Control.hostLog("Update waiting time for process in the ready queue.", "OS")
                _MemoryManager.addWaitBurst()
            } else {                       
                // If there are no interrupts and there is nothing being executed then just be idle.
                this.krnTrace("Idle");
            }
            if (this.cpu_scheduler === "rr" 
                    && ((_CPU.quantum === 0 || (_CPU.runningPCB ? _CPU.runningPCB.state: 0) == 4))
                    && _MemoryManager.readyQueue.length > 0) {
                let params = []
                Control.hostLog("Invoking interrupt for context switching", "OS")
                _KernelInterruptQueue.enqueue(new Interrupt(SCHEDULE_IRQ, params))
                Control.hostLog("Update waiting time for process in the ready queue.", "OS")
            }
            else if ((this.cpu_scheduler === "fcfs" || this.cpu_scheduler === "priority") 
                    && (_CPU.runningPCB && _CPU.runningPCB.state === 4 && _MemoryManager.readyQueue.length > 0)) {
                let params = []
                Control.hostLog("Invoking interrupt for context switching", "OS")
                _KernelInterruptQueue.enqueue(new Interrupt(SCHEDULE_IRQ, params))
                Control.hostLog("Update waiting time for process in the ready queue.", "OS")
            }
        }

        //
        // Interrupt Handling
        //
        public krnEnableInterrupts() {
            // Keyboard
            Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }

        public krnDisableInterrupts() {
            // Keyboard
            Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }

        public krnInterruptHandler(irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);

            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR();               // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params);   // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case SCHEDULE_IRQ:
                    this.krnShortTermSchedule()
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        }

        public krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
            // Or do it elsewhere in the Kernel. We don't really need this.
        }

        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile


        //
        // OS Utility Routines
        //
        public krnTrace(msg: string) {
             // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
             if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would quickly lag the browser quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        Control.hostLog(msg, "OS");
                    }
                } else {
                    Control.hostLog(msg, "OS");
                }
             }
        }

        // Display Blue Screen of Death to the user when encounter operating system error
        public krnTrapError(msg) {
            if (Array.isArray(msg)) {
                msg = msg.join(" ");
            }
            Control.hostLog("OS ERROR - TRAP: " + msg);
            _Console.showBsod(msg);
            this.krnShutdown();
        }

        // Update the host display on the graphic task bar
        public krnUpdateDisplayValue(): void {
            let cur_datetime: Date = new Date();
            sysDate = "Date: " + ("0" + (cur_datetime.getMonth() + 1)).slice(-2) + "/" 
                                + ("0" + cur_datetime.getDate()).slice(-2) + "/" 
                                + cur_datetime.getFullYear();
            sysTime = "Time: "  + ("0" + cur_datetime.getHours()).slice(-2) 
                        + ":" + ("0" + cur_datetime.getMinutes()).slice(-2)
                        + ":" + ("0" + cur_datetime.getSeconds()).slice(-2);
            _Console.showSysDatetime(sysDate, sysTime);
            let cpuInfo = _CPU.getInfo();
            if (_CPU.isExecuting) {
                if(typeof _CPU.runningPCB !== "undefined") {
                    console.log("memorySeg" + ( 1 + _CPU.getRunningPCB()[2]))
                    document.getElementById("memorySeg" + ( 1 + _CPU.getRunningPCB()[2])).click();
                    _Console.showMemCounter(cpuInfo[0]);
                }
            }
            _Console.showCPU(cpuInfo);
            _Console.showPCB(_MemoryManager.getPBCsInfo());
            if (_krnHarddriveDriver.status === "loaded") {
                _krnHarddriveDriver.loadHDDFromLocal()
                _Console.showHDD(_krnHarddriveDriver.hardDirveData)
            }
        }

        public krnRunProgram(pid: string): void {
            let returnMSG = _CPU.runUserProgram(pid);
            if (typeof returnMSG !== null) {
                _StdOut.putText(returnMSG);
            } else {
                _StdOut.putText("There is no user program with pid of " + pid)
            }
            
        }

        public krnShowMemory(segment: number): void {
            let cpuInfo = _CPU.getInfo();
            let isHexView = _MemoryManager.memoryHexView;
            (<HTMLButtonElement>document.getElementById("memoryDisplay").children.item(segment)).click();
            _Console.showMemory(segment, _CPU.getLoadMemory(segment, isHexView), cpuInfo[0]);
        }

        // Tell the CPU to turn on single step and off if it is on
        public krnTurnSingleStep(): void {
            _CPU.singleStep = _CPU.singleStep ? false: true;
            if (!_CPU.singleStep) {
                _CPU.isExecuting = true;
            }
        }
        // Tell the CPU to execute next step
        public krnNextStep(): void {
            if (_CPU.runningPCB.state < 4) {
                _CPU.isExecuting = true;
            }
        }

        public krnKill(pid: number) {
            let killReturn = _CPU.kill(pid);
            if (killReturn == 4) {
                _Console.putText("The process is already terminated")
            } else if (killReturn == null) {
                _Console.putText("The process "+ pid + " is killed")
            } else if (typeof killReturn === "string") {
                _Console.putText(killReturn)
            }
        }

        public krnChgMemView() {
            _MemoryManager.memoryHexView = _MemoryManager.memoryHexView ? false : true;
            this.krnShowMemory(_CPU.runningPCB.location);
        }

        public krnClearmem() {
            let memSegNum = _MemoryManager.memoryFill.length
            for (let i = 0; i < memSegNum; i++) {
                _CPU.removeMemory(i, 0, 255)
            }
        }

        public krnSetDefQuantum(quantum: number) {
            _CPU.defaultQuantum = quantum
            _CPU.quantum = quantum
        }

        public krnGetDefQuantum() {
            return _CPU.defaultQuantum
        }

        public krnShortTermSchedule() {
            if (this.cpu_scheduler === "rr") {
                Control.hostLog("Context switch using Round Robin", "OS");
                Control.hostLog("Reset quantum back to default Round Robin Quantum: " + _CPU.defaultQuantum, "OS");
                _CPU.quantum = _CPU.defaultQuantum;
                let nextProcess: PCB = _MemoryManager.readyQueue.shift();
                if (typeof nextProcess !== "undefined") {
                    _krnHarddriveDriver.krnSwapping(nextProcess)
                    _MemoryManager.saveState(_CPU.runningPCB);
                    Control.hostLog("Save state of current running process", "OS");
                    Control.hostLog("Switching process from process " + _CPU.runningPCB.getPid() + " to process " 
                                    + nextProcess.getPid(), "OS");
                    _Kernel.krnRunProgram(nextProcess.getPid().toString());
                }    
            } else if (this.cpu_scheduler === "priority") {
                if (_CPU.runningPCB.state === 4) {
                    Control.hostLog("Context switch using Non-Preemptive Priority", "OS");
                    let nextPriorPCB = _MemoryManager.readyQueue[0];
                    let nextIdx = 0
                    for (let pcbIdx = 0; pcbIdx < _MemoryManager.readyQueue.length; pcbIdx++) {
                        if (_MemoryManager.readyQueue[pcbIdx].priority < nextPriorPCB.priority) {
                            nextPriorPCB = _MemoryManager.readyQueue[pcbIdx]
                            nextIdx = pcbIdx;
                        }
                    }
                    _MemoryManager.readyQueue.splice(nextIdx, 1)
                    _krnHarddriveDriver.krnSwapping(nextPriorPCB)
                    _Kernel.krnRunProgram(nextPriorPCB.getPid().toString());
                }
            } else {
                Control.hostLog("Context switch using First Come First Serve", "OS");
                if (_CPU.runningPCB.state === 4) {
                    let nextPCB = _MemoryManager.readyQueue.shift()
                    _krnHarddriveDriver.krnSwapping(nextPCB)
                    _Kernel.krnRunProgram(nextPCB.getPid().toString())
                }
            }
        }

        public krnFormat(mode:string="-full") {
            let returnMSG;
            if (!_CPU.isExecuting) {
                returnMSG = _krnHarddriveDriver.driverEntry(mode);
            } else {
                let msg = "The CPU is running a process. Please wait until the CPU is free and do the refactoring"
                _Console.putText(msg)
                returnMSG = []
            }
            if (returnMSG[0]) {
                _Console.putText("Fail to nitialize all blocks in all sectors in all tracks in the harddrive.")    
            } else {
                if (mode==="-full") {
                    _Console.putText("Initialize all blocks in all sectors in all tracks in the harddrive.")
                } else {
                    _Console.putText("Initialize the first four bytes of every directory and data block.")
                }
            }
        }

        public krnGetHDDEntryByIdx(idx: number, inHex: boolean) {
            return _krnHarddriveDriver.readFile("", idx, inHex)
        }

        public krnCreateFile(filename: string) {
            if (_krnHarddriveDriver.status === "loaded") {
                let returnMSG = _krnHarddriveDriver.createfile(filename)
                return returnMSG
            } else {
                return []
            }
        }

        public krnReadFile(filename: string) {
            if (_krnHarddriveDriver.status === "loaded") {
                let returnMSG = _krnHarddriveDriver.readFile(filename)
                return returnMSG
            } else {
                return []
            }
        }

        public krnWriteFile(filename: (string | number), data: string, inHex: boolean) {
            if (_krnHarddriveDriver.status === "loaded") {
                let returnMSG
                if (typeof filename === "string") {
                    returnMSG = _krnHarddriveDriver.writeFile(filename, data, inHex)
                } else {
                    returnMSG = _krnHarddriveDriver.writeFile("", data, inHex, filename)
                }
                return returnMSG
            } else {
                return []
            }
        }

        public krnDeleteFile(filename: string) {
            if (_krnHarddriveDriver.status === "loaded") {
                let returnMSG = _krnHarddriveDriver.deleteFile(filename)
                return returnMSG
            } else {
                return []
            }
        }
        
        public krnLs(param:string =null) {
            if (_krnHarddriveDriver.status === "loaded") {
                let return_file = _krnHarddriveDriver.getFiles()
                for (let file of return_file) {
                    if (param === "-l") {
                        _Console.putText(file)
                        _Console.advanceLine()
                    } else {
                        if (file[0] !== ".") {
                            _Console.putText(file)
                            _Console.advanceLine()
                        }
                    }
                }
            } else {
                _Console.putText("The harddrive need to be format with a file system. ")
            }
        }

        public krnCopy(srcFile: string, destFile: string) {
            if (_krnHarddriveDriver.status === "loaded") {
                let readSucc = _krnHarddriveDriver.readFile(srcFile);
                console.log(readSucc)
                if (!readSucc[0]) {
                    let createSucc = _krnHarddriveDriver.createfile(destFile);
                    if (!createSucc[0]) {
                        let writeSucc = _krnHarddriveDriver.writeFile(destFile, readSucc[1], true)
                        if (!writeSucc[0]) {
                            return 0
                        } else {
                            return 1
                        }
                    } else {
                        return 2
                    }
                } else {
                    return 3
                }
            } else {
                return 4
            }
        }

        public krnRename(oldName: string, newName: string) {
            if (_krnHarddriveDriver.status === "loaded") {
                if (_krnHarddriveDriver.existFile(oldName)) {
                    let returnCode = _krnHarddriveDriver.renameFile(oldName, newName);
                    return returnCode;
                } else {
                    return 2;
                }
            }
        }

        public krnSetSchedule(schedule: string) {
            if (schedule === "rr" || schedule === "priority" || schedule === "fcfs") {
                this.cpu_scheduler = schedule
                return true
            } else {
                return false
            }
        }

        public krnGetSchedule() {
            return this.cpu_scheduler
        }

        public krnNextFreeFile() {
            return _krnHarddriveDriver.getNextFile();
        }
    }
}
