const Web3 = require('web3');
const Provider = require('@truffle/hdwallet-provider');
const abiString = process.env.ABI || '[]';
const abi = JSON.parse(abiString);
const provider = new Provider(process.env.METAMASK_SECRET, 'https://bsc-dataseed1.binance.org:443'); 
const web3 = new Web3(provider);
const contract  = new web3.eth.Contract(abi, process.env.GAME_CONTRACT);

export let gasPrice : string;
export let gas: number;
export let account: string;

export const updateValues = async () => {
  gasPrice = await web3.eth.getGasPrice();
  const accounts = await web3.eth.getAccounts();
  account = accounts[0];
  gas = await contract.methods.buyNFT("9059").estimateGas({ from: account });
}

export const buyNFT = async (marketId: string, value: number) => {
  // this is a safe validation to avoid buying too expensive,
  if (value < 3) {
    console.log(marketId);
    // calculate gas
    const config = {
      from: account,
      gas,
      gasPrice
    };
    await contract.methods.buyNFT(marketId).send(config);
  }
};