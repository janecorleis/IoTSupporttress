var counter = 0;
var redCounter = 0;
var yellowCounter = 0;
var greenCounter = 0;

/**
* setInterval wird jede Sekunde aktiv
**/
setInterval(function(){
  readTextFile("messages.json", function(text){
    var data = JSON.parse(text);
    showContent(data);
  });
}, 1000);


// FUNKTIONEN //

/**
* liest json-Datei aus, in der die message-Objekte vom Raspberry liegen
**/
function readTextFile(file, callback) {
  var rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType("application/json");
  rawFile.open("GET", file, true);
  rawFile.onreadystatechange = function() {
    if (rawFile.readyState === 4 && rawFile.status == 200) {
      callback(rawFile.responseText);
    }
  }
  rawFile.send(null);
}

/**
* baut für Messages auf der Anwendung die divs zusammen
* lies sich leider nicht besser lösen, da Funktion bei ondblclick nicht korrekt gesetzt werden konnte
**/
function showContent(data) {
  for (var i = counter; i < data.length; i++) {
    var messageId = data[i].messageId;
    var bedId = data[i].bedId;
    var roomId = data[i].roomId;
    var ledcolor = data[i].ledcolor;
    var classname = ledcolor + "Msg message";
    var message = data[i].message;

    var htmlString = "<div ";
    var idString = "id=\'" + messageId + "\' ";
    var classString = "class=\'" + classname + "\' ";
    if (ledcolor == 'red') {;
      var functionString = "ondblclick=\'completed(" + bedId + ", " + messageId + ", 1)\'";
    } else if (ledcolor == 'yellow') {;
      var functionString = "ondblclick=\'completed(" + bedId + ", " + messageId + ", 2)\'";
    } else if (ledcolor == 'green') {;
      var functionString = "ondblclick=\'completed(" + bedId + ", " + messageId + ", 3)\'";
    }
    var htmlEndString = "/>" + "<h3>Raum " + roomId + ", Bett " + bedId + "</h3>" + "<p>" + message;

    htmlString += idString + classString + functionString + htmlEndString;

    var msgcontainer = document.getElementById("msg");
    msgcontainer.insertAdjacentHTML('beforeend', htmlString);
  }
  checkMessages(data);
  counter = data.length;
}

/**
* checkt, welche LED-Abbildung fuer bestimmte Message an gehen muss
**/
function checkMessages(data) {
  if (counter < data.length) {
    var msg = document.getElementById("msg");
    var msgs = msg.children;
    for (var i = 0; i < msgs.length; i++) {
      if (msgs[i].className == 'redMsg message') {
        ledOn("red");
        redCounter++;
      } else if (msgs[i].className == 'yellowMsg message') {
        ledOn("yellow");
        yellowCounter ++;
      } else if (msgs[i].className == 'greenMsg message') {
        ledOn("green");
        greenCounter++;
      }
    }
  }
}

function ledOn(color) {
  if (color == "green") {
    var circle = document.getElementById("green-circle");
    circle.style.visibility = "visible";
  } else if (color == "yellow") {
    var circle = document.getElementById("yellow-circle");
    circle.style.visibility = "visible";
  } else if (color == "red") {
    var circle = document.getElementById("red-circle");
    circle.style.visibility = "visible";
  }
}

/**
* Wenn Meldungs-Grund bearbeitet wurde, kann Message aus Anwendung entfernt werden.
* LED-Abbildung auf Bett wird, wenn keine weiteren Messages mit gleicher Farbe angezeigt werden, ausgeschaltet.
* Hier wird nicht beruecksichtigt, ob die Msg zu einem bestimmten Bett gehoert
* -> ausreichend fuer Prototypen, da nur ein Bett betrachtet wird
**/
function completed(bedId, msgId, ledColor) {
  if (ledColor == 1) {
    ledColor = "red";
  } else if (ledColor == 2) {
    ledColor = "yellow";
  } else if (ledColor == 3) {
    ledColor = "green";
  }
  document.getElementById(msgId).innerHTML = "<strong>Erledigt</strong>";
  var className = ledColor + "Msg";
  var classElements = document.getElementsByClassName(className);

  if (classElements.length == 1) {
    ledOff(ledColor);
  }
  setTimeout(function(){
    document.getElementById(msgId).remove();
  }, 500);
}

function ledOff(color) {
  if (color == "green") {
    var circle = document.getElementById("green-circle");
    circle.style.visibility = "hidden";
  } else if (color == "yellow") {
    var circle = document.getElementById("yellow-circle");
    circle.style.visibility = "hidden";
  } else if (color == "red") {
    var circle = document.getElementById("red-circle");
    circle.style.visibility = "hidden";
  }
}
