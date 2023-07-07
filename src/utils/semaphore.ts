export class Semaphore {
    private permits: number
    private waitingQueue: (() => void)[]

    constructor(private maxPermits: number) {
        this.permits = 0
        this.waitingQueue = []
    }

    async acquire(): Promise<void> {
        if (this.permits < this.maxPermits) {
            this.permits++
        } else {
            await new Promise<void>((resolve) => this.waitingQueue.push(resolve))
        }
    }

    release(): void {
        if (this.waitingQueue.length > 0) {
            const resolve = this.waitingQueue.shift()
            resolve?.()
        } else {
            this.permits--
        }
    }
}
