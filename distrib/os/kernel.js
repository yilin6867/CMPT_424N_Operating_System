/* ------------
     Kernel.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Kernel = /** @class */ (function () {
        function Kernel(cpu_scheduler) {
            if (cpu_scheduler === void 0) { cpu_scheduler = "rr"; }
            this.cpu_scheduler = cpu_scheduler;
        }
        //
        // OS Startup and Shutdown Routines
        //
        Kernel.prototype.krnBootstrap = function () {
            TSOS.Control.hostLog("bootstrap", "host"); // Use hostLog because we ALWAYS want this, even if _Trace is off.
            // Initialize our global queues.
            _KernelInterruptQueue = new TSOS.Queue(); // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array(); // Buffers... for the kernel.
            _KernelInputQueue = new TSOS.Queue(); // Where device input lands before being processed out somewhere.
            // Initialize the console.
            _Console = new TSOS.Console(); // The command line interface / console I/O device.
            _Console.init();
            // Initialize standard input and output to the _Console.
            _StdIn = _Console;
            _StdOut = _Console;
            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new TSOS.DeviceDriverKeyboard(); // Construct it.
            this.krnTrace(_krnKeyboardDriver.status);
            // Load the Harddrive Device Driver
            this.krnTrace("Loading the Harddrive device driver");
            _krnHarddriveDriver = new TSOS.DeviceDriverFS();
            this.krnTrace(_krnHarddriveDriver.status);
            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();
            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new TSOS.Shell();
            _OsShell.init();
            // Create manager for the memory
            _MemoryManager = new TSOS.MemoryManager();
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
        };
        Kernel.prototype.krnShutdown = function () {
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
            osOn = false;
        };
        Kernel.prototype.krnOnCPUClockPulse = function () {
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
            }
            else if (_CPU.isExecuting) {
                // If there are no interrupts then run one CPU cycle if there is anything being processed.
                _CPU.cycle();
                _CPU.quantum = _CPU.quantum - 1;
                TSOS.Control.hostLog("Current Round Robin Quantum value is " + _CPU.quantum, "OS");
                TSOS.Control.hostLog("Updating CPU burst time for running process " + _CPU.runningPCB.getPid(), "OS");
                _CPU.runningPCB.cpuBurst = _CPU.runningPCB.cpuBurst + 1;
                console.log("Process " + _CPU.runningPCB.getPid(), _CPU.runningPCB.cpuBurst);
                TSOS.Control.hostLog("Update waiting time for process in the ready queue.", "OS");
                _MemoryManager.addWaitBurst();
            }
            else {
                // If there are no interrupts and there is nothing being executed then just be idle.
                this.krnTrace("Idle");
            }
            if (this.cpu_scheduler === "rr"
                && ((_CPU.quantum === 0 || (_CPU.runningPCB ? _CPU.runningPCB.state : 0) == 4))
                && _MemoryManager.readyQueue.length > 0) {
                var params = [];
                TSOS.Control.hostLog("Invoking interrupt for context switching", "OS");
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SCHEDULE_IRQ, params));
                TSOS.Control.hostLog("Update waiting time for process in the ready queue.", "OS");
            }
            else if ((this.cpu_scheduler === "fcfs" || this.cpu_scheduler === "priority")
                && (_CPU.runningPCB && _CPU.runningPCB.state === 4 && _MemoryManager.readyQueue.length > 0)) {
                var params = [];
                TSOS.Control.hostLog("Invoking interrupt for context switching", "OS");
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SCHEDULE_IRQ, params));
                TSOS.Control.hostLog("Update waiting time for process in the ready queue.", "OS");
            }
        };
        //
        // Interrupt Handling
        //
        Kernel.prototype.krnEnableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        };
        Kernel.prototype.krnDisableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        };
        Kernel.prototype.krnInterruptHandler = function (irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);
            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR(); // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params); // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case SCHEDULE_IRQ:
                    this.krnShortTermSchedule();
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        };
        Kernel.prototype.krnTimerISR = function () {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
            // Or do it elsewhere in the Kernel. We don't really need this.
        };
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
        Kernel.prototype.krnTrace = function (msg) {
            // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
            if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would quickly lag the browser quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        TSOS.Control.hostLog(msg, "OS");
                    }
                }
                else {
                    TSOS.Control.hostLog(msg, "OS");
                }
            }
        };
        // Display Blue Screen of Death to the user when encounter operating system error
        Kernel.prototype.krnTrapError = function (msg) {
            if (Array.isArray(msg)) {
                msg = msg.join(" ");
            }
            TSOS.Control.hostLog("OS ERROR - TRAP: " + msg);
            _Console.showBsod(msg);
            this.krnShutdown();
        };
        // Update the host display on the graphic task bar
        Kernel.prototype.krnUpdateDisplayValue = function () {
            var cur_datetime = new Date();
            sysDate = "Date: " + ("0" + (cur_datetime.getMonth() + 1)).slice(-2) + "/"
                + ("0" + cur_datetime.getDate()).slice(-2) + "/"
                + cur_datetime.getFullYear();
            sysTime = "Time: " + ("0" + cur_datetime.getHours()).slice(-2)
                + ":" + ("0" + cur_datetime.getMinutes()).slice(-2)
                + ":" + ("0" + cur_datetime.getSeconds()).slice(-2);
            _Console.showSysDatetime(sysDate, sysTime);
            var cpuInfo = _CPU.getInfo();
            if (_CPU.isExecuting) {
                if (typeof _CPU.runningPCB !== "undefined") {
                    console.log("memorySeg" + (1 + _CPU.getRunningPCB()[2]));
                    document.getElementById("memorySeg" + (1 + _CPU.getRunningPCB()[2])).click();
                    _Console.showMemCounter(cpuInfo[0]);
                }
            }
            _Console.showCPU(cpuInfo);
            _Console.showPCB(_MemoryManager.getPBCsInfo());
            if (_krnHarddriveDriver.status === "loaded") {
                _krnHarddriveDriver.loadHDDFromLocal();
                _Console.showHDD(_krnHarddriveDriver.hardDirveData);
            }
        };
        Kernel.prototype.krnRunProgram = function (pid) {
            var returnMSG = _CPU.runUserProgram(pid);
            if (typeof returnMSG !== null) {
                _StdOut.putText(returnMSG);
            }
            else {
                _StdOut.putText("There is no user program with pid of " + pid);
            }
        };
        Kernel.prototype.krnShowMemory = function (segment) {
            var cpuInfo = _CPU.getInfo();
            var isHexView = _MemoryManager.memoryHexView;
            document.getElementById("memoryDisplay").children.item(segment).click();
            _Console.showMemory(segment, _CPU.getLoadMemory(segment, isHexView), cpuInfo[0]);
        };
        // Tell the CPU to turn on single step and off if it is on
        Kernel.prototype.krnTurnSingleStep = function () {
            _CPU.singleStep = _CPU.singleStep ? false : true;
            if (!_CPU.singleStep) {
                _CPU.isExecuting = true;
            }
        };
        // Tell the CPU to execute next step
        Kernel.prototype.krnNextStep = function () {
            if (_CPU.runningPCB.state < 4) {
                _CPU.isExecuting = true;
            }
        };
        Kernel.prototype.krnKill = function (pid) {
            var killReturn = _CPU.kill(pid);
            if (killReturn == 4) {
                _Console.putText("The process is already terminated");
            }
            else if (killReturn == null) {
                _Console.putText("The process " + pid + " is killed");
            }
            else if (typeof killReturn === "string") {
                _Console.putText(killReturn);
            }
        };
        Kernel.prototype.krnChgMemView = function () {
            _MemoryManager.memoryHexView = _MemoryManager.memoryHexView ? false : true;
            this.krnShowMemory(_CPU.runningPCB.location);
        };
        Kernel.prototype.krnClearmem = function () {
            var memSegNum = _MemoryManager.memoryFill.length;
            for (var i = 0; i < memSegNum; i++) {
                _CPU.removeMemory(i, 0, 255);
            }
        };
        Kernel.prototype.krnSetDefQuantum = function (quantum) {
            _CPU.defaultQuantum = quantum;
            _CPU.quantum = quantum;
        };
        Kernel.prototype.krnGetDefQuantum = function () {
            return _CPU.defaultQuantum;
        };
        Kernel.prototype.krnShortTermSchedule = function () {
            if (this.cpu_scheduler === "rr") {
                TSOS.Control.hostLog("Context switch using Round Robin", "OS");
                TSOS.Control.hostLog("Reset quantum back to default Round Robin Quantum: " + _CPU.defaultQuantum, "OS");
                _CPU.quantum = _CPU.defaultQuantum;
                var nextProcess = _MemoryManager.readyQueue.shift();
                if (typeof nextProcess !== "undefined") {
                    _krnHarddriveDriver.krnSwapping(nextProcess);
                    _MemoryManager.saveState(_CPU.runningPCB);
                    TSOS.Control.hostLog("Save state of current running process", "OS");
                    TSOS.Control.hostLog("Switching process from process " + _CPU.runningPCB.getPid() + " to process "
                        + nextProcess.getPid(), "OS");
                    _Kernel.krnRunProgram(nextProcess.getPid().toString());
                }
            }
            else if (this.cpu_scheduler === "priority") {
                if (_CPU.runningPCB.state === 4) {
                    TSOS.Control.hostLog("Context switch using Non-Preemptive Priority", "OS");
                    var nextPriorPCB = _MemoryManager.readyQueue[0];
                    var nextIdx = 0;
                    for (var pcbIdx = 0; pcbIdx < _MemoryManager.readyQueue.length; pcbIdx++) {
                        if (_MemoryManager.readyQueue[pcbIdx].priority < nextPriorPCB.priority) {
                            nextPriorPCB = _MemoryManager.readyQueue[pcbIdx];
                            nextIdx = pcbIdx;
                        }
                    }
                    _MemoryManager.readyQueue.splice(nextIdx, 1);
                    _krnHarddriveDriver.krnSwapping(nextPriorPCB);
                    _Kernel.krnRunProgram(nextPriorPCB.getPid().toString());
                }
            }
            else {
                TSOS.Control.hostLog("Context switch using First Come First Serve", "OS");
                if (_CPU.runningPCB.state === 4) {
                    var nextPCB = _MemoryManager.readyQueue.shift();
                    _krnHarddriveDriver.krnSwapping(nextPCB);
                    _Kernel.krnRunProgram(nextPCB.getPid().toString());
                }
            }
        };
        Kernel.prototype.krnFormat = function (mode) {
            if (mode === void 0) { mode = "-full"; }
            var returnMSG;
            if (!_CPU.isExecuting) {
                returnMSG = _krnHarddriveDriver.driverEntry(mode);
            }
            else {
                var msg = "The CPU is running a process. Please wait until the CPU is free and do the refactoring";
                _Console.putText(msg);
                returnMSG = [];
            }
            if (returnMSG[0]) {
                _Console.putText("Fail to nitialize all blocks in all sectors in all tracks in the harddrive.");
            }
            else {
                if (mode === "-full") {
                    _Console.putText("Initialize all blocks in all sectors in all tracks in the harddrive.");
                }
                else {
                    _Console.putText("Initialize the first four bytes of every directory and data block.");
                }
            }
        };
        Kernel.prototype.krnGetHDDEntryByIdx = function (idx, inHex) {
            return _krnHarddriveDriver.readFile("", idx, inHex);
        };
        Kernel.prototype.krnCreateFile = function (filename) {
            if (_krnHarddriveDriver.status === "loaded") {
                var returnMSG = _krnHarddriveDriver.createfile(filename);
                return returnMSG;
            }
            else {
                return [];
            }
        };
        Kernel.prototype.krnReadFile = function (filename) {
            if (_krnHarddriveDriver.status === "loaded") {
                var returnMSG = _krnHarddriveDriver.readFile(filename);
                return returnMSG;
            }
            else {
                return [];
            }
        };
        Kernel.prototype.krnWriteFile = function (filename, data, inHex) {
            if (_krnHarddriveDriver.status === "loaded") {
                var returnMSG = void 0;
                if (typeof filename === "string") {
                    returnMSG = _krnHarddriveDriver.writeFile(filename, data, inHex);
                }
                else {
                    returnMSG = _krnHarddriveDriver.writeFile("", data, inHex, filename);
                }
                return returnMSG;
            }
            else {
                return [];
            }
        };
        Kernel.prototype.krnDeleteFile = function (filename) {
            if (_krnHarddriveDriver.status === "loaded") {
                var returnMSG = _krnHarddriveDriver.deleteFile(filename);
                return returnMSG;
            }
            else {
                return [];
            }
        };
        Kernel.prototype.krnLs = function (param) {
            if (param === void 0) { param = null; }
            if (_krnHarddriveDriver.status === "loaded") {
                var return_file = _krnHarddriveDriver.getFiles();
                for (var _i = 0, return_file_1 = return_file; _i < return_file_1.length; _i++) {
                    var file = return_file_1[_i];
                    if (param === "-l") {
                        _Console.putText(file);
                        _Console.advanceLine();
                    }
                    else {
                        if (file[0] !== ".") {
                            _Console.putText(file);
                            _Console.advanceLine();
                        }
                    }
                }
            }
            else {
                _Console.putText("The harddrive need to be format with a file system. ");
            }
        };
        Kernel.prototype.krnCopy = function (srcFile, destFile) {
            if (_krnHarddriveDriver.status === "loaded") {
                var readSucc = _krnHarddriveDriver.readFile(srcFile);
                console.log(readSucc);
                if (!readSucc[0]) {
                    var createSucc = _krnHarddriveDriver.createfile(destFile);
                    if (!createSucc[0]) {
                        var writeSucc = _krnHarddriveDriver.writeFile(destFile, readSucc[1], true);
                        if (!writeSucc[0]) {
                            return 0;
                        }
                        else {
                            return 1;
                        }
                    }
                    else {
                        return 2;
                    }
                }
                else {
                    return 3;
                }
            }
            else {
                return 4;
            }
        };
        Kernel.prototype.krnRename = function (oldName, newName) {
            if (_krnHarddriveDriver.status === "loaded") {
                if (_krnHarddriveDriver.existFile(oldName)) {
                    var returnCode = _krnHarddriveDriver.renameFile(oldName, newName);
                    return returnCode;
                }
                else {
                    return 2;
                }
            }
        };
        Kernel.prototype.krnSetSchedule = function (schedule) {
            if (schedule === "rr" || schedule === "priority" || schedule === "fcfs") {
                this.cpu_scheduler = schedule;
                return true;
            }
            else {
                return false;
            }
        };
        Kernel.prototype.krnGetSchedule = function () {
            return this.cpu_scheduler;
        };
        Kernel.prototype.krnNextFreeFile = function () {
            return _krnHarddriveDriver.getNextFile();
        };
        return Kernel;
    }());
    TSOS.Kernel = Kernel;
})(TSOS || (TSOS = {}));
