const buckets = new Map<
    string,
    {
        count: number
        resetAt: number
    }
>()

type RateLimitOptions = {
    key: string
    limit: number
    windowMs: number
    message: string
}

function getBucket(key: string, windowMs: number) {
    const now = Date.now()
    const current = buckets.get(key)

    if (!current || current.resetAt <= now) {
        const freshBucket = {
            count: 0,
            resetAt: now + windowMs,
        }

        buckets.set(key, freshBucket)

        return freshBucket
    }

    return current
}

export function assertRateLimit(options: RateLimitOptions) {
    const bucket = getBucket(options.key, options.windowMs)

    if (bucket.count >= options.limit) {
        throw new Error(options.message)
    }
}

export function registerRateLimitFailure(options: Omit<RateLimitOptions, 'message'>) {
    const bucket = getBucket(options.key, options.windowMs)

    bucket.count += 1
}

export function clearRateLimit(key: string) {
    buckets.delete(key)
}
