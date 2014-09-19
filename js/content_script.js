// JavaScript Document//


console.log("BrowserLocker: content inject startup..");

// https://developer.mozilla.org/en-US/docs/DOM/element.addEventListener

// http://stackoverflow.com/questions/9424550/how-can-i-detect-keyboard-events-in-gmail

var lastWakeupSentAt = new Date();
var lockoutDiv = null;

var ACTIVITY_GRANULARITY = 5000;  // 5 seconds

function _dom_eventReceived(evt) {
  // console.log("event received: " + evt);
  var now = new Date();
  var elapsedMS = now - lastWakeupSentAt;
  if (elapsedMS > ACTIVITY_GRANULARITY) {
     lastWakeupSentAt = now;
     console.log("BrowserLocker: activity detected at: " + now);
     chrome.extension.sendMessage( { method: "activity" }, function (data) { });

     // if (chrome.extension.inIncognitoContext) {   }
  }
}

function _dom_focusReceived(evt) {
  if (lockoutDiv != null) {
     chrome.extension.sendMessage( { method: "lockedActivity" }, function (data) { });
  }
}

function _dom_unloadReceived(evt) {
  if (lockoutDiv != null) {
    alert("dont allow unload");
  }
}

function setupEventListeners(target) {
  // list of events...
  // http://help.dottoro.com/larrqqck.php
  // console.log("setup event listeners");
  var lastWakeupSentAt = new Date();
  chrome.extension.sendMessage( { method: "activity" }, function (data) { });
  console.log("BrowserLocker: setupEventListeners: " + target);


  target.addEventListener("focus",_dom_eventReceived,true);
  target.addEventListener("mousemove",_dom_eventReceived,true);
  target.addEventListener("keydown",_dom_eventReceived,true);
  target.addEventListener("keypress",_dom_eventReceived,true);
  target.addEventListener("mousewheel",_dom_eventReceived,true);
  target.addEventListener("resize",_dom_eventReceived,true);

  target.addEventListener("focus",_dom_focusReceived,true);
  target.addEventListener("unload",_dom_unloadReceived,true);
}

// setupEventListeners(document);


var handledFrames = {};
function checkForNewIframe(doc, uniq) {
    try {
        if (!doc) return; // document does not exist. Cya
        // ^^^ For this reason, it is important to run the content script
        //    at "run_at": "document_end" in manifest.json

        // check for subframes of this document

        // using "iframe.id" is not reliable, especially for iframes without ids set.

        var iframes = doc.getElementsByTagName('iframe'), contentDocument;
        for (var i=0; i<iframes.length; i++) {            
            if (handledFrames[iframes[i].id]) {
              console.log("- iframe: " + iframes[i].id);
            } else {
              console.log("+ iframe: " + iframes[i].id);
              handledFrames[iframes[i].id] = true;
              setupEventListeners(iframes[i].contentDocument);
            }            

            checkForNewIframe(iframes[i].contentDocument);
        }
    } catch(e) {
        // Error: Possibly a frame from another domain?
        console.log('[ERROR] checkForNewIframe: '+e);
    }
}

var uniq = 1 + Math.random();
function checkFramesTimer() {
  console.log("BrowserLocker: checkFramesTimer()");
  checkForNewIframe(document, uniq);
  setTimeout (checkFramesTimer, 5000);
}

checkFramesTimer();

/*

chrome.extension.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
      // do nothing...
    });
});


function lockDownPage() {
     if (false && lockoutDiv == null) {
           lockoutDiv = document.createElement("div");
	   lockoutDiv.style.position = "fixed";
	   lockoutDiv.style.background = "white";
           // lockoutDiv.style.opacity = 0.5;
           lockoutDiv.style.top = 0;
           lockoutDiv.style.left = 0;
           lockoutDiv.style.width = "100%";
           lockoutDiv.style.height = "100%";
           lockoutDiv.style.zIndex = 1000;

           document.body.appendChild(lockoutDiv);
    }

}

function unlockPage() {
    if (lockoutDiv != null) {
        document.removeChild(lockoutDiv);
        lockoutDiv = null;
    }
 
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.method) {
        case "lockDown":
           console.log("received lockdown..." + new Date());
           // alert(request.data);  
           lockDownPage();
           break;
        case "unlock":
           unlockPage();
           break;
     }
});

*/