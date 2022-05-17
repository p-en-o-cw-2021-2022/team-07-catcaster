# Team-07-catcaster

## Guide voor het runnen van de applicatie
### Stap 1
Zorg ervoor dat je computer en controller op dezelfde internetverbinding zitten (bv. hotspot). Niet KULeuven internet.
### Stap 2
In WSL of terminal, ga naar de map team-07-catcaster en run daar volgende command:
```
npm run start-server
```
### Stap 3
#### Voor Windows:
In cmd:
```
ipconfig
```
Onder de tab 'Wireless LAN adapter Wi-Fi', zoek naar 'IPv4 Address' en op deze lijn staat je IP address
#### Voor Mac:
Volgende runnen in terminal voor IP-address:
```
ipconfig getifaddr en0
```

### Stap 4
Ga naar volgende website: ***`https://<ip_address>:8000/catcaster/screen/`***
### Stap 5
Op je gsm ga je naar je QR-scanner app en scan je de QR-code op het scherm. (Meerdere gsm's kunnen deze code scannen op voorwaarde dat zij ook op dezelfde Wi-Fi verbinding zitten.)
### Stap 6
Tik op je gsm scherm om te beginnen met spelen.

### Als vorige niet werkt, na stap 3
#### 1
Zorg dat node geinstalleerd is en in path staat:
[https://nodejs.org/en/download/](https://nodejs.org/en/download/)
#### 2
In cmd of terminal (dus niet WSL!):
1. Ga naar git map: `'team-07-catcaster'`
2. Run: `node dist/server/index.js`
#### 3
Volg terug de vorige stappen in de juiste volgorde.

## MIT License
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
