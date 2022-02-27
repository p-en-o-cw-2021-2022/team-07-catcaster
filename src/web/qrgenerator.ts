const qr = require('qrcode');

export function generateQR(url: String) {

    qr.toFile("QR.png", url, {type:'png'}, function (err:any, data:any) {
        if (err) {
        console.error('Error:', err.message)
        process.exit(1)
        }

        console.log('saved qrcode to: ' + "QR.png" + '\n')
    })
}

  
