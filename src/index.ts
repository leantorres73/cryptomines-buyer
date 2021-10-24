require('dotenv').config();
import { buyNFT, findNextWorkers } from './buy';
import { sendMessage } from './telegram';

const cheap:any = [];
const eternalLimit: number = parseInt(process.env.ETERNAL_LIMIT || '3');

export const calculateCheap = async (newWorker: any, i: number, workers: any[]) => {
  // I'm looking for minePower > 100
  if (newWorker.nftData.minePower >= 100 && (newWorker.price < workers[i+1].price * 0.7 || newWorker.nftData.minePower > workers[i+1].nftData.minePower * 1.25)) {
    if (checkWorker(newWorker, workers)) {
      if (!cheap.find((x:any) => x == newWorker.marketId)) {
        cheap.push(newWorker.marketId);
        try {
          // this is a safe validation to avoid buying too expensive,
          if (!newWorker.isSold && newWorker.price <= eternalLimit) {
            await buyNFT(newWorker);
          }
        } catch (ex) {
          console.log(ex);
        }
        const message = `Cheap worker: marketId: ${newWorker.marketId} level: ${newWorker.nftData.level} price: ${newWorker.price} power: ${newWorker.nftData.minePower}`;
        const message2 = `Next worker: marketId: ${workers[i+1].marketId} level: ${workers[i+1].nftData.level} price: ${workers[i+1].price} power: ${workers[i+1].nftData.minePower}`;
        sendMessage(generateWorkerMessage(newWorker, workers));
        console.log(message);
        console.log(message2);
        console.log('---------------------');
      }
    }
  }

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

findNextWorkers();