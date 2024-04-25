const dotenv = require('dotenv')
const path = require('path')
const fs = require('fs')

dotenv.config({
    override: true,
})

const content = `
if (window && typeof process === 'undefined') {
    window.process = {
        env: {
            API_RETRY_DELAY_MIN: ${process.env.API_RETRY_DELAY_MIN},
            API_RETRY_DELAY_MAX: ${process.env.API_RETRY_DELAY_MAX},
            API_RETRY_COUNT: ${process.env.API_RETRY_COUNT},
            
            ASYNC_SEARCH_POLL_SIZE: ${process.env.ASYNC_SEARCH_POLL_SIZE},
            ASYNC_SEARCH_POLL_INTERVAL: ${process.env.ASYNC_SEARCH_POLL_INTERVAL},
            ASYNC_SEARCH_ERROR_MULTIPLIER: ${process.env.ASYNC_SEARCH_ERROR_MULTIPLIER},
            ASYNC_SEARCH_ERROR_SUMMATION: ${process.env.ASYNC_SEARCH_ERROR_SUMMATION},
            
            HOOVER_MAPS_ENABLED: ${process.env.HOOVER_MAPS_ENABLED},
            HOOVER_UPLOADS_ENABLED: ${process.env.HOOVER_UPLOADS_ENABLED},
            HOOVER_TRANSLATION_ENABLED: ${process.env.HOOVER_TRANSLATION_ENABLED},
        }
    }
}
`

fs.writeFile('./out/env.js', content, (err) => {
    if (err) {
        console.error(err)
    } else {
        // file written successfully
    }
})
