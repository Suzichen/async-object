import InitializableObject, { resolveAsyncObject } from "../index";
import { asyncObjectArray, getAsyncObjectArray, getError, getAsyncObjectArrayWithErr } from "../utils";

describe("InitializableObject Class", () => {
  test("should initialize and store resolved values", async () => {
    const obj = new InitializableObject({
      key1: Promise.resolve("Hello"),
      key2: Promise.resolve(42),
      key3: getAsyncObjectArray(),
    });

    const result = await obj.initialize();
    expect(result).toEqual({ key1: "Hello", key2: 42, key3: asyncObjectArray });
    expect(obj.get("key1")).toBe("Hello");
    expect(obj.get("key2")).toBe(42);
    expect(obj.get("key3")).toBe(asyncObjectArray);
    expect(obj.getInitializedStatus()).toBe(true);
  });
});

describe("resolveAsyncObject Function", () => {
  test("should resolve an object with mixed promises and values", async () => {
    const obj = {
      key1: Promise.resolve("Hello"),
      key2: 100,
      key3: new Promise<number>((resolve) => setTimeout(() => resolve(50), 100)),
      key4: getAsyncObjectArray(),
    };

    const result = await resolveAsyncObject(obj);
    expect(result).toEqual({ key1: "Hello", key2: 100, key3: 50, key4: asyncObjectArray });
  });
});

describe("resolveAsyncObject Function Whth Err", () => {
  test("some err in class", async () => {
    const obj = new InitializableObject({
      key1: getAsyncObjectArray(),
      key2: getAsyncObjectArrayWithErr(),
    });

    const result = await obj.initialize();
    expect(result).toEqual({ key1: asyncObjectArray, key2: getError('some err') });
    expect(obj.get("key1")).toBe(asyncObjectArray);
    expect(obj.get("key2")).toStrictEqual(getError('some err')); 
    expect(obj.getInitializedStatus()).toBe(true);
  });
  test("some err in function", async () => {
    const obj = {
      key1: getAsyncObjectArray(),
      key2: getAsyncObjectArrayWithErr(),
    };

    const result = await resolveAsyncObject(obj);
    expect(result).toEqual({ key1: asyncObjectArray, key2: getError('some err') });
  });
});
