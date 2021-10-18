import { oldArray } from ".";

const Web3 = require('web3');
const Provider = require('@truffle/hdwallet-provider');
const abiString = process.env.ABI || '[]';
const abi = JSON.parse(abiString);

export let gasPrice : string = process.env.GAS_PRICE || '';
export let gas: number = parseInt(process.env.GAS || '0');
export let account: string = process.env.ACCOUNT || '';

export const buyNFT = async (worker: any) => {
  // this is a safe validation to avoid buying too expensive,
  const provider = new Provider(process.env.METAMASK_SECRET, 'https://bsc-dataseed1.binance.org:443'); 
  const web3 = new Web3(provider);
  const contract  = new web3.eth.Contract(abi, process.env.GAME_CONTRACT);
  console.log(worker);
  // calculate gas
  const config = {
    from: account,
    gas,
    gasPrice
  };
  await contract.methods.buyNFT(worker.marketId).send(config);
};