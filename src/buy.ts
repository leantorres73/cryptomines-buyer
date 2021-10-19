const Web3 = require('web3');
const Provider = require('@truffle/hdwallet-provider');
const abiString = process.env.ABI || '[]';
const abi = JSON.parse(abiString);

export let gasPrice : string = process.env.GAS_PRICE || '';
export let gas: number = parseInt(process.env.GAS || '0');
export let account: string = process.env.ACCOUNT || '';

const config = {
  from: account,
  gas,
  gasPrice
};

const provider = new Provider(process.env.METAMASK_SECRET, 'https://bsc-dataseed1.binance.org:443'); 
const web3 = new Web3(provider);
const contract  = new web3.eth.Contract(abi, process.env.GAME_CONTRACT, config);
//provider 2 
//WORKER CONTRACT
const abiString2 = process.env.ABI2 || '[]';
const abi2 = JSON.parse(abiString2);
const provider2 = new Provider(process.env.METAMASK_SECRET, 'https://bsc-dataseed1.binance.org:443'); 
const web32 = new Web3(provider2);
const contract2 = new web32.eth.Contract(abi2, process.env.WORKER_CONTRACT, config);

let nextMarket: number;

export const findNextWorkers = async (workers: any[]) => {
  try {
    // calculate gas
    const config = {
      from: process.env.WORKER_CONTRACT
    };
    if (!nextMarket) {
      workers.sort((a: any, b: any) => b.marketId - a.marketId);
      nextMarket = workers[0].marketId;
    }
    let keepLooking = true;
    while (keepLooking) {
      try {
        nextMarket++;
        const worker = await contract.methods.getMarketItem(nextMarket).call(config);
        if (worker['marketId'] != 0) {
          nextMarket = worker['marketId'];
          const tokenDetails = await contract2.methods.getTokenDetails(worker['tokenId']).call(config);
          if (worker['nftType'] == 0) {
            const buildWorker = {
              marketId: worker['marketId'],
              nftType: worker['nftType'],
              tokenId: worker['tokenId'],
              sellerAddress: worker['sellerAddress'],
              buyerAddress: worker['buyerAddress'],
              price: worker['price'] / 1000000000000000000, 
              isSold: worker['buyerAddress'] == '0x0000000000000000000000000000000000000000' ? false : true,
              nftData: {
                roll: tokenDetails['roll'],
                level: tokenDetails['level'],
                minePower: tokenDetails['minePower'],
                firstName: tokenDetails['firstName'],
                lastName: tokenDetails['lastName'],
                contractDueDate: tokenDetails['contractDueDate'],
                lastMine: tokenDetails['lastMine']
              }
            };
            if (buildWorker.nftData.minePower >= 100 && buildWorker.price < 1) {
              await buyNFT(buildWorker);
            }
            workers.push(buildWorker);
          }
        } else {
          break;
        }
      } catch (ex) {
        keepLooking = false;
        break;
      }
    }
  } catch (ex) {
    console.log(ex);
  }
}

export const buyNFT = async (worker: any) => {
  // calculate gas
  await contract.methods.buyNFT(worker.marketId).send(config);
  console.log(worker);
};