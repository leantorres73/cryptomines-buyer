require('dotenv').config();

import axios from 'axios';
import { buyNFT } from './buy';
import { sendMessage } from './telegram';
var cron = require('node-cron');

const cheap:any = [];
export let oldArray:any = [];
export let firstExecution = true;
const eternalLimit: number = parseInt(process.env.ETERNAL_LIMIT || '3');

cron.schedule('*/1 * * * * *', async () => {
  let workers = (await axios.get('https://api.cryptomines.app/api/workers')).data;
  workers = workers.map((x:any) => {
    return  {
      ...x,
      price: x.price / 1000000000000000000
    }
  });
  workers.sort((a: any, b: any) => (a.price > b.price) ? 1 : -1);
  oldArray = workers;
  calculateCheap(workers);
  firstExecution = false;
});

const calculateCheap = async (workers: any) => {
  for (let i = 0; i < workers.length; i++) {
    if (workers[i+1]) {
      // I'm looking for minePower > 100
      if (workers[i].nftData.minePower >= 100 && (workers[i].price < workers[i+1].price * 0.7 || workers[i].nftData.minePower > workers[i+1].nftData.minePower * 1.25)) {
        if (checkWorker(workers[i], workers)) {
          if (!cheap.find((x:any) => x == workers[i].marketId)) {
            cheap.push(workers[i].marketId);
            try {
              if (workers[i].price < eternalLimit) {
                await buyNFT(workers[i]);
                sendMessage(`Bought worker ${workers[i].marketId}`);
              }
            } catch (ex) {
              console.log(ex);
            }
            const message = `Cheap worker: marketId: ${workers[i].marketId} level: ${workers[i].nftData.level} price: ${workers[i].price} power: ${workers[i].nftData.minePower}`;
            const message2 = `Next worker: marketId: ${workers[i+1].marketId} level: ${workers[i+1].nftData.level} price: ${workers[i+1].price} power: ${workers[i+1].nftData.minePower}`;
            !firstExecution && sendMessage(generateWorkerMessage(workers[i], oldArray));
            console.log(message);
            console.log(message2);
            console.log('---------------------');
          }
        }
      }
    }
  };
  const diff = cheap.filter((x:any) => workers.map((x:any) => x.marketId).indexOf(x) === -1);
  diff.map((x:any)=> {
    // !firstExecution && bot.sendMessage(receiver, `Sold: ${x}`);
    removeItemOnce(cheap, x);
  })
}

function removeItemOnce(arr:any, value:any) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}


const checkWorker = (element:any, array:any) => {
  array = array.filter((x:any) => x.nftData.minePower > element.nftData.minePower -10 && x.nftData.minePower < element.nftData.minePower +10 && x.marketId != element.marketId);
  array.sort((a: any, b: any) => (a.price > b.price) ? 1 : -1);
  if (array.length && array[0].price * 0.7 > element.price) {
    return true
  }
  return false;
}

const getPage = (worker: any, list: any[]) => {
  const page = list.map((x:any) => x.marketId).indexOf(worker.marketId) / 8;
  return Math.trunc(page);
}

const generateWorkerMessage = (worker: any, workers: any[]) => {
  const now = new Date();
  const diff = (now.getTime() - parseInt(worker.nftData.contractDueDate) * 1000) / (1000 * 3600 * 24);
  return `Level: ${worker.nftData.level}
Price: ${worker.price}
Power: ${worker.nftData.minePower}
Contract days left: ${diff > 0 ? Math.trunc(diff) : 0}
MarketId: ${worker.marketId}
Page: ~${getPage(worker, workers)}`
} 