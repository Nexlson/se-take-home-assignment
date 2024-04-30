import { parentPort, workerData } from 'worker_threads';
parentPort.postMessage(['started', workerData.orderNumber]);

setTimeout(() => {
    parentPort.postMessage(['completed', workerData.orderNumber]);
}, 10000);