/* ------------
     Kernel.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */


module TSOS {

    export class Kernel {
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
            _krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);

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

            // Check for an interrupt, if there are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO (maybe): Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            } else if (_CPU.isExecuting) { // If there are no interrupts then run one CPU cycle if there is anything being processed.
                _CPU.cycle();
                _MemoryManager.shortTermSchedule(_CPU.runningPCB);
            } else {                       // If there are no interrupts and there is nothing being executed then just be idle.
                this.krnTrace("Idle");
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
                console.log("memorySeg" + ( 1 + _CPU.getRunningPCB()[2]))
                document.getElementById("memorySeg" + ( 1 + _CPU.getRunningPCB()[2])).click();
                _Console.showMemCounter(cpuInfo[0]);
            }
            _Console.showCPU(cpuInfo);
            _Console.showPCB(_MemoryManager.getPBCsInfo());
        }

        public krnRunProgram(pid: string): void {
            let returnMSG = _CPU.runUserProgram(pid);
            _StdOut.putText(returnMSG);
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
            _CPU.kill(pid);
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
    }
}
