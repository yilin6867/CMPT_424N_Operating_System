/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = /** @class */ (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", " - return the current date and time");
            this.commandList[this.commandList.length] = sc;
            // whereami
            sc = new TSOS.ShellCommand(this.shellWhereami, "whereami", " - return the current directory and file the os is located");
            this.commandList[this.commandList.length] = sc;
            // History
            sc = new TSOS.ShellCommand(this.shellHistory, "history", " - Show all previous command");
            this.commandList[this.commandList.length] = sc;
            //Load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "<-p> - validates if user program input is hexidemcimals and load it into memory." +
                " Create a process control block for the process. " +
                "If -p is supply with a number, set priority of the process to that value.");
            this.commandList[this.commandList.length] = sc;
            // Invoke error
            sc = new TSOS.ShellCommand(this.shellBsod, "bsod", "<Error Message> - invoke kernal error to test display " +
                "of BSOD for given string of Error Message");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<String> - Render the status option on the Graphic Taskbar with "
                + "given string of text.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellRun, "run", "<pid> - Run the process with given process id");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "<pid> - Kill the process with the given process id");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellClearmem, "clearmem", " - Clear all memory partition. If there is any program running, " +
                " it will be terminate running and clear the memory.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "<number> - If number is not provide, display current quantum." +
                " If number is zero, set quantum to default value." +
                " If number is greater than zero, set Round Robin quantum to that number.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellPs, "ps", " - Display PID and state of all process.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellRunall, "runall", " - Execute all process at once.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellKillall, "killall", " - Kill all proces");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellCreate, "create", "<file name> - Create a file in the hard disk drive with give file name.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellWrite, "write", "<file name> <data> - Write data to the file specify by file name display a " +
                "message denoting success or failure. Data must be enclose in double quotes.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellRead, "read", "<file name> - Read data from the file specify by file name and display in the console." +
                " Error will display if the read fails");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellDelete, "delete", "<file name> - Delete data from the file specify by file name and display success of failure" +
                " in the console.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellFormat, "format", "<-quick, -full> - Initialize all blocks in all sectors in all tracks in the " +
                "harddrive. If the parameter is quick, then first four bytes of every directory " +
                "and data block  will be initialize. If the parameter is full, then all the " +
                "bytes of every directory and data block will be initialize");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellLs, "ls", " - list the files that are currently stored on the disk");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellSetschedule, "setschedule", "[rr, fcfs, priority] - Set the CPU scheduling algorithm");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellGetschedule, "getschedule", " - Display currently selected CPU scheduling algorithm");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellCp, "copy", "<source file name> <destination file name> - Copy the file copy from source file " +
                "to the destination file.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellRename, "rename", "<target file name> <new file name> - Rename the target file into the new file name");
            this.commandList[this.commandList.length] = sc;
            // Display the initial prompt.
            this.putPrompt();
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match. 
            // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args); // Note that args is always supplied, though it might be empty.
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) { // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apologies.
                    this.execute(this.shellApology);
                }
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        Shell.prototype.execute = function (fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again if the Operating System is still running.
            if (osOn) {
                this.putPrompt();
            }
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 3. Lower-case the command.
            tempList[0] = tempList[0].toLowerCase();
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        };
        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.
        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };
        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };
        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
        };
        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        Shell.prototype.shellMan = function (args) {
            if (args.length > 0) {
                var topic = args[0];
                var found = false;
                for (var i in _OsShell.commandList) {
                    if (topic === _OsShell.commandList[i].command) {
                        found = true;
                        _StdOut.advanceLine();
                        _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
                    }
                }
                if (!found) {
                    _StdOut.putText("No manual entry for " + topic + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellDate = function () {
            var today = new Date();
            var date = today.getFullYear() + "-" + today.getMonth() + "-" + today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            _StdOut.putText(date + " " + time);
        };
        Shell.prototype.shellHistory = function () {
            for (var _i = 0, historyCMD_1 = historyCMD; _i < historyCMD_1.length; _i++) {
                var cmd = historyCMD_1[_i];
                _StdOut.advanceLine();
                _StdOut.putText(cmd);
            }
        };
        Shell.prototype.shellWhereami = function () {
            var path = window.location.pathname;
            var file = path.substring(path.lastIndexOf('/'), path.length - 1);
            _StdOut.putText(APP_NAME + " is running at " + file);
        };
        // Use to load user program input. Currently validating user input
        Shell.prototype.shellLoad = function (params) {
            var prg_in = document.getElementById("taProgramInput");
            var regexp = new RegExp("^(?:[0-9A-Fa-f]{2}[ ]*)*(?:[0-9A-Fa-f]{2})$");
            var codes = prg_in.value.split("\n").join(" ");
            var segment = _MemoryManager.memoryFill.indexOf(false);
            var priority = 30;
            if (params[0] === "-p" && parseInt(params[1]) >= 0) {
                priority = params[1];
            }
            if (!regexp.test(codes)) {
                _StdOut.putText("The User Program Input is not valid input.");
            }
            else {
                _StdOut.putText("The User Program Input is valid input.");
                _StdOut.advanceLine();
                console.log(priority);
                var writeInfo = _MemoryManager.write(segment, codes, priority);
                if (Array.isArray(writeInfo) && writeInfo.length > 1) {
                    var location_1 = writeInfo[1] < 0 ? "hardrive entry " + (writeInfo[1] * -1 + 64)
                        : "segment " + writeInfo[1];
                    _StdOut.putText("The User Program with PID of " + writeInfo[0] + " is load into "
                        + location_1 + " between address " + writeInfo[3] + " and address " + writeInfo[4] + ".");
                    if (writeInfo[5]) {
                        _Kernel.krnShowMemory(writeInfo[5]);
                    }
                }
                else if (Array.isArray(writeInfo) && writeInfo.length == 0) {
                    _StdOut.putText("Write Faile. The user program exceed the memory space.");
                }
                else if (typeof (writeInfo) === "string") {
                    _StdOut.putText(writeInfo);
                }
            }
            console.log(_MemoryManager.readyQueue);
        };
        // run the user input program with given pid
        Shell.prototype.shellRun = function (pid) {
            if (!isNaN(parseInt(pid))) {
                _Kernel.krnRunProgram(pid);
            }
            else {
                _StdOut.putText(pid + " is not a number.");
            }
        };
        // update the status on the os task bar
        Shell.prototype.shellStatus = function (status) {
            var status_html = document.getElementById("status");
            var status_txt = status.join(" ");
            status_html.innerText = status_txt;
        };
        // function to test blue screen of death by invoke kernal trap error fucntion with given
        // arguments as message
        Shell.prototype.shellBsod = function (error) {
            _Kernel.krnTrapError(error);
        };
        Shell.prototype.shellKill = function (pid) {
            _Kernel.krnKill(parseInt(pid));
        };
        Shell.prototype.shellClearmem = function () {
            _Kernel.krnClearmem();
        };
        Shell.prototype.shellQuantum = function (num) {
            var quantum = num[0];
            if (typeof (quantum) === "undefined") {
                _StdOut.putText("Current Round Robit Quantum is " + _Kernel.krnGetDefQuantum());
            }
            else if (quantum == 0) {
                _Kernel.krnSetDefQuantum(6);
                _StdOut.putText("Set Round Robit Quantum to default " + _Kernel.krnGetDefQuantum());
            }
            else {
                _Kernel.krnSetDefQuantum(quantum);
                _StdOut.putText("Set Round Robit Quantum to " + _Kernel.krnGetDefQuantum());
            }
        };
        Shell.prototype.shellPs = function () {
            var pcbInfo = _MemoryManager.getPBCsInfo();
            _StdOut.putText("PID | State");
            _StdOut.advanceLine();
            _StdOut.putText("------------");
            for (var _i = 0, pcbInfo_1 = pcbInfo; _i < pcbInfo_1.length; _i++) {
                var pcb = pcbInfo_1[_i];
                _StdOut.advanceLine();
                _StdOut.putText(pcb[0].toString().padStart("PID ".length, " ") + "|"
                    + pcb[1].toString().padStart(" State ".length, " "));
            }
        };
        Shell.prototype.shellRunall = function () {
            console.log(_MemoryManager.residentQueue);
            for (var _i = 0, _a = _MemoryManager.residentQueue; _i < _a.length; _i++) {
                var pcb = _a[_i];
                if (pcb.state == 0) {
                    pcb.state = 1;
                    _MemoryManager.readyQueue.push(pcb);
                    console.log("Push", pcb.pid, " to queue");
                }
            }
            var firstProcess = _MemoryManager.readyQueue.shift();
            if (firstProcess !== null) {
                console.log("Running First PCB", firstProcess);
                _Kernel.krnRunProgram(firstProcess.pid.toString());
            }
            else {
                this.putPrompt();
            }
        };
        Shell.prototype.shellKillall = function () {
            var pcbInfo = _MemoryManager.getPBCsInfo();
            for (var _i = 0, pcbInfo_2 = pcbInfo; _i < pcbInfo_2.length; _i++) {
                var pcb = pcbInfo_2[_i];
                console.log(pcb[0].toString());
                _OsShell.shellKill(pcb[0].toString());
            }
        };
        Shell.prototype.shellCreate = function (params) {
            if (params.length > 0) {
                var filename = params[0];
                var returnMSG = _Kernel.krnCreateFile(filename);
                if (returnMSG.length > 0) {
                    if (returnMSG[0]) {
                        _Console.putText("Fail to create file, " + filename);
                    }
                    else {
                        _Console.putText("Create file, " + filename + ", in directory " + returnMSG[1]);
                    }
                    _Console.advanceLine();
                }
                else {
                    _Console.putText("The harddrive need to be format with a file system. ");
                }
            }
            else {
                _Console.putText("Please provide a file name.");
            }
        };
        Shell.prototype.shellRead = function (params) {
            if (params.length > 0) {
                var filename = params[0];
                var returnMSG = _Kernel.krnReadFile(filename);
                if (returnMSG.length > 0) {
                    if (returnMSG[0]) {
                        _Console.putText("Fail to read data from file, " + filename + ". " + returnMSG[1] + ". ");
                    }
                    else {
                        _Console.putText(returnMSG[1]);
                    }
                }
                else {
                    _Console.putText("The harddrive need to be format with a file system. ");
                }
            }
            else {
                _Console.putText("Please provide a file name.");
            }
        };
        Shell.prototype.shellWrite = function (params) {
            if (params.length > 0) {
                var filename = params[0];
                var data = params.slice(1).join(" ");
                var returnMSG = _Kernel.krnWriteFile(filename, data, true);
                if (returnMSG.length > 0) {
                    if (returnMSG[0]) {
                        _Console.putText("Fail to write data to file, " + filename + ". " + returnMSG[1]);
                    }
                    else {
                        _Console.putText("Write data to file, " + filename + ", in directory " + returnMSG[1] + ". ");
                    }
                }
                else {
                    _Console.putText("The harddrive need to be format with a file system. ");
                }
            }
            else {
                _Console.putText("Please provide a file name.");
            }
        };
        Shell.prototype.shellDelete = function (params) {
            if (params.length > 0) {
                var filename = params[0];
                var returnMSG = _Kernel.krnDeleteFile(filename);
                if (returnMSG.length > 0) {
                    if (returnMSG[0]) {
                        _Console.putText("Fail to delete file, " + filename + ". " + returnMSG[1]);
                    }
                    else {
                        _Console.putText("Delete file, " + filename + ", in directory " + returnMSG[1]);
                    }
                }
                else {
                    _Console.putText("The harddrive need to be format with a file system. ");
                }
            }
            else {
                _Console.putText("Please provide a file name.");
            }
        };
        Shell.prototype.shellFormat = function (params) {
            console.log(params.length);
            if (params.length > 0) {
                _Kernel.krnFormat(params[0]);
            }
            else {
                _Kernel.krnFormat();
            }
        };
        Shell.prototype.shellLs = function (params) {
            if (params.length > 0) {
                _Kernel.krnLs(params[0]);
            }
            else {
                _Kernel.krnLs();
            }
        };
        Shell.prototype.shellCp = function (params) {
            var srcFile = params[0];
            var destFile = params[1];
            if (srcFile && destFile) {
                var returnCode = _Kernel.krnCopy(srcFile, destFile);
                switch (returnCode) {
                    case 0:
                        _Console.putText("Copy Success");
                        break;
                    case 1:
                        _Console.putText("Copy Fail. File content fail to copy over.");
                        break;
                    case 2:
                        _Console.putText("Copy Fail. File to create file to copy to.");
                        break;
                    case 3:
                        _Console.putText("Copy Fail. Fail to read from source file.");
                        break;
                    case 4:
                        _Console.putText("The harddrive need to be format with a file system.");
                        break;
                }
            }
            else {
                _Console.putText("Invalid file names, " + srcFile + " and " + destFile);
            }
        };
        Shell.prototype.shellRename = function (params) {
            var oldName = params[0];
            var newName = params[1];
            if (oldName && newName) {
                var returnCode = _Kernel.krnRename(oldName, newName);
                console.log(returnCode);
                switch (returnCode) {
                    case 0:
                        _Console.putText("Rename Success");
                        break;
                    case 1:
                        _Console.putText("Fail to rename " + oldName + " to " + newName);
                        break;
                    case 2:
                        _Console.putText("Target file does not exist");
                        break;
                }
            }
            else {
                _Console.putText("Please provide the target filename and the new filename");
            }
        };
        Shell.prototype.shellSetschedule = function (params) {
            var returnCode = _Kernel.krnSetSchedule(params[0]);
            if (returnCode) {
                _OsShell.shellGetschedule();
            }
            else {
                _Console.putText("Please enter a valid CPU scheduling algorithm." +
                    " Please refer to help or man command for detail.");
            }
        };
        Shell.prototype.shellGetschedule = function () {
            var schedule = "Round Robin";
            if (_Kernel.krnGetSchedule() === "fcfs") {
                schedule = "First Come First Serve";
            }
            else if (_Kernel.krnGetSchedule() === "priority") {
                schedule = "Non Preemptive Priority";
            }
            _Console.putText("Current CPU scheduling algorithm is " + schedule);
        };
        return Shell;
    }());
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
