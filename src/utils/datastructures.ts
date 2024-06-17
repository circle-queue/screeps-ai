export class Counter extends Map<string, number> {
  get(key: string): number {
    return super.get(key) || 0;
  }
  increment(key: string, amount: number=1): void {
    this.set(key, amount + this.get(key));
  }
}

export class ReversableMap<T, K> extends Map<T, K> {
  reverse: Map<K, T> = new Map();

  set(key: T, val: K): this{
    super.set(key, val);
    this.reverse.set(val, key);
    return this
  }

  delete(key: T): boolean {
    let val = this.get(key);
    if (val == undefined) { return false }
    this.reverse.delete(val);
    return super.delete(key);
  }
}
