/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel File System Device Driver.
   ---------------------------------- */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverFS = /** @class */ (function (_super) {
        __extends(DeviceDriverFS, _super);
        function DeviceDriverFS() {
            // Override the base method pointers.
            var _this = 
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            _super.call(this) || this;
            _this.hardDirveData = [];
            _this.driverEntry = _this.krnFSDriverEntry;
            _this.isr = _this.krnSwapping;
            for (var _ = 0; _ < (4 * 8 * 8); _++) {
                _this.hardDirveData.push({});
            }
            return _this;
        }
        DeviceDriverFS.prototype.krnFSDriverEntry = function (mode) {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            var is_success = 1;
            window.localStorage.clear();
            // Construction hard drive t:s:b section from 0:0:0 to 3:7:7 total of 256 record
            for (var i = 0; i < (4 * 8 * 8); i++) {
                this.hardDirveData[i]["tsb"] = i;
                this.hardDirveData[i]["used"] = 0;
                this.hardDirveData[i]["next"] = "-";
                if (mode === "-full" || this.status !== "loaded") {
                    var data = new Array(60);
                    data.fill("-");
                    this.hardDirveData[i]["data"] = data;
                }
            }
            this.hardDirveData[0]["used"] = 1;
            this.storeHDDToLocal();
            this.status = "loaded";
            is_success = 0;
            return [is_success];
        };
        DeviceDriverFS.prototype.krnSwapping = function (nextProcess) {
            if (nextProcess.location < 0) {
                console.log("Swapped Process Location ", nextProcess.location);
                var inMemorySegment = _CPU.runningPCB.location;
                var fileIdx = nextProcess.location * -1;
                var inHex = false;
                var readData = _Kernel.krnGetHDDEntryByIdx(fileIdx, inHex);
                // Change string to separate every hex with space
                var dataInHDD = readData[1].match(/.{1,2}/g).join(" ");
                var dataInMem = _CPU.getLoadMemory(inMemorySegment, true).join().split(",").join(" ");
                console.log("Swapping code");
                console.log("Code from memory", dataInMem);
                console.log("Code from harddrive", dataInHDD);
                _Kernel.krnWriteFile(fileIdx, dataInMem, inHex);
                _CPU.writeProgram(inMemorySegment, dataInHDD, nextProcess.priority);
                nextProcess.location = inMemorySegment;
                _CPU.runningPCB.location = fileIdx * -1;
                console.log("swap data harddrive entry " + fileIdx + " memory segment " + inMemorySegment);
            }
        };
        DeviceDriverFS.prototype.get_tsb = function (idx) {
            var t = Math.floor(idx / 64);
            var s = Math.floor((idx - (t * 64)) / 8);
            var b = (idx - (t * 64)) % 8;
            return [t, s, b].join(":");
        };
        DeviceDriverFS.prototype.storeHDDToLocal = function () {
            for (var _i = 0, _a = this.hardDirveData; _i < _a.length; _i++) {
                var entry = _a[_i];
                var dataToStore = entry["used"] + "," + entry["next"] + "," + entry["data"].join(",");
                window.localStorage.setItem(entry["tsb"], dataToStore);
            }
        };
        DeviceDriverFS.prototype.loadHDDFromLocal = function () {
            for (var entryIdx in this.hardDirveData) {
                var entryData = window.localStorage.getItem(entryIdx.toString()).split(",");
                this.hardDirveData[entryIdx]["used"] = entryData.shift();
                this.hardDirveData[entryIdx]["next"] = entryData.shift();
                this.hardDirveData[entryIdx]["data"] = entryData;
            }
        };
        DeviceDriverFS.prototype.createfile = function (filename) {
            var fileIDX = 1;
            var is_success = 1;
            for (; fileIDX < 64; fileIDX++) {
                if (this.hardDirveData[fileIDX]["used"] !== "1") {
                    var dataIdx = 64;
                    for (; dataIdx < this.hardDirveData.length; dataIdx++) {
                        if (this.hardDirveData[dataIdx]["used"] !== "1") {
                            this.hardDirveData[fileIDX]["next"] = this.get_tsb(dataIdx);
                            this.hardDirveData[dataIdx]["used"] = "1";
                            break;
                        }
                    }
                    this.hardDirveData[fileIDX]["data"] = new Array(60).fill("-");
                    for (var charIdx = 0; charIdx < filename.length; charIdx++) {
                        var hex = filename.charCodeAt(charIdx).toString(16);
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
        };
        DeviceDriverFS.prototype.existFile = function (filename) {
            return window.localStorage.getItem(filename);
        };
        DeviceDriverFS.prototype.renameFile = function (oldName, newName) {
            var entryIdx = window.localStorage.getItem(oldName);
            if (entryIdx) {
                window.localStorage.setItem(newName, entryIdx);
                window.localStorage.removeItem(oldName);
                var dataLen = this.hardDirveData[entryIdx]["data"].length;
                this.hardDirveData[entryIdx]["data"] = new Array(dataLen).fill("-");
                for (var charIdx = 0; charIdx < newName.length; charIdx++) {
                    var hex = newName.charCodeAt(charIdx).toString(16);
                    this.hardDirveData[entryIdx]["data"][charIdx] = hex.toUpperCase();
                }
                this.storeHDDToLocal();
                return 0;
            }
            else {
                return 1;
            }
        };
        DeviceDriverFS.prototype.readFile = function (filename, idx, inHex) {
            if (idx === void 0) { idx = null; }
            if (inHex === void 0) { inHex = true; }
            var is_success = 1;
            var entryIdx;
            var return_text;
            if (idx === null) {
                entryIdx = window.localStorage.getItem(filename);
            }
            else {
                entryIdx = idx;
            }
            if (entryIdx === null) {
                return [is_success, "File does not exist. "];
            }
            else {
                var nextTSB = this.hardDirveData[entryIdx]["next"].split(":");
                var rendet_text = [];
                while (nextTSB[0] !== "-") {
                    var next = parseInt(nextTSB[0]) * 64 + parseInt(nextTSB[1]) * 8 + parseInt(nextTSB[2]);
                    console.log(nextTSB[0], next);
                    var data = this.hardDirveData[next]["data"];
                    var readHex = data[0];
                    var readIdx = 0;
                    if (inHex) {
                        while (readIdx < data.length && readHex !== "-") {
                            readHex = parseInt(readHex, 16);
                            var readChar = String.fromCharCode(readHex);
                            rendet_text.push(readChar);
                            readIdx = readIdx + 1;
                            readHex = data[readIdx];
                        }
                    }
                    else {
                        while (readIdx < data.length && readHex !== "-") {
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
        };
        DeviceDriverFS.prototype.writeFile = function (filename, data, inHex, idx) {
            if (idx === void 0) { idx = null; }
            var is_success = 1;
            var charIdx = 0;
            var chainIdx = 0;
            var entryDataIdx = 0;
            var entryDataLength;
            var entryIdx;
            if (idx === null) {
                entryIdx = window.localStorage.getItem(filename);
            }
            else {
                entryIdx = idx;
            }
            console.log(entryIdx);
            if (entryIdx === null) {
                return [is_success, "File does not exists. "];
            }
            else {
                var nextTSB = this.hardDirveData[entryIdx]["next"].split(":");
                var next = parseInt(nextTSB[0]) * 64 + parseInt(nextTSB[1]) * 8 + parseInt(nextTSB[2]);
                var innerNext = next;
                console.log("Next entry to write, ", innerNext);
                while (nextTSB[0] !== "-") {
                    this.hardDirveData[innerNext]["used"] = 0;
                    this.hardDirveData[innerNext]["data"] = new Array(60).fill("-");
                    nextTSB = this.hardDirveData[innerNext]["next"].split(":");
                    console.log("next tsb to delete, ", nextTSB);
                    innerNext = parseInt(nextTSB[0]) * 64 + parseInt(nextTSB[1]) * 8 + parseInt(nextTSB[2]);
                }
                entryDataLength = this.hardDirveData[next]["data"].length;
                var historical_next = [];
                this.hardDirveData[next]["used"] = "1";
                var loopData = void 0;
                if (inHex) {
                    loopData = data;
                }
                else {
                    loopData = data.split(" ");
                }
                console.log("data to write to harddrive", loopData);
                while (charIdx < loopData.length) {
                    var hexCode = inHex ? loopData.charCodeAt(charIdx).toString(16) : loopData[charIdx];
                    this.hardDirveData[next]["data"][entryDataIdx] = hexCode.toUpperCase();
                    charIdx = (chainIdx * entryDataLength) + entryDataIdx + 1;
                    entryDataIdx = entryDataIdx + 1;
                    if (entryDataIdx >= entryDataLength) {
                        chainIdx = Math.floor(charIdx / entryDataLength);
                        entryDataIdx = 0;
                        historical_next.push(next);
                        for (var data_idx = 64; data_idx < this.hardDirveData.length; data_idx++) {
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
                    var past_next = historical_next.pop();
                    this.hardDirveData[past_next]["next"] = this.get_tsb(next);
                    next = past_next;
                }
                is_success = 0;
                this.storeHDDToLocal();
            }
            return [is_success, entryIdx, 0, (chainIdx * entryDataLength) + entryDataIdx + 1];
        };
        DeviceDriverFS.prototype.deleteFile = function (filename, idx) {
            if (idx === void 0) { idx = null; }
            var is_success = 1;
            var entryIdx;
            if (idx === null) {
                entryIdx = window.localStorage.getItem(filename);
            }
            else {
                entryIdx = idx;
            }
            if (entryIdx === null) {
                return [is_success, "File does not exists. "];
            }
            else {
                var nextTSB = this.hardDirveData[entryIdx]["next"].split(":");
                var next = parseInt(nextTSB[0]) * 64 + parseInt(nextTSB[1]) * 8 + parseInt(nextTSB[2]);
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
        };
        DeviceDriverFS.prototype.get_files = function () {
            var files = [];
            for (var idx = 0; idx < 64; idx++) {
                if (this.hardDirveData[idx]["used"] == 1) {
                    var data_idx = 0;
                    while (this.hardDirveData[idx]["data"][data_idx] !== "-") {
                        data_idx = data_idx + 1;
                    }
                    var filename = "";
                    for (var _i = 0, _a = this.hardDirveData[idx]["data"].slice(0, data_idx); _i < _a.length; _i++) {
                        var hex = _a[_i];
                        filename = filename + String.fromCharCode(parseInt(hex, 16));
                    }
                    files.push(filename);
                }
            }
            return files;
        };
        return DeviceDriverFS;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverFS = DeviceDriverFS;
})(TSOS || (TSOS = {}));
