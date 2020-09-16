/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter
     for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    var Console = /** @class */ (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer, 
        // Record cursor of end of line before proceed to next line
        end_of_line) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (buffer === void 0) { buffer = ""; }
            if (end_of_line === void 0) { end_of_line = []; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.end_of_line = end_of_line;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };
        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };
        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
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
                    this.end_of_line = [];
                }
                else if (chr === 8 || chr === "Backspace") {
                    // Implement backspace by removing last element in the buffer
                    // and cover printed value by the area of the value
                    // when reach begin of line go to previous line if there is a previous line
                    var remove_txt = this.buffer.substring(this.buffer.length - 1, this.buffer.length);
                    this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, remove_txt);
                    this.currentXPosition = this.currentXPosition - offset;
                    var height = -1 * (_DefaultFontSize
                        + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize)
                        + _FontHeightMargin);
                    _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition + _FontHeightMargin, offset, height);
                    if (this.currentXPosition <= 0 && this.end_of_line.length > 0) {
                        this.backLine();
                    }
                }
                else if (chr === 38 || chr === "ArrowUp") {
                    // Clear current text on screen
                    // Go to the buffer history to reload history command
                    // print history command
                    // Else statement to keep history cursor to be always first command
                    if (histCursor > 0) {
                        this.clear_text();
                        histCursor = histCursor - 1;
                        this.buffer = historyCMD[histCursor];
                        this.putText(this.buffer);
                    }
                    else {
                        histCursor = 0;
                    }
                }
                else if (chr === 40 || chr === "ArrowDown") {
                    // Clear current text on screen
                    // set cursor to load recent command to the buffer
                    // If no more history command present, currnt buffer set to ""
                    if (histCursor < historyCMD.length) {
                        this.clear_text();
                        histCursor = histCursor + 1;
                        this.buffer = historyCMD[histCursor];
                        if (typeof this.buffer === 'undefined') {
                            this.buffer = "";
                        }
                        this.putText(this.buffer);
                    }
                }
                else if (chr === 9 || chr === "Tab") {
                    // Tab to auto complete command or should available command with similar heading
                    if (this.buffer !== "") {
                        var similar_cmd = [];
                        for (var _i = 0, _a = _OsShell.commandList; _i < _a.length; _i++) {
                            var cmd = _a[_i];
                            if (this.buffer === cmd.command.substr(0, this.buffer.length)) {
                                similar_cmd.push(cmd.command);
                            }
                        }
                        if (similar_cmd.length == 1) {
                            // Auto complete command when there is only one similar command
                            this.clear_text();
                            this.buffer = similar_cmd.pop();
                            this.putText(this.buffer);
                        }
                        else if (similar_cmd.length > 1) {
                            // Auto complete to most common letter and print all available command
                            var suggest = this.get_filled_txt(similar_cmd);
                            this.buffer = suggest;
                            this.advanceLine();
                            var more_suggest_txt = "";
                            for (var _b = 0, similar_cmd_1 = similar_cmd; _b < similar_cmd_1.length; _b++) {
                                var cmd = similar_cmd_1[_b];
                                more_suggest_txt = more_suggest_txt + " " + cmd;
                            }
                            this.putText(more_suggest_txt);
                            this.advanceLine();
                            _OsShell.putPrompt();
                            this.putText(suggest);
                        }
                    }
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    if (chr.length < 2) {
                        this.putText(chr);
                        // ... and add it to our buffer.
                        this.buffer += chr;
                    }
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        };
        Console.prototype.putText = function (text) {
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
                for (var i = 0; i < text.length; i++) {
                    var print_txt = text.charAt(i);
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, print_txt);
                    // If the current X position plus next input size is bigger than the 
                    // width of the console canvas, then store current x position for backspace purpose and 
                    // advance to the next with curr
                    if (this.currentXPosition + offset > _Canvas.width) {
                        this.end_of_line.push(this.currentXPosition);
                        this.advanceLine();
                    }
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, print_txt);
                    this.currentXPosition = this.currentXPosition + offset;
                }
            }
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            this.currentYPosition += this.get_deltaY();
            /*
                If the current Y position is greate than the canvas height then
                save image of the canvas, remove all drawing on the canvas
                and print the save image at y position less than origin of the canvas
            */
            if (this.currentYPosition > _Canvas.height) {
                var console_img = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height);
                this.clearScreen();
                _DrawingContext.putImageData(console_img, 0, -1 * this.get_deltaY());
                this.currentYPosition = this.currentYPosition - this.get_deltaY();
            }
        };
        // Return to the previous line in the currnt prompt
        Console.prototype.backLine = function () {
            this.currentXPosition = this.end_of_line.pop();
            this.currentYPosition -= this.get_deltaY();
        };
        // Return change in Y value from line to line 
        Console.prototype.get_deltaY = function () {
            /*
            * Font size measures from the baseline to the highest point in the font.
            * Font descent measures from the baseline to the lowest point in the font.
            * Font height margin is extra spacing between the lines.
            */
            return _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
        };
        // Clear text for replace current printed text with history text
        Console.prototype.clear_text = function () {
            var height = -1 * this.get_deltaY();
            var clear_x = _DrawingContext.measureText(this.currentFont, this.currentFontSize, ">");
            if (this.end_of_line.length > 0) {
                this.end_of_line.push(_Canvas.width);
                while (this.end_of_line.length > 1) {
                    _DrawingContext.clearRect(0, this.currentYPosition + _FontHeightMargin, this.end_of_line.pop(), height);
                    this.currentYPosition -= this.get_deltaY();
                }
                _DrawingContext.clearRect(clear_x, this.currentYPosition + _FontHeightMargin, this.end_of_line.pop(), height);
                this.currentXPosition = clear_x;
            }
            else {
                this.currentXPosition = clear_x;
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer);
                _DrawingContext.clearRect(clear_x, this.currentYPosition + _FontHeightMargin, offset, height);
            }
        };
        // Get auto complete text base on buffer text
        Console.prototype.get_filled_txt = function (similar_cmd) {
            var suggest = "";
            for (var txt_idx = 0; txt_idx < similar_cmd.length; txt_idx++) {
                for (var nxt_idx = txt_idx + 1; nxt_idx < similar_cmd.length; nxt_idx++) {
                    for (var l_idx = 0; l_idx < similar_cmd[txt_idx].length; l_idx++) {
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
        };
        Console.prototype.showBsod = function (msg) {
            _DrawingContext.fillStyle = 'blue';
            _DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
            _Console.currentYPosition = _Console.currentYPosition - _Canvas.height / 2;
            _Console.putText("The OS is experiencing unexpected error due to: " + msg);
            _Console.advanceLine();
            _Console.putText("The OS will be shutdown and record this error to help prevent future error.");
            _Console.advanceLine();
            _Console.putText("Please reset the Operating System to continue.");
        };
        Console.prototype.showSysDatetime = function (date, time) {
            var date_html = document.getElementById("date");
            var time_html = document.getElementById("time");
            date_html.innerText = date;
            time_html.innerText = time;
        };
        Console.prototype.showMemory = function (memoryMatrix) {
            var memoryTable = document.getElementById("memoryTable");
            var htmlScript = "";
            var rowNum = 0;
            var segNum = 0;
            for (var _i = 0, memoryMatrix_1 = memoryMatrix; _i < memoryMatrix_1.length; _i++) {
                var row = memoryMatrix_1[_i];
                htmlScript = htmlScript + "<tr>" + "<td bgcolor='lightblue'>" + String(segNum) + rowNum + "</td>";
                for (var _a = 0, row_1 = row; _a < row_1.length; _a++) {
                    var col = row_1[_a];
                    htmlScript = htmlScript + "<td>" + col + "</td>";
                    rowNum = rowNum + 1;
                }
                htmlScript = htmlScript + " </tr>";
            }
            memoryTable.innerHTML = htmlScript;
        };
        Console.prototype.showCPU = function (cpuInfo) {
            var cpuTable = document.getElementById("cpuTable");
            var cellNum = 0;
            for (var _i = 0, cpuInfo_1 = cpuInfo; _i < cpuInfo_1.length; _i++) {
                var info = cpuInfo_1[_i];
                cpuTable.rows[1].cells[cellNum] = info;
                cellNum = cellNum + 1;
            }
        };
        Console.prototype.showPCB = function (pcbsInfo) {
            var pcbTable = document.getElementById("pcbTableBody");
            var bodyScript = "";
            for (var _i = 0, pcbsInfo_1 = pcbsInfo; _i < pcbsInfo_1.length; _i++) {
                var pcbInfo = pcbsInfo_1[_i];
                bodyScript = bodyScript + "<tr>";
                for (var _a = 0, pcbInfo_1 = pcbInfo; _a < pcbInfo_1.length; _a++) {
                    var info = pcbInfo_1[_a];
                    bodyScript = bodyScript + "<td>" + info + "</td>";
                }
                bodyScript = bodyScript + "</tr>";
            }
            pcbTable.innerHTML = bodyScript;
        };
        return Console;
    }());
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
