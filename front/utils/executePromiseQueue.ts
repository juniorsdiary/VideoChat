export const executePromiseQueue = (promiseQueue: any[]) => {
    return new Promise((resolve) => {
        const results: any[] = [];
        let promise = promiseQueue.reduce((prev, task) => {
            return prev.then((result: any) => {
                results.push(result);
                return task();
            });
        }, Promise.resolve());

        promise.then(() => {
            resolve(results);
        });
    })
};


