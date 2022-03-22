const qrcode = <HTMLImageElement>document.getElementById('qrcode');
const urllength = window.location.href.length;
let newurl = window.location.href.substr(0,urllength-15)+"controller/";
console.log(newurl);
qrcode.src = 'https://chart.googleapis.com/chart?cht=qr&chl=' + newurl + "&chs=160x160&chld=L|0";
