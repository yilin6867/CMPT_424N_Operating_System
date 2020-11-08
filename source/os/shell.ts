/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc: ShellCommand;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellDate,
                                    "date",
                                    " - return the current date and time")
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new ShellCommand(this.shellWhereami,
                                    "whereami",
                                    " - return the current directory and file the os is located");
            this.commandList[this.commandList.length] = sc;

            // History
            sc = new ShellCommand(this.shellHistory,
                                    "history",
                                    " - Show all previous command"
                                );
            this.commandList[this.commandList.length] = sc;

            //Load
            sc = new ShellCommand(this.shellLoad,
                                    "load",
                                    " - validates if user program input is hexidemcimals");
            this.commandList[this.commandList.length] = sc;

            // Invoke error
            sc = new ShellCommand(this.shellBsod,
                                    "bsod",
                                    "<Error Message> - invoke kernal error to test display " +
                                    "of BSOD for given string of Error Message"
                                );
            this.commandList[this.commandList.length] = sc;

            sc = new ShellCommand(this.shellStatus,
                                    "status",
                                    "<String> - Render the status option on the Graphic Taskbar with "
                                    + "given string of text."
                                );
            this.commandList[this.commandList.length] = sc;
            
            sc = new ShellCommand(this.shellRun,
                                    "run",
                                    "<pid> - Run the process with given process id"
                                );
            this.commandList[this.commandList.length] = sc;

            sc = new ShellCommand(this.shellKill,
                                    "kill",
                                    "<pid> - Kill the process with the given process id"
                                );
            this.commandList[this.commandList.length] = sc;

            sc = new ShellCommand(this.shellClearmem,
                                    "clearmem",
                                    " - Clear all memory partition. If there is any program running, "+
                                        " it will be terminate running and clear the memory."
                                );
            this.commandList[this.commandList.length] = sc;

            sc = new ShellCommand(this.shellQuantum,
                                    "quantum",
                                    "<number> - If number is not provide, display current quantum." + 
                                        " If number is zero, set quantum to default value." +
                                        " If number is greater than zero, set Round Robin quantum to that number."
                                )
            this.commandList[this.commandList.length] =  sc;

            sc = new ShellCommand(this.shellPs,
                                    "ps",
                                    " - Display PID and state of all process."
                                )
            this.commandList[this.commandList.length] = sc;
            
            sc = new ShellCommand(this.shellRunall,
                                    "runall",
                                    " - Execute all process at once."
                                )
            this.commandList[this.commandList.length] = sc;

            sc = new ShellCommand(this.shellKillall,
                                    "killall",
                                    " - Kill all proces"
                                )
            this.commandList[this.commandList.length] = sc

            sc = new ShellCommand(this.shellCreate,
                                    "create",
                                    "<file name> - Create a file in the hard disk drive with give file name."
                                )
            this.commandList[this.commandList.length] = sc

            sc = new ShellCommand(this.shellWrite,
                                    "write",
                                    "<file name> <data> - Write data to the file specify by file name display a " +
                                    "message denoting success or failure. Data must be enclose in double quotes.")
            this.commandList[this.commandList.length] = sc

            sc = new ShellCommand(this.shellRead,
                                    "read",
                                    "<file name> - Read data from the file specify by file name and display in the console." +
                                    " Error will display if the read fails")
            this.commandList[this.commandList.length] = sc

            sc = new ShellCommand(this.shellDelete,
                                    "delete",
                                    "<file name> - Delete data from the file specify by file name and display success of failure" +
                                    " in the console.")
            this.commandList[this.commandList.length] = sc

            sc = new ShellCommand(this.shellFormat,
                                    "format",
                                    " - Initialize all blocks in all sectors in all tracks in the harddrive")
            this.commandList[this.commandList.length] = sc

            sc = new ShellCommand(this.shellLs,
                "ls",
                " - list the files that are currently stored on the disk")
            this.commandList[this.commandList.length] = sc

            sc = new ShellCommand(this.shellSetschedule,
                "setschedule",
                "[rr, fcfs, priority] - Set the CPU scheduling algorithm")
            this.commandList[this.commandList.length] = sc

            sc = new ShellCommand(this.shellGetschedule,
                "getschedule",
                " - Display currently selected CPU scheduling algorithm")
            this.commandList[this.commandList.length] = sc
            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
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
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);  // Note that args is always supplied, though it might be empty.
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
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
        }

        public parseInput(buffer: string): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.

        public shellVer(args: string[]) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args: string[]) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args: string[]) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            
        }

        public shellCls(args: string[]) {         
            _StdOut.clearScreen();     
            _StdOut.resetXY();
        }

        public shellMan(args: string[]) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
                    case "prompt":
                        _StdOut.putText("prompt <string> -- Use string being passed as arguement as prompt icon");
                        break;
                    case "trace":
                        _StdOut.putText("trace <on, off> -- Set the trace mode to be either on or off");
                        break;
                    case "rot13":
                        _StdOut.putText("rot13 <string> -- Letter substitution cipher that replaces each letter in the "
                         + "argument string with the 13th letter after it");
                         break;
                    case "cls":
                        _StdOut.putText("cls -- Clears the screen and reset clear");
                        break;
                    case "shutdown":
                        _StdOut.putText("shutdown -- Shutdown the virtual OS l");
                        break;
                    case "date":
                        _StdOut.putText("date -- return the current date and time");
                        break;
                    case "whereami":
                        _StdOut.putText("whereami -- return the current directory and file the os is located");
                        break;
                    case "history":
                        _StdOut.putText("history -- Show all previous commands");
                        break;
                    case "load":
                        _StdOut.putText("load -- validates if user program input is hexidemcimals")
                        break;;
                    case "bsod":
                        _StdOut.putText("bsod <Error Message> -- invoke kernal error to test display " +
                                        "of BSOD for given string of Error Message");
                        break;
                    case "status":
                        _StdOut.putText("<String> - Render the status option on the Graphic Taskbar with "
                                        + "given string of text.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args: string[]) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
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
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args: string[]) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args: string[]) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellDate() {
            let today: Date = new Date();
            let date = today.getFullYear() + "-" + today.getMonth() + "-" + today.getDate();
            let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            _StdOut.putText(date + " " + time)
        }

        public shellHistory() {
            for (let cmd of historyCMD) {
                _StdOut.advanceLine();
                _StdOut.putText(cmd);
            }
        }

        public shellWhereami() {
            let path: string = window.location.pathname
            let file: string = path.substring(path.lastIndexOf('/'), path.length-1);
            _StdOut.putText(APP_NAME + " is running at " + file)
        }

        // Use to load user program input. Currently validating user input
        public shellLoad() {
            let prg_in: any = document.getElementById("taProgramInput");
            let regexp: RegExp = new RegExp("^(?:[0-9A-Fa-f]{2}[ ]*)*(?:[0-9A-Fa-f]{2})$");
            let codes: string = prg_in.value.split("\n").join(" ")
            let segment = _MemoryManager.memoryFill.indexOf(false)
            if (!regexp.test(codes)) {
                _StdOut.putText("The User Program Input is not valid input.");
            } else {
                let writeInfo: any = _MemoryManager.write(segment, codes);
                _StdOut.putText("The User Program Input is valid input.");
                _StdOut.advanceLine();
                if (Array.isArray(writeInfo) && writeInfo.length > 1) {
                    _StdOut.putText("The User Program with PID of " + writeInfo[0] + " is load into memory " 
                        +  writeInfo[1] + " between address "+ writeInfo[3] + " and address " + writeInfo[4] + ".");
                    _Kernel.krnShowMemory(writeInfo[5]);
                } else if (Array.isArray(writeInfo) && writeInfo.length  == 0) {
                    _StdOut.putText("Write Faile. The user program exceed the memory space.")
                } else if (typeof(writeInfo) === "string") {
                    _StdOut.putText(writeInfo)
                }
            }
            console.log(_MemoryManager.readyQueue)
        }

        // run the user input program with given pid
        public shellRun(pid: string) {
            if (!isNaN(parseInt(pid))) {
                _Kernel.krnRunProgram(pid);
            } else {
                _StdOut.putText(pid + " is not a number.")
            }
        }

        // update the status on the os task bar
        public shellStatus(status: string[]) {
            let status_html: HTMLElement = document.getElementById("status");
            let status_txt = status.join(" ");
            status_html.innerText = status_txt;
        }

        // function to test blue screen of death by invoke kernal trap error fucntion with given
        // arguments as message
        public shellBsod(error: string[]) {
            _Kernel.krnTrapError(error);
        }

        public shellKill(pid: string) {
            _Kernel.krnKill(parseInt(pid));
        }

        public shellClearmem() {
            _Kernel.krnClearmem();
        }

        public shellQuantum(num: number) {
            let quantum = num[0]
            if (typeof(quantum) === "undefined") {
                _StdOut.putText("Current Round Robit Quantum is " + _Kernel.krnGetDefQuantum());
            } else if (quantum == 0) {
                _Kernel.krnSetDefQuantum(6)
                _StdOut.putText("Set Round Robit Quantum to default " + _Kernel.krnGetDefQuantum());
            } else {
                _Kernel.krnSetDefQuantum(quantum)
                _StdOut.putText("Set Round Robit Quantum to " + _Kernel.krnGetDefQuantum());
            }
        }

        public shellPs() {
            let pcbInfo: string[][] = _MemoryManager.getPBCsInfo();
            _StdOut.putText("PID | State")
            _StdOut.advanceLine()
            _StdOut.putText("------------")
            for (let pcb of pcbInfo) {
                _StdOut.advanceLine()
                _StdOut.putText(pcb[0].toString().padStart("PID ".length, " ") + "|" 
                + pcb[1].toString().padStart(" State ".length, " "))
            }
        }

        public shellRunall() {
            console.log(_MemoryManager.residentQueue)
            for (let pcb of _MemoryManager.residentQueue) {
                if (pcb.state == 0) {
                    pcb.state = 1
                    _MemoryManager.readyQueue.push(pcb)
                    console.log("Push", pcb.pid, " to queue")
                }
            }
            let firstProcess: PCB = _MemoryManager.readyQueue.shift()
            if (firstProcess !== null) {
                console.log("Running First PCB", firstProcess)
                _Kernel.krnRunProgram(firstProcess.pid.toString())
            } else {
                this.putPrompt()
            }
        }

        public shellKillall() {
            let pcbInfo: string[][] = _MemoryManager.getPBCsInfo();
            for (let pcb of pcbInfo) {
                console.log(pcb[0].toString())
                _OsShell.shellKill(pcb[0].toString())
            }
        }

        public shellCreate(params) {
            let filename = params[0]
            _Kernel.krnCreateFile(filename)
        }

        public shellRead(params) {
            let filename = params[0]
            _Kernel.krnReadFile(filename)
        }

        public shellWrite(params) {
            let filename = params[0]
            let data = params.slice(1).join(" ")
            _Kernel.krnWriteFile(filename, data)
        }

        public shellDelete(params) {
            let filename = params[0]
            _Kernel.krnDeleteFile(filename)
        }

        public shellFormat() {
            _Kernel.krnFormat()
        }

        public shellLs() {
            _Kernel.krnLs()
        }

        public shellSetschedule() {

        }

        public shellGetschedule() {

        }
    }
}
