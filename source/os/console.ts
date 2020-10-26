/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter 
     for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "",
                    // Record cursor of end of line before proceed to next line
                    public end_of_line: number[] = [],
                    public highlightMem = [0, 1]
                ) {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        public clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        public resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var keyValues = _KernelInputQueue.dequeue();
                var chr = keyValues[0];
                var isShift = keyValues[1];
                var isCtrl = keyValues[2];
                
                // Check to see if it's "special" (enter or ctrl-c) or "normal" 
                //(anything else that the keyboard device driver gave us).
                // Check for event.which and event.key value to accomodate deprecated event.which
                if (chr === 13 || chr === "Enter") { // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);

                    // Store entered keys to history
                    if (this.buffer !== "") {
                        historyCMD.push(this.buffer);
                    }
                    histCursor = historyCMD.length;
                    // ... and reset our buffer.
                    this.buffer = "";
                    this.end_of_line = []
                } else if (chr === 8 || chr === "Backspace") {
                    // Implement backspace by removing last element in the buffer
                    // and cover printed value by the area of the value
                    // when reach begin of line go to previous line if there is a previous line
                    let remove_txt: string = this.buffer.substring(this.buffer.length - 1
                                                                    , this.buffer.length)
                    this.buffer = this.buffer.substring(0, this.buffer.length - 1)
                    let offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize
                        , remove_txt);
                    this.currentXPosition = this.currentXPosition - offset;
                    let height = -1 * (_DefaultFontSize 
                                + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize)
                                + _FontHeightMargin)
                    _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition + _FontHeightMargin
                                                , offset, height);
                    if (this.currentXPosition <= 0 && this.end_of_line.length > 0) {
                        this.backLine();
                    }
                } else if (chr === 38 || chr === "ArrowUp") {
                    // Clear current text on screen
                    // Go to the buffer history to reload history command
                    // print history command
                    // Else statement to keep history cursor to be always first command
                    if (histCursor > 0) {
                        this.clear_text();
                        histCursor = histCursor - 1;
                        this.buffer = historyCMD[histCursor];
                        this.putText(this.buffer);
                    } else {
                        histCursor = 0;
                    }
                } else if (chr === 40 || chr === "ArrowDown") {
                    // Clear current text on screen
                    // set cursor to load recent command to the buffer
                    // If no more history command present, currnt buffer set to ""
                    if (histCursor < historyCMD.length) {
                        this.clear_text();
                        histCursor = histCursor + 1;
                        this.buffer = historyCMD[histCursor];
                        if (typeof this.buffer === 'undefined') {
                            this.buffer = ""
                        }
                        this.putText(this.buffer);
                    }
                
                } else if (chr === 9 || chr === "Tab") {
                    // Tab to auto complete command or should available command with similar heading
                    if (this.buffer !== "") {
                        let similar_cmd: string[] = [];
                        for (let cmd of _OsShell.commandList) {
                            if (this.buffer ===  cmd.command.substr(0, this.buffer.length)) {
                                similar_cmd.push(cmd.command);
                            }
                        }

                        if (similar_cmd.length == 1) {
                            // Auto complete command when there is only one similar command
                            this.clear_text();
                            this.buffer = similar_cmd.pop();
                            this.putText(this.buffer)
                        } else if (similar_cmd.length > 1) {
                            // Auto complete to most common letter and print all available command
                            let suggest: string = this.get_filled_txt(similar_cmd);
                            this.buffer = suggest
                            this.advanceLine();
                            let more_suggest_txt:string = "";
                            for (let cmd of similar_cmd) {
                                more_suggest_txt = more_suggest_txt + " " + cmd;
                            }
                            this.putText(more_suggest_txt);
                            this.advanceLine();
                            _OsShell.putPrompt();
                            this.putText(suggest);
                        }
                    }
                } else if (chr === 67 || chr === "c" && isCtrl === true) {
                    console.log("Stoping the process")
                    _OsShell.shellKill("-1");
                    this.advanceLine();
                    _OsShell.putPrompt();
                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    if (chr.length < 2) {
                        console.log(chr, isShift, isCtrl)
                        this.putText(chr);
                        // ... and add it to our buffer.
                        this.buffer += chr;
                    }
                }       
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        }

        public putText(text): void {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
            if (text !== "" && typeof text !== 'undefined') {
                /*
                    Use for loop to print each chracter along the X line.
                */
                for (let i: number = 0; i < text.length; i++) {
                    let print_txt : string = text.charAt(i);
                    let offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize
                        , print_txt);
                    
                    // If the current X position plus next input size is bigger than the 
                    // width of the console canvas, then store current x position for backspace purpose and 
                    // advance to the next with curr
                    if (this.currentXPosition + offset > _Canvas.width) {
                        this.end_of_line.push(this.currentXPosition);
                        this.advanceLine();
                    }
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition
                        , this.currentYPosition, print_txt);
                    
                    this.currentXPosition = this.currentXPosition + offset;
                }
            }
         }
        
        public advanceLine(): void {
            this.currentXPosition = 0;
            this.currentYPosition += this.get_deltaY();
            /*
                If the current Y position is greate than the canvas height then
                save image of the canvas, remove all drawing on the canvas
                and print the save image at y position less than origin of the canvas
            */
            if (this.currentYPosition > _Canvas.height) {
                let console_img : ImageData = _DrawingContext.getImageData(0,0, _Canvas.width, _Canvas.height);
                this.clearScreen()
                _DrawingContext.putImageData(console_img, 0, -1 * this.get_deltaY());
                this.currentYPosition = this.currentYPosition - this.get_deltaY();
            }
        }

        // Return to the previous line in the currnt prompt
        public backLine(): void {
            this.currentXPosition = this.end_of_line.pop();
            this.currentYPosition -= this.get_deltaY();
        }
        
        // Return change in Y value from line to line 
        public get_deltaY() : number {
             /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            return _DefaultFontSize + 
                    _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                    _FontHeightMargin;
        }

        // Clear text for replace current printed text with history text
        public clear_text(): void {
            let height = -1 * this.get_deltaY();
            let clear_x: number = _DrawingContext.measureText(this.currentFont, this.currentFontSize
                , ">");
            if (this.end_of_line.length > 0) {
                this.end_of_line.push(_Canvas.width);
                while(this.end_of_line.length > 1) {
                    _DrawingContext.clearRect(0, this.currentYPosition + _FontHeightMargin
                        , this.end_of_line.pop(), height);
                    this.currentYPosition -= this.get_deltaY();
                }
                _DrawingContext.clearRect(clear_x, this.currentYPosition + _FontHeightMargin
                    , this.end_of_line.pop(), height);
                this.currentXPosition = clear_x;
            } else {
                this.currentXPosition = clear_x;
                let offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize
                    , this.buffer);
                _DrawingContext.clearRect(clear_x, this.currentYPosition + _FontHeightMargin
                    , offset, height);
            }
        }

        // Get auto complete text base on buffer text
        public get_filled_txt(similar_cmd: string[]): string {
            let suggest:string = "";
            for (let txt_idx = 0; txt_idx < similar_cmd.length; txt_idx++) {
                for (let nxt_idx = txt_idx + 1; nxt_idx < similar_cmd.length; nxt_idx++) {
                    for (let l_idx = 0; l_idx < similar_cmd[txt_idx].length; l_idx++) {
                        if (similar_cmd[txt_idx].charAt(l_idx) 
                            == similar_cmd[nxt_idx].charAt(l_idx)) {
                                suggest = suggest + similar_cmd[nxt_idx].charAt(l_idx);

                        }
                        else {
                            return suggest;
                        }
                    }
                }
            }
            return suggest;
        }

        public showBsod(msg) {
            _DrawingContext.fillStyle='blue';
            _DrawingContext.fillRect(0,0,_Canvas.width,_Canvas.height);
            _Console.currentYPosition = _Console.currentYPosition - _Canvas.height/2
            _Console.putText("The OS is experiencing unexpected error due to: " + msg);
            _Console.advanceLine()
            _Console.putText("The OS will be shutdown and record this error to help prevent future error.");
            _Console.advanceLine()
            _Console.putText("Please reset the Operating System to continue.");
        }

        public showSysDatetime(date:string, time:string) {
            let date_html: HTMLElement = document.getElementById("date");
            let time_html: HTMLElement = document.getElementById("time");

            date_html.innerText = date;
            time_html.innerText = time;
        }

        public showMemory(segment: number, memoryMatrix: String[][], counter) {
            let memoryTable = document.getElementById("memoryTable");
            let htmlScript: string = "";
            let rowNum : number = 0;
            for (let row of memoryMatrix) {
                htmlScript = htmlScript + "<tr>"+ "<td bgcolor='lightblue'>" + String(segment) 
                            + pad(rowNum.toString(16).toUpperCase(), 2) + "</td>";
                for (let col of row) {
                    htmlScript = htmlScript + "<td>" + col + "</td>";
                    rowNum = rowNum + 1
                }
                htmlScript = htmlScript + " </tr>";
            }
            memoryTable.innerHTML = htmlScript;
        }

        public showMemCounter(counter) {
            let memoryTable:any = document.getElementById("memoryTable");
            let showCounter = parseInt(counter, 16)
            let col = showCounter % 8 +1
            let row = Math.floor(showCounter /8) % 32
            console.log(row, col)
            console.log(memoryTable.rows)
            console.log(memoryTable.rows[row])
            memoryTable.rows[this.highlightMem[0]].cells[this.highlightMem[1]].style.backgroundColor = "white";
            memoryTable.rows[row].cells[col].style.backgroundColor = "red";
            this.highlightMem = [row, col]
        }

        public showCPU(cpuInfo: any[]) {
            let cpuTable: any = document.getElementById("cpuTable");
            let cellNum: number = 0;
            for (let info of cpuInfo) {
                cpuTable.rows[1].cells[cellNum].innerHTML = info;
                cellNum = cellNum +1;
            }
        }

        public showPCB(pcbsInfo: any[][]) {
            let pcbTable: any = document.getElementById("pcbTableBody");
            let bodyScript: string = "";
            for (let pcbInfo of pcbsInfo) {
                bodyScript = bodyScript + "<tr>";
                for (let info of pcbInfo) {
                    bodyScript = bodyScript + "<td>" + info + "</td>";
                }
                bodyScript = bodyScript + "</tr>";
            }
            pcbTable.innerHTML = bodyScript;
        }
    }
 }
