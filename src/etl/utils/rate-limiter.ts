/**
 * Simple token-bucket rate limiter for external API calls.
 * Enforces per-second and per-day limits.
 */

export interface RateLimiterConfig {
  /** Max requests per second */
  perSecond: number;
  /** Max requests per day */
  perDay: number;
  /** Label for logging */
  name: string;
}

export class RateLimiter {
  private readonly config: RateLimiterConfig;
  private tokens: number;
  private lastRefill: number;
  private dailyCount: number;
  private dailyResetTime: number;

  constructor(config: RateLimiterConfig) {
    this.config = config;
    this.tokens = config.perSecond;
    this.lastRefill = Date.now();
    this.dailyCount = 0;
    this.dailyResetTime = this.getNextMidnight();
  }

  /** Wait until a request can be made, then consume a token */
  async acquire(): Promise<void> {
    this.checkDailyReset();

    if (this.dailyCount >= this.config.perDay) {
      throw new Error(
        `[RateLimiter:${this.config.name}] Daily limit reached: ${this.config.perDay}`,
      );
    }

    // Refill tokens based on elapsed time
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(
      this.config.perSecond,
      this.tokens + elapsed * this.config.perSecond,
    );
    this.lastRefill = now;

    // Wait if no tokens available
    if (this.tokens < 1) {
      const waitMs = ((1 - this.tokens) / this.config.perSecond) * 1000;
      await new Promise((resolve) => setTimeout(resolve, Math.ceil(waitMs)));
      this.tokens = 1;
      this.lastRefill = Date.now();
    }

    this.tokens -= 1;
    this.dailyCount += 1;
  }

  /** Check if daily limit is exhausted */
  get isExhausted(): boolean {
    this.checkDailyReset();
    return this.dailyCount >= this.config.perDay;
  }

  /** Get remaining daily quota */
  get remainingDaily(): number {
    this.checkDailyReset();
    return Math.max(0, this.config.perDay - this.dailyCount);
  }

  /** Get current daily count */
  get usedDaily(): number {
    this.checkDailyReset();
    return this.dailyCount;
  }

  private checkDailyReset(): void {
    if (Date.now() >= this.dailyResetTime) {
      this.dailyCount = 0;
      this.dailyResetTime = this.getNextMidnight();
    }
  }

  private getNextMidnight(): number {
    const d = new Date();
    d.setHours(24, 0, 0, 0);
    return d.getTime();
  }
}

// Pre-configured instances for each API provider
export const DATA_GO_KR_LIMITER = new RateLimiter({
  name: "data.go.kr",
  perSecond: 5,
  perDay: 2000,
});

export const KAKAO_LIMITER = new RateLimiter({
  name: "kakao",
  perSecond: 10,
  perDay: 300_000,
});

export const ODSAY_LIMITER = new RateLimiter({
  name: "odsay",
  perSecond: 1,
  perDay: 1000,
});

export const NEIS_LIMITER = new RateLimiter({
  name: "neis",
  perSecond: 5,
  perDay: 10_000,
});
