/**
 * A class that wraps an object containing promises and provides methods to initialize and access the resolved values.
 * 
 * @template T - An object type where each property is a promise.
 */
class InitializableObject<T extends Record<string, Promise<any>>> {
  /**
   * Indicates whether the object has been initialized.
   * @private
   */
  private isInitialized: boolean = false;

  /**
   * Stores the resolved values of the promises or the original promises.
   * @private
   */
  private data: { [K in keyof T]: Awaited<T[K]> | T[K] | Error };
  constructor(obj: T) {
    this.data = { ...obj };
  }

  [Symbol.iterator](): IterableIterator<Promise<any>> {
    const values = Object.values(this.data);
    return values[Symbol.iterator]();
  }

  /**
   * Initializes the object by resolving all promises and storing their resolved values.
   * 
   * @returns A promise that resolves to an object with the same keys as the input object, but with resolved values.
   */
  async initialize(): Promise<{ [K in keyof T]: Awaited<T[K]> | Error }> {
    const keys = Object.keys(this.data) as (keyof T)[];
  
    const results = await Promise.allSettled(keys.map(key => 
      this.data[key] instanceof Promise ? this.data[key] : Promise.resolve(this.data[key])
    ));
  
    results.forEach((result, index) => {
      const key = keys[index];
      if (result.status === "fulfilled") {
        this.data[key] = result.value as Awaited<T[keyof T]>;
      } else {
        this.data[key] = result.reason as Error;
      }
    });
  
    this.isInitialized = true;
    return this.data as { [K in keyof T]: Awaited<T[K]> | Error };
  }

  /**
   * Retrieves the resolved value of a specific key.
   * 
   * @param key - The key of the value to retrieve.
   * @returns The resolved value of the specified key, or undefined if the key does not exist.
   */
  get<K extends keyof T>(key: K): Awaited<T[K]> | Error | undefined {
    return this.data[key] as Awaited<T[K]> | Error | undefined;
  }

  /**
   * Returns the initialization status of the object.
   * 
   * @returns A boolean indicating whether the object has been initialized.
   */
  getInitializedStatus(): boolean {
    return this.isInitialized;
  }
}

/**
 * Resolves all promises within an object and returns a new object with the same keys,
 * where each promise is replaced with its resolved value.
 *
 * @template T - The type of the input object, which should be a record with string keys and any values.
 * 
 * @param {T} obj - The input object containing values that may be promises.
 * 
 * @returns {Promise<{ [K in keyof T]: Awaited<T[K]> }>} A promise that resolves to a new object with the same keys as the input object,
 * where each value is the resolved value of the corresponding promise in the input object.
 */
export async function resolveAsyncObject<T extends Record<string, any>>(
  obj: T
): Promise<{ [K in keyof T]: Awaited<T[K]> | Error }> {
  const entries = Object.entries(obj).map(([key, value]) => [
    key,
    value instanceof Promise ? value : Promise.resolve(value),
  ]);

  const results = await Promise.allSettled(entries.map(([_, promise]) => promise));

  return Object.fromEntries(
    results.map((result, index) => {
      const key = Object.keys(obj)[index];
      return [key, result.status === "fulfilled" ? result.value : result.reason];
    })
  ) as { [K in keyof T]: Awaited<T[K]> | Error };
}

export default InitializableObject;
