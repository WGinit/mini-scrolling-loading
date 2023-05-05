export const throttle = (func, delay) => {
    let prev = Date.now()
    return function (...args) {
        const context = this
        const now = Date.now()
        if (now - prev >= delay) {
            func.apply(context, args)
            prev = Date.now()
        }
    }
}
