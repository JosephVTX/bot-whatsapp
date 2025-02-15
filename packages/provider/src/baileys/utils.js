const { createWriteStream } = require('fs')
const combineImage = require('combine-image')
const qr = require('qr-image')
const { tmpdir } = require('os')
const http = require('http')
const https = require('https')

const baileyCleanNumber = (number, full = false) => {
    number = number.replace('@s.whatsapp.net', '')
    number = !full ? `${number}@s.whatsapp.net` : `${number}`
    return number
}

/**
 * Hace promesa el write
 * @param {*} base64
 */
const baileyGenerateImage = async (base64) => {
    const PATH_QR = `${process.cwd()}/qr.png`
    let qr_svg = qr.image(base64, { type: 'png', margin: 4 })

    const writeFilePromise = () =>
        new Promise((resolve, reject) => {
            const file = qr_svg.pipe(createWriteStream(PATH_QR))
            file.on('finish', () => resolve(true))
            file.on('error', reject)
        })

    await writeFilePromise()

    const cleanImage = await combineImage([PATH_QR], {
        margin: 15,
        color: 0xffffffff,
    })
    cleanImage.write(PATH_QR)
}

const baileyIsValidNumber = (rawNumber) => {
    const regexGroup = /\@g.us\b/gm
    const exist = rawNumber.match(regexGroup)
    return !exist
}

/**
 * Incompleta
 * Descargar archivo multimedia para enviar
 * @param {*} url
 * @returns
 */
const baileyDownloadMedia = (url) => {
    return new Promise((resolve, reject) => {
        const ext = url.split('.').pop()
        const checkProtocol = url.includes('https:')
        const handleHttp = checkProtocol ? https : http
        const name = `tmp-${Date.now()}.${ext}`
        const fullPath = `${tmpdir()}/${name}`
        const file = createWriteStream(fullPath)
        handleHttp.get(url, function (response) {
            response.pipe(file)
            file.on('finish', function () {
                file.close()
                resolve(fullPath)
            })
            file.on('error', function () {
                console.log('errro')
                file.close()
                reject(null)
            })
        })
    })
}

module.exports = {
    baileyCleanNumber,
    baileyGenerateImage,
    baileyIsValidNumber,
    baileyDownloadMedia,
}
