# IoTSupporttress

Projekt des Moduls "Internet of Things" an der TH Köln.   
Bearbeitet von: Jane Corleis, Nathalie Kuhn, Simone Zajac

### Anleitung zum Starten des Systems
1. Raspberrys Pi über ein HDMI-Kabel an einen Bildschirm anschließen und an Stromquelle anschließen
2. Arduino und Rasperry Pi über USB-Verbindungskabel miteinander verbinden
3. Konsole öffnen und in den Ordner “/Schreibtisch/IoTSupporttress/” navigieren
4. npm start in die Konsole eingeben 
5. Auf dem Gerät, welches die Anwendugnsoberfläche anzeigen soll, die Verbindung zum Netzwerk “Supporttress” aufbauen (Passwort: AardvarkBadgerHedgehog)
6. Im Browser in die Adressleiste “192.168.4.1:3001” eingeben und die Seite laden

### Anleitung zum Testen der Funktionalitäten
* Feuchtigkeitssensor: Hierfür ein feuchtes Tuch darauf halten und anschließend ggf. trocken wischen. Es entsteht eine Meldung und die gelbe LED blinkt
* Drucksensor, zu wenig Bewegung: Hand auf die kennzeichnete Fläche auf dem Bett legen und nicht bewegen. Nach 9 Sekunden Vibriert der Vibrationsmotor ein erstes mal, nach weiteren 9 Sekunden ein zweites mal. Anschließend entsteht eine Meldung und die rote LED blinkt
* Drucksensor, unnatürliche Bewegung: Hand auf die kennzeichnete Fläche auf dem Bett legen und abwechselnd stark und schwach darauf drücken (den Druck dabei nicht auf null kommen lassen). Nach 5 Sekunden entsteht eine Meldung und die rote LED blinkt
* Drucksensor, keine Person im Bett: Drucksensor nicht berühren, nach 15 Sekunden entsteht eine Meldung und die grüne LED blinkt

