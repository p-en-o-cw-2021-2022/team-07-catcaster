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

