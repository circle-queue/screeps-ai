export class Counter extends Map<string, number> {
  get(key: string): number {
    return super.get(key) || 0;
  }
  increment(key: string, amount: number=1): void {
    this.set(key, amount + this.get(key));
  }
}
