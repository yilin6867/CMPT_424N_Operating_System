/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel File System Device Driver.
   ---------------------------------- */

   module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverFS extends DeviceDriver {
        hardDirveData: any[] = [];

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnFSDriverEntry;
            this.isr = this.krnSwapping;
            for (let _ = 0; _ < (4*8*8); _++) {
                this.hardDirveData.push({})
            }
        }

        public krnFSDriverEntry(mode:string) {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            let is_success = 1
            window.localStorage.clear()
            // Construction hard drive t:s:b section from 0:0:0 to 3:7:7 total of 256 record
            for (let i = 0; i < (4*8*8); i++) {
                this.hardDirveData[i]["tsb"] = i
                this.hardDirveData[i]["used"] = 0
                this.hardDirveData[i]["next"] = "-"
                if (mode === "-full"  || this.status !== "loaded") {
                    let data: any[] = new Array(60);
                    data.fill("-")
                    this.hardDirveData[i]["data"] = data
                }                
            }
            this.hardDirveData[0]["used"] = 1
            this.storeHDDToLocal()
            this.status = "loaded";
            is_success = 0
            return [is_success]
        }

        public krnSwapping(nextProcess) {
            if (nextProcess.location < 0) {
                console.log("Swapped Process Location ", nextProcess.location)
                let inMemorySegment = _CPU.runningPCB.location;
                let fileIdx = nextProcess.location * -1;
                let inHex = false;
                let readData = _Kernel.krnGetHDDEntryByIdx(fileIdx, inHex);
                // Change string to separate every hex with space
                let dataInHDD = readData[1].match(/.{1,2}/g).join(" ");
                let dataInMem = _CPU.getLoadMemory(inMemorySegment, true).join().split(",").join(" ");
                console.log("Swapping code");
                console.log("Code from memory", dataInMem);
                console.log("Code from harddrive", dataInHDD);
                _Kernel.krnWriteFile(fileIdx, dataInMem, inHex);
                _CPU.writeProgram(inMemorySegment, dataInHDD, nextProcess.priority);
                nextProcess.location = inMemorySegment;
                _CPU.runningPCB.location = fileIdx * -1;
                console.log("swap data harddrive entry " + fileIdx + " memory segment " + inMemorySegment);
            }
        }

        public get_tsb(idx: number) {
            let t = Math.floor(idx / 64);
            let s = Math.floor((idx - (t * 64)) / 8);
            let b = (idx - (t * 64)) % 8;
            return [t, s, b].join(":");
        }

        public storeHDDToLocal() {
            for (let entry of this.hardDirveData) {
                let dataToStore = entry["used"] + "," + entry["next"] + "," + entry["data"].join(",");
                window.localStorage.setItem(entry["tsb"], dataToStore);
            }
        }
        public loadHDDFromLocal() {
            for (let entryIdx in this.hardDirveData) {
                let entryData: any[] = window.localStorage.getItem(entryIdx.toString()).split(",");
                this.hardDirveData[entryIdx]["used"] = entryData.shift();
                this.hardDirveData[entryIdx]["next"] = entryData.shift();
                this.hardDirveData[entryIdx]["data"] = entryData;
            }
        }

        public createfile(filename: string) {
            let fileIDX = 1;
            let is_success = 1;
            for (; fileIDX < 64; fileIDX ++) {
                if (this.hardDirveData[fileIDX]["used"] !== "1") {
                    let dataIdx = 64;
                    for (; dataIdx < this.hardDirveData.length; dataIdx++) {
                        if (this.hardDirveData[dataIdx]["used"] !== "1") {
                            this.hardDirveData[fileIDX]["next"] =  this.get_tsb(dataIdx);
                            this.hardDirveData[dataIdx]["used"] =  "1";
                            break;
                        }
                    }
                    this.hardDirveData[fileIDX]["data"] = new Array(60).fill("-")
                    for (let charIdx = 0; charIdx < filename.length; charIdx++) {
                        let hex = filename.charCodeAt(charIdx).toString(16);
                        this.hardDirveData[fileIDX]["data"][charIdx] = hex.toUpperCase();
                        console.log("write file name at entry ", fileIDX, charIdx);
                    }
                    this.hardDirveData[fileIDX]["used"] = "1";
                    is_success = 0;
                    break;
                }
            }
            if (fileIDX >= 64) {
                return [is_success, "Unable to create new file. The file system is full." + 
                        "Please delete some file or format the disk to create more space"];
            }
            console.log(filename, fileIDX);
            window.localStorage.setItem(filename, fileIDX.toString());
            this.storeHDDToLocal();
            return [is_success, fileIDX];
        }

        public existFile(filename) {
            return window.localStorage.getItem(filename);
        }

        public renameFile(oldName, newName) {
            let entryIdx = window.localStorage.getItem(oldName);
            if (entryIdx) {
                window.localStorage.setItem(newName, entryIdx);
                window.localStorage.removeItem(oldName);
                this.hardDirveData[entryIdx]["data"] = new Array().fill("0");
                for (let charIdx = 0; charIdx < newName.length; charIdx++) {
                    let hex = newName.charCodeAt(charIdx).toString(16);
                    this.hardDirveData[entryIdx]["data"][charIdx] = hex.toUpperCase();
                }
                return 0;
            } else {
                return 1;
            }
        }

        public readFile(filename: string, idx: number = null, inHex: boolean=true) {
            let is_success = 1;
            let entryIdx;
            let return_text;
            if (idx === null) {
                entryIdx = window.localStorage.getItem(filename);
            } else {
                entryIdx = idx;
            }
            if (entryIdx === null) {
                return [is_success, "File does not exist. "];
            } else {
                let nextTSB = this.hardDirveData[entryIdx]["next"].split(":");
                let rendet_text = [];
                while(nextTSB[0] !== "-") {
                    let next = parseInt(nextTSB[0]) * 64 + parseInt(nextTSB[1]) * 8 + parseInt(nextTSB[2]);
                    console.log(nextTSB[0], next);
                    let data = this.hardDirveData[next]["data"];
                    let readHex = data[0];
                    let readIdx = 0;
                    if (inHex) {
                        while(readIdx < data.length && readHex !== "-") {
                            readHex = parseInt(readHex, 16);
                            let readChar = String.fromCharCode(readHex);
                            rendet_text.push(readChar);
                            readIdx = readIdx + 1;
                            readHex = data[readIdx];
                        }
                    } else {
                        while(readIdx < data.length && readHex !== "-") {
                            rendet_text.push(readHex);
                            readIdx = readIdx + 1;
                            readHex = data[readIdx];
                        }
                    }
                    nextTSB = this.hardDirveData[next]["next"].split(":");
                    console.log("next tsb ", this.hardDirveData[next]["next"], nextTSB);
                }
                return_text = rendet_text.join("");
                is_success = 0;
            }
            return [is_success, return_text];
        }

        public writeFile(filename: string, data: string, inHex: boolean, idx:number=null) {
            let is_success = 1;
            let charIdx = 0;
            let chainIdx = 0;
            let entryDataIdx = 0;
            let entryDataLength;
            let entryIdx;
            if (idx === null) {
                entryIdx = window.localStorage.getItem(filename);
            } else {
                entryIdx = idx;
            }
            console.log(entryIdx);
            if (entryIdx === null) {
                return [is_success, "File does not exists. "];
            } else {
                let nextTSB = this.hardDirveData[entryIdx]["next"].split(":");
                let next = parseInt(nextTSB[0]) * 64 + parseInt(nextTSB[1]) * 8 + parseInt(nextTSB[2]);
                let innerNext = next;
                console.log("Next entry to write, ", innerNext);
                while(nextTSB[0] !== "-") {
                    this.hardDirveData[innerNext]["used"] = 0;
                    this.hardDirveData[innerNext]["data"] = new Array(60).fill("-");
                    nextTSB = this.hardDirveData[innerNext]["next"].split(":");
                    console.log("next tsb to delete, ", nextTSB);
                    innerNext = parseInt(nextTSB[0]) * 64 + parseInt(nextTSB[1]) * 8 + parseInt(nextTSB[2]);
                }
                entryDataLength = this.hardDirveData[next]["data"].length;
                let historical_next = [];
                this.hardDirveData[next]["used"] = "1";
                let loopData;
                if (inHex) {
                    loopData = data;
                } else {
                    loopData = data.split(" ");
                }
                console.log("data to write to harddrive", loopData);
                while(charIdx < loopData.length) {
                    let hexCode = inHex ? loopData.charCodeAt(charIdx).toString(16) : loopData[charIdx];
                    this.hardDirveData[next]["data"][entryDataIdx] = hexCode.toUpperCase();
                    charIdx = (chainIdx * entryDataLength) + entryDataIdx + 1;
                    entryDataIdx = entryDataIdx + 1;
                    if (entryDataIdx >= entryDataLength) {
                        chainIdx = Math.floor(charIdx / entryDataLength);
                        entryDataIdx = 0;
                        historical_next.push(next);
                        for (let data_idx = 64; data_idx < this.hardDirveData.length; data_idx++) {
                            if (this.hardDirveData[data_idx]["used"] !== "1") {
                                next = data_idx;
                                this.hardDirveData[next]["used"] = "1";
                                break;
                            }
                        }
                    }
                }
                while (historical_next.length > 0) {
                    console.log(next, this.get_tsb(next), historical_next);
                    let past_next = historical_next.pop();
                    this.hardDirveData[past_next]["next"] = this.get_tsb(next);
                    next = past_next;
                }
                is_success = 0;
                this.storeHDDToLocal();
            }
            return [is_success, entryIdx, 0, (chainIdx * entryDataLength) + entryDataIdx + 1];
        }

        public deleteFile(filename: string, idx:number = null) {
            let is_success = 1;
            let entryIdx ;
            if (idx === null) {
                entryIdx = window.localStorage.getItem(filename);
            } else {
                entryIdx = idx;
            }
            if (entryIdx === null) {
                return [is_success, "File does not exists. "];
            } else {
                let nextTSB = this.hardDirveData[entryIdx]["next"].split(":");
                let next = parseInt(nextTSB[0]) * 64 + parseInt(nextTSB[1]) * 8 + parseInt(nextTSB[2]);
                this.hardDirveData[entryIdx]["next"] = 0;
                this.hardDirveData[entryIdx]["used"] = 0;
                while (next !== 0 && !(isNaN(next))) {
                    console.log("Next entry to delete ", next);
                    this.hardDirveData[next]["used"] = 0;
                    nextTSB = this.hardDirveData[next]["next"].split(":");
                    next = parseInt(nextTSB[0]) * 64 + parseInt(nextTSB[1]) * 8 + parseInt(nextTSB[2]);
                }
                is_success = 0;
                this.storeHDDToLocal();
                window.localStorage.removeItem(filename);
                return [is_success, entryIdx];
            }
        }

        public get_files() {
            let files = [];
            for (let idx = 0; idx < 64; idx++) {
                if (this.hardDirveData[idx]["used"] == 1) {
                    let data_idx = 0;
                    while(this.hardDirveData[idx]["data"][data_idx] !== "-") {
                        data_idx = data_idx + 1;
                    }
                    let filename = "";
                    for (let hex of this.hardDirveData[idx]["data"].slice(0, data_idx)) {
                        filename = filename + String.fromCharCode(parseInt(hex, 16));
                    }
                    files.push(filename);
                }
            }
            return files;
        }
    }
}
