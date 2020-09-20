const Block = require("./block")
const cryptoHash = require("../utils/cryptoHash")
const {Transaction} =require('../wallet/transactions.js')
const {REWARD_INPUT, MINING_REWARD}=require('../config/config.js')
const {Wallet}=require('../wallet/Wallet.js')

class Blockchain{
constructor(){
    this.chain=[Block.genesis()]
}

addBlock({data}){
    const lastBlock=this.chain[this.chain.length-1]

    this.chain.push(Block.mineBlock({lastBlock,data}))
}

static isValidChain(chain){
if(JSON.stringify(chain[0])!==JSON.stringify(Block.genesis()))
return false

for(let i=1;i<chain.length;i++)
{
  const block=chain[i]
  let  actuallastHash=chain[i-1].hash
  let lastDifficulty=chain[i-1].difficulty
  const {timestamp,lastHash,hash,data,nonce,difficulty}=block
    if(actuallastHash!==lastHash)
    return false
    const  validatedHash=cryptoHash(timestamp,lastHash,data,nonce,difficulty)
    if(validatedHash!==chain[i].hash)
    return false
    if(Math.abs(chain[i].difficulty-lastDifficulty)>1)
    return false
}
return true
}
replaceChain(chain,onSuccess){
    if(this.chain.length>=chain.length)
    {
    console.log("new chain length must be longer")
    return
    }if(!Blockchain.isValidChain(chain))
    {
        console.log("new chain must be valid")
    return
    }
    if(!this.validTransactionData({chain})){
        console.error('incoming chain has invalid data')
        return
    }
    if(onSuccess) onSuccess()
    this.chain=chain 
}
validTransactionData({ chain }) {
    for (let i=1; i<chain.length; i++) {
      const block = chain[i];
      const transactionSet = new Set();
      let rewardTransactionCount = 0;

      for (let transaction of block.data) {
        if (transaction.input.address === REWARD_INPUT.address) {
          rewardTransactionCount += 1;

          if (rewardTransactionCount > 1) {
            console.error('Miner rewards exceed limit');
            return false;
          }

          if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
            console.error('Miner reward amount is invalid');
            return false;
          }
        } else {
          if (!Transaction.validTransaction(transaction)) {
            console.error('Invalid transaction');
            return false;
          }

          const trueBalance = Wallet.calculateBalance({
            chain: this.chain,
            address: transaction.input.address
          });

          if (transaction.input.amount !== trueBalance) {
            console.error('Invalid input amount');
            return false;
          }

          if (transactionSet.has(transaction)) {
            console.error('An identical transaction appears more than once in the block');
            return false;
          } else {
            transactionSet.add(transaction);
          }
        }
      }
    }

    return true;
  }
}
module.exports=Blockchain
