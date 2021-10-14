const Web3 = require('web3');
const Provider = require('@truffle/hdwallet-provider');
const abiString = process.env.ABI || '[]';
const abi = JSON.parse(abiString);

export const buyNFT = async (marketId: string, value: number) => {
  // this is a safe validation to avoid buying too expensive,
  if (value < 3) {
    try {
      const provider = new Provider(process.env.METAMASK_SECRET, 'https://bsc-dataseed1.binance.org:443'); 
      const web3 = new Web3(provider);
      const contract  = new web3.eth.Contract(abi, process.env.GAME_CONTRACT);
      console.log(marketId);
      const accounts = await web3.eth.getAccounts();
      const gasPrice = await web3.eth.getGasPrice();
      // calculate gas
      const gas = await contract.methods.buyNFT(marketId).estimateGas({ from: accounts[0] });
      const config = {
        from: accounts[0],
        // value: web3.utils.toWei(value.toString(), 'ether'),
        gas,
        gasPrice
      };
      await contract.methods.buyNFT(marketId).send(config);
    } catch (ex) {
      console.log(ex);
    }
  }
};