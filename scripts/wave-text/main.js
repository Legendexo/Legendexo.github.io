/*! \file main.js
 *  \brief Text transfer over sound
 *  \author Georgi Gerganov
 */

function transmitText(sText) {
    var r = new Uint8Array(256);
    for (var i = 0; i < sText.length; ++i) {
        r[i] = sText.charCodeAt(i);
    }

    var buffer = Module._malloc(256);
    Module.writeArrayToMemory(r, buffer, 256);
    Module.cwrap('setText', 'number', ['number', 'buffer'])(sText.length, buffer);
    Module._free(buffer);
}

var firstTimeFail = false;
var peerInfo = document.querySelector('a#peer-info');
var peerReceive = document.querySelector('a#peer-receive');

function updatePeerInfo() {
    if (typeof Module === 'undefined') return;
    var framesLeftToRecord = Module.cwrap('getFramesLeftToRecord', 'number', [])();
    var framesToRecord = Module.cwrap('getFramesToRecord', 'number', [])();
    var framesLeftToAnalyze = Module.cwrap('getFramesLeftToAnalyze', 'number', [])();
    var framesToAnalyze = Module.cwrap('getFramesToAnalyze', 'number', [])();

    if (framesToAnalyze > 0) {
        peerInfo.innerHTML=
            "Analyzing Rx data: <progress value=" + (framesToAnalyze - framesLeftToAnalyze) +
            " max=" + (framesToRecord) + "></progress>";
        peerReceive.innerHTML= "";
    } else if (framesLeftToRecord > Math.max(0, 0.05*framesToRecord)) {
        firstTimeFail = true;
        peerInfo.innerHTML=
            "Transmission in progress: <progress value=" + (framesToRecord - framesLeftToRecord) +
            " max=" + (framesToRecord) + "></progress>";
        peerReceive.innerHTML= "";
    } else if (framesToRecord > 0) {
        peerInfo.innerHTML= "Analyzing Rx data ...";
    } else if (framesToRecord == 0) {
        peerInfo.innerHTML= "<p>Listening for waves ...</p>";
    } else if (framesToRecord == -1) {
        if (firstTimeFail) {
            playSound("/media/case-closed");
            firstTimeFail = false;
        }
        peerInfo.innerHTML= "<p style=\"color:red\">Failed to decode Rx data</p>";
    }
}

function updateRx() {
    if (typeof Module === 'undefined') return;
    Module.cwrap('getText', 'number', ['buffer'])(bufferRx);
    var result = "";
    for (var i = 0; i < 140; ++i){
        result += (String.fromCharCode((Module.HEAPU8)[bufferRx + i]));
        brx[i] = (Module.HEAPU8)[bufferRx + i];
    }
    document.getElementById('rxData').innerHTML = result;
}
