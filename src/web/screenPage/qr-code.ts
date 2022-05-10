const qrcode = <HTMLImageElement>document.getElementById('qrcode');
const qrlarge = <HTMLImageElement>document.getElementById('qrcodelarge');

const urllength = window.location.href.length;
const newurl = window.location.href.substr(0,urllength-19)+'controller/';
console.log(newurl);
qrcode.src = 'https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=' + newurl;
qrlarge.src = 'https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=' + newurl;
