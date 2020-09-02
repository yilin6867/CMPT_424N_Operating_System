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
                        history_cmd.push(this.buffer);
                    }
                    hist_cursor = history_cmd.length;
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
                    console.log(chr, hist_cursor, history_cmd.length)
                    if (hist_cursor > 0) {
                        this.clear_text();
                        hist_cursor = hist_cursor - 1;
                        this.buffer = history_cmd[hist_cursor];
                        this.putText(this.buffer);
                    } else {
                        hist_cursor = 0;
                    }
                } else if (chr === 40 || chr === "ArrowDown") {
                    // Clear current text on screen
                    // set cursor to load recent command to the buffer
                    // If no more history command present, currnt buffer set to ""
                    console.log(chr, hist_cursor, history_cmd.length)
                    if (hist_cursor < history_cmd.length) {
                        this.clear_text();
                        hist_cursor = hist_cursor + 1;
                        this.buffer = history_cmd[hist_cursor];
                        if (typeof this.buffer === 'undefined') {
                            this.buffer = ""
                        }
                        this.putText(this.buffer);
                    }
                
                } else if (chr === 9 || chr === "Tab") {
                    if (this.buffer !== "") {
                        let similar_cmd: string[] = [];
                        for (let cmd of _OsShell.commandList) {
                            console.log(this.buffer, cmd.command, cmd.command.substr(0, this.buffer.length))
                            if (this.buffer ===  cmd.command.substr(0, this.buffer.length)) {
                                similar_cmd.push(cmd.command);
                            }
                        }
                        if (similar_cmd.length == 1) {
                            this.clear_text();
                            this.buffer = similar_cmd.pop();
                            this.putText(this.buffer)
                        } else if (similar_cmd.length > 1) {
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
                } else {
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
        }

        public putText(text): void {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
            console.log(text);
            if (text !== "" && typeof text !== 'undefined') {
                /*
                    Use for loop to print each chracter along the X line. If the current X position is 
                    bigger than the width of the console canvas then current X value is set to zero and 
                    the current Y value set current Y values plus 1.5 times of font size to insure the
                    remaining text is printed on the new line
                */
                for (let i: number = 0; i < text.length; i++) {
                    let print_txt : string = text.charAt(i);
                    let offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize
                        , print_txt);
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
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += this.get_deltaY();

            if (this.currentYPosition > _Canvas.height) {
                let console_img : ImageData = _DrawingContext.getImageData(0,0, _Canvas.width, _Canvas.height);
                this.clearScreen()
                _DrawingContext.putImageData(console_img, 0, -1 * this.get_deltaY());
                this.currentYPosition = this.currentYPosition - this.get_deltaY();
                console.log(-1 * this.get_deltaY(), this.currentYPosition);
            }
        }

        public backLine(): void {
            this.currentXPosition = this.end_of_line.pop();
            this.back_Y_pos();
        }

        public back_Y_pos(): void {
            this.currentYPosition -= this.get_deltaY();
        }
        
        public get_deltaY() : number {
            return _DefaultFontSize + 
                    _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                    _FontHeightMargin;
        }

        public clear_text(): void {
            let height = -1 * this.get_deltaY();
            if (this.end_of_line.length > 0) {
                this.end_of_line.push(_Canvas.width);
                console.log(this.end_of_line.length)
                while(this.end_of_line.length > 0) {
                    _DrawingContext.clearRect(0, this.currentYPosition + _FontHeightMargin
                        , this.end_of_line.pop(), height);
                    this.back_Y_pos();
                }
                this.advanceLine();
                this.currentXPosition = 0;
                _OsShell.putPrompt();
            } else {
                let clear_x: number = _DrawingContext.measureText(this.currentFont, this.currentFontSize
                    , ">");
                this.currentXPosition = clear_x;
                let offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize
                    , this.buffer);
                _DrawingContext.clearRect(clear_x, this.currentYPosition + _FontHeightMargin
                    , offset, height);
            }
        }

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
    }
 }
