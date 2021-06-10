const context = require('./context')

const waitForMilliseconds = ms => new Promise(resolve => setTimeout(resolve, ms))

const waitForTransitionEnd = async element => {
    await context.page.evaluate(element => {
        return new Promise(resolve => {
            const onEnd = () => {
                element.removeEventListener('transitionend', onEnd)
                resolve()
            }
            element.addEventListener('transitionend', onEnd)
        })
    }, element)
}

module.exports = {
    waitForMilliseconds,
    waitForTransitionEnd,
}
