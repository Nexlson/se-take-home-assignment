import inquirer from 'inquirer';
import chalk from 'chalk';
import { Worker } from 'worker_threads';
import { Order, WCDWorker } from './model.js';
import { priorQueue, normalQueue, inProgressQueue, completedQueue, workerPool, kitcherPool } from './data.js';


const initWork = () => {
  // get free up worker 
  if (workerPool.length == 0) {
    return;
  }

  const worker = workerPool.pop();

  // check for pending orders
  let order = {};
  if (priorQueue.length > 0) {
    order = priorQueue.shift();
  } else if (normalQueue.length > 0) {
    order = normalQueue.shift();
  } else {
    console.log(chalk.red('No orders to cook at the moment! Worker is on standby...'));
    // push to worker pool for standby
    workerPool.push(worker);
    return;
  }

  // update order 
  order.status = 'in progress';
  inProgressQueue.push(order);

  const job = newJob(order.orderNumber);
  kitcherPool.push(job);
  // console.log(job);
  console.log(chalk.yellow(`Order ${order.orderNumber} is in progress!`));
}

const createOrders = (customerType = 'normal') => {
  const orderNumber = Math.floor(Math.random() * 1000);
  let order = {};

  // check customer type
  if (customerType === 'vip') {
    order = new Order(orderNumber, customerType, 'pending');
    priorQueue.push(order);
  } else {
    order = new Order(orderNumber, customerType, 'pending');
    normalQueue.push(order);
  }
  initWork();
}

const viewOrders = () => {
  const pendingQueue = priorQueue.concat(normalQueue);
  console.log(chalk.red('Pending: '));
  console.log(displayOrders(pendingQueue));
  console.log(chalk.yellow('In Progress: '));
  console.log(displayOrders(inProgressQueue));
  console.log(chalk.green('Completed: '));
  console.log(displayOrders(completedQueue));
}

const viewWorker = () => {
  console.log(chalk.blue('Workers: '));
  console.log(workerPool);
}

const displayOrders = (queue) => {
  // extract order id and customer type
  return queue.map(order => ({ orderId: order.orderNumber, customerType: order.customerType }));
}

const newJob = ( orderNumber) => {
  const worker = new Worker('./worker.js', {workerData: {orderNumber}});

  worker.on('message', (result) => {
      const [status, orderNumber] = result;
      if (status === 'completed') {
        // free up worker
        workerPool.push(worker);

        // update order status
        const order = inProgressQueue.find((order) => order.orderNumber === orderNumber);
        order.status = 'completed';
        const index = inProgressQueue.indexOf(order);
        inProgressQueue.splice(index, 1);

        // move to completed queue
        completedQueue.push(order);

        console.log(chalk.green(`Order ${orderNumber} has been completed!`));
      }
  })
  
  worker.on("error", (msg) => {
      console.log(msg);
  });

  return worker;
}

const hireWorker = () => {
  const worker = new WCDWorker(workerPool.length + 1, 'available');
  workerPool.push(worker);

  // init work
  initWork();
}

const fireWorker = () => {
  if (workerPool.length == 0 && kitcherPool.length == 0) {
    console.log('No worker to fire!');
    return;
  }

  if (workerPool.length > 0) {
    const workerToFire = workerPool.pop();
    const index = workerPool.indexOf(workerToFire);
    workerPool.splice(index, 1);
  } else {
    // fire on going worker
    const workerToFire = kitcherPool.pop();
    workerToFire.terminate();
    const index = kitcherPool.indexOf(workerToFire);
    workerPool.splice(index, 1);

    // send on going order back 
    const order = inProgressQueue.pop();
    order.status = 'pending';
    const orderIndex = inProgressQueue.indexOf(order);
    inProgressQueue.splice(orderIndex, 1);
    if (order.customerType === 'vip') {
      priorQueue.push(order);
    } else {
      normalQueue.push(order);
    }

    // stop worker
    workerToFire.terminate();
  }
}

const app = () => {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'menuOption',
        message: 'Please select an option:',
        choices: ['Create VIP Order', 'Create Order', 'View Orders', 'Add Worker', 'Fire Worker', 'View Workers', 'Exit'],
      },
    ])
    .then((answers) => {
      const { menuOption } = answers;
      if (menuOption === 'Create VIP Order') {
        createOrders('vip');
      } else if (menuOption === 'Create Order') {
        createOrders();
      } else if (menuOption === 'View Orders') {
        viewOrders();
      } else if (menuOption === 'Add Worker') {
        hireWorker();
      } else if (menuOption === 'Fire Worker') {
        fireWorker();
      } else if (menuOption === 'View Workers') {
        viewWorker();
      } else if (menuOption === 'Exit') {
        console.log('Thank you for using WCD order managing system. Goodbye!');
        process.exit(0);
      }
      return app();
    });
}


app();