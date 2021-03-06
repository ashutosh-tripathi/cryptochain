const redis=require('redis')

const CHANNELS={
    TEST:'TEST',
    BLOCKCHAIN:'BLOCKCHAIN',
    TRANSACTIONS:'TRANSACTIONS'
}
class PubSub{
    constructor({blockchain,transactionPool,redisUrl}){
        this.blockchain=blockchain
        this.transactionPool=transactionPool
        this.publisher=redis.createClient(redisUrl)
        this.subscriber=redis.createClient(redisUrl)
        this.subscribeToChannels()
        this.subscriber.subscribe(CHANNELS.TEST)
        this.subscriber.subscribe(CHANNELS.BLOCKCHAIN)
        this.subscriber.on('message',(channel,message)=>{
            this.handleMessage(channel,message)
        })
    }
    handleMessage(channel,message){
          console.log(` Received ${message} on channel ${channel}`)
          const parsedMessage=JSON.parse(message)
          if(channel===CHANNELS.BLOCKCHAIN)
          this.blockchain.replaceChain(parsedMessage,()=>{
              this.transactionPool.clearBlockchainTransaction({chain:parsedMessage})
          })
          if(channel===CHANNELS.TRANSACTIONS)
          {
              this.transactionPool.setTransaction(parsedMessage)
          }
    }
    subscribeToChannels(){
        Object.values(CHANNELS).forEach((channel)=>this.subscriber.subscribe(channel))
    }
    publish({channel,message})
    {
        this.subscriber.unsubscribe(channel,()=>{
            this.publisher.publish(channel,message,()=>{
                this.subscriber.subscribe(channel)
            })
        })
       
    }
    broadcastChain(){
        this.publish({channel:CHANNELS.BLOCKCHAIN,
        message:JSON.stringify(this.blockchain.chain)})
    }
    broadcastTransaction(transaction){
        this.publish({channel:CHANNELS.TRANSACTIONS,
        message:JSON.stringify(transaction)})
    }
}
// const testPubSub=new PubSub()
// setTimeout(()=>{testPubSub.publisher.publish(CHANNELS.TEST,'foo')},1000)
module.exports=PubSub
