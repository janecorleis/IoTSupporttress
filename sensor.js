//alle benötigten Module einbinden
var express = require('express');
var app = express();
var path = require('path');
var fs = require("fs");
var five = require("johnny-five");

var board = new five.Board();

//Variablen für Sensoren (fsr -> Drucksensor, wtr -> Feuchtigkeitssensor) und Aktoren (motor -> Vibrationsmotor)
var fsr, wtr, motor;
var wet = false;
//Variabl für LEDs
var rled, yled, gled;
//Zählvariablen für die einzelnen Ereignisse
//ml -> motionless
var ml_count1 = 0, ml_count2 = 0, ml_cmp;
//eb -> empty bed
var eb_count = 0;
//tw -> twitch
var tw_count = 0, tw_cmp;
//Variablen für Intervalle
var mass, mass_rg1, mass_rg2, mass_rg3, mass_rg4
//Variablen für JSON Datei
var messageId = 1;
var data = [];
var bedId = 3;
var roomId = 2;
var ledcolor;
//jsonFile für zur Laufzeit entstehende messages
const jsonFile = "./public/messages.json";

//Server an dieser Stelle starten
startServer();

//jsonFile beim Starten des Programms leeren
clearJson();

board.on("ready", function() {

	//Neue 'fsr' Hardware-Instanz erstellen für Drucksensor
	fsr = new five.Sensor({
		pin: "A0",
		freq: 1000
	});

	//Neue 'wtr' Hardware-Instanz erstellen für Feuchtigkeitssensor
	wtr = new five.Sensor({
		pin: "A1",
		freq: 1000
	});

	//Neue 'motor' Hardware-Instanz erstellen für Vibrationsmotor
	motor = new five.Motor({
		pin: 5
	});

	//Zugriff erlauben, während Programm in Ausführung ist
	board.repl.inject({
		motor: motor
	});

	//LED
	rled = new five.Led(9);
	gled = new five.Led(11);
	yled = new five.Led(10);

	motor.on("start", function() {});

	motor.on("stop", function() {});

	//Werte von Drucksensor messen in einem Abstand von einer Sekunde
	fsr.scale([0, 255]).on("data", function() {

		//Aktueller Druck auf Sensor
		mass = this.scaled;

		if(mass != 0){
			//falls Druck besteht, wird empty_bed Variable auf 0 gesetzt
			eb_count = 0;

			//motionless variable wird das erste mal geprüft
			if(ml_count1 == 0){
				ml_cmp = mass;
				//Intervall für Bewegungsstillstand wird berechnet
				mass_rg1 = ml_cmp + 10;
				mass_rg2 = ml_cmp - 10;
				ml_count1 = 1;
			}

			//wurde Intervall bereits festgelegt, wird getestet ob sich der Druck im Intervall befindet
			//wenn ja, wird motionless Variable hochgezählt
			//wenn nein, wurde Kette unterbrochen und ml_count wird auf 0 zurück gesetzt
			if(ml_count1 >= 1){
				if(mass > mass_rg2 && mass < mass_rg1){
					ml_count1++;
				} else {
					ml_count1 = 0;
				}
			}

			//twitch variable wird das erste mal geprüft und Intervall für Zuckungen wird berechnet
			if(tw_count == 0){
				mass_rg3 = mass + 5;
				mass_rg4 = mass - 5;
				tw_count = 1;

				//es wird geprüft, ob Druck außerhalb des Intervalls liegt
				//wenn ja, wird twicht Variable hochgezählt und neues Intervall wird berechnet
				//wenn nein, wurde kette unterbrochen und tw_count wir auf 0 zurück gesetzt
			} else if(tw_count >= 1){
				if(mass < mass_rg4 || mass > mass_rg3){
					tw_count++;
					mass_rg3 = mass + 5;
					mass_rg4 = mass - 5;
				} else {
					tw_count = 0;
				}
			}

			//wenn Druck mehrmals hintereinander 0 ist, wird die empty_bed Variable hochgezählt
			//alle anderen Zählvariablen müssen auf 0 zurück gesetzt werden, damit alle auftretenden Ereignisse von vorne hochgezählt werden können
		} else if (mass == 0){
			eb_count++;
			ml_count1 = 0;
			ml_count2 = 0,
			tw_count = 0;
		}

		//wenn empty_bed Variable 5 mal hintereinander 0 ist, befindet sich Person nicht mehr im Bett
		if(eb_count == 15){
			console.log("Person befindet sich nicht mehr im Bett");

			//rote LED blinkt auf, wenn sich Person nicht mehr im Bett befindet
			gled.blink(300);
			newMessage(bedId, roomId, "Person befindet sich nicht im Bett", "green");
			//nach 3 Sekunden blinken, erlischt LED wieder
			board.wait(3000, function() {
				gled.stop().off();
			});
			//alle Zählvariablen werden zurück auf 0 gesetzt
			eb_count = 0;
			ml_count2 = 0;
			ml_count1 = 0;
			tw_count = 0;

			//wenn motionless Variable 5 mal hintereinander innerhalb des Intervalls liegt ist, bewegt sich Mensch nicht mehr
			//es wird bis 6 gezählt, da ml_count1 einen Zähldurchlauf überspringt (line 73)
		} else if(ml_count1 == 9){
			if(ml_count2 < 2){
				ml_count2++;
				console.log("Person bewegt sich nicht mehr");
				//Person wird durch Motor angeregt sich zu bewegen
				motor.start(30);

				board.wait(3000, function() {
					motor.stop();
				});

				//wurde ml_count2 3 mal hintereinander gezählt, bewegt sich Person zu lange nicht mehr
			} else if(ml_count2 == 2){
				//rote LED blinkt auf, um Pfleger zu signalisieren
				rled.blink(150);
				newMessage(bedId, roomId, "Person hat sich zu lange nicht mehr bewegt", "red");
				board.wait(3000, function() {
					rled.stop().off();
				});
				ml_count2 = 0;
			}
			ml_count1 = 0;
			eb_count = 0;
			tw_count = 0;

			//wenn twitch Variable 5 mal hintereinander außerhalb des Intervalls liegt ist, bewegt sich Mensch zuviel
		} else if(tw_count == 6) {
			console.log("Person weist zu schnelle Bewegung auf");
			//grüne LED blinkt auf
			rled.blink(500);
			newMessage(bedId, roomId, "Person weist zu schnelle Bewegung auf", "red");
			board.wait(3000, function() {
				rled.stop().off();
			});

			tw_count = 0;
			ml_count2 = 0;
			eb_count = 0;
			ml_count1 = 0;
		}

		console.log("Pressure: " + this.scaled);

	});

	wtr.scale([0, 1]).on("data", function() {
		console.log("wasser" + this.scaled);
		//ist Wert 1, hat sich Person eingenaesst und die gelbe LED blinkt auf
		if(this.scaled > 0){
			if(wet == false){
				wet = true;
				newMessage(bedId, roomId, "Person hat sich eingenaesst", "yellow");
				yled.blink(100);
				console.log("Person hat sich eingenaesst");

				board.wait(10000, function(){
					wet = false;
				});
			}
		}

		//misst der Feuchtigkeitssensor keine Feuchte mehr, erlischt die gelbe LED
		if(this.scaled == 0){
			yled.stop().off();
		}
	});
});


/**
* FUNKTIONEN
**/

function getMessageId(){
	return messageId++;
}

function clearJson(){
	fs.writeFile(jsonFile, JSON.stringify(data, null, 4), (err) => {
		if(err){
			console.error(err);
			return;
		};
		console.log("JSON EMPTY");
	});
}

//neue Meldung erstellen und in jsonFile einfügen
function newMessage(bedId, roomId, message, ledcolor){
	var newId = getMessageId();
	var json = {
		messageId: newId,
		roomId: roomId,
		bedId: bedId,
		message: message,
		ledcolor: ledcolor
	};

	data.push(json);

	fs.writeFile(jsonFile, JSON.stringify(data, null, 4), (err) => {
		if(err){
			console.error(err);
			return;
		};
	});
}

function startServer(){
	app.use(express.static('public'));
	// viewed at http://localhost:3001
	app.get('/', function(req, res) {
		res.sendFile(path.join(__dirname + '/start.html'));
	});
	console.log("SERVER START");
	app.listen(3001);
}
