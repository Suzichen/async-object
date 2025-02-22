const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const asyncObjectArray = [
  { key: "key1", value: 1 },
  { key: "key2", value: 2 },
  { key: "key3", value: 3 },
  { key: "key4", value: 4 },
]
type AsyncObject = { key: string, value: number };
export const getAsyncObjectArray = async ():Promise<AsyncObject[]> => {
  return new Promise<AsyncObject[]>(async (resolve) => {
    await sleep(500);
    resolve(asyncObjectArray);
  })
}
export const getError = (errName: string) => new Error(errName);
export const getAsyncObjectArrayWithErr = async ():Promise<AsyncObject[]> => {
  return new Promise<AsyncObject[]>(async (resolve, reject) => {
    await sleep(500);
    reject(getError('some err'));
  })
}
