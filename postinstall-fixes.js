const fs = require("fs")
const https = require("https")

const file = fs.createWriteStream("./node_modules/pdfjs-dist/web/images/toolbarButton-editorInk.svg")
const request = https.get("https://raw.githubusercontent.com/mozilla/pdf.js/edc9ad13bf8f422f9495c4ede9bb9989969326e4/web/images/toolbarButton-editorInk.svg", function(response) {
    response.pipe(file)
    file.on("finish", () => {
        file.close()
    });
})
