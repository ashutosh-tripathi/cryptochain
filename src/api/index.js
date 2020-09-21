const express=require('express')
const Blockchain = require('../blockchain/blockchain')
const PubSub = require('../utils/pubsub')
const request=require('request')
const { TransactionPool } = require('../wallet/transaction-pool')
const {TransactionMiner}=require('../wallet/transaction-miner.js')
const {Wallet} = require('../wallet/Wallet')
const path=require('path')



const app=express()
app.use(express.json())
app.use(express.static(path.join(__dirname,'../client/dist')))

const DEFAULT_PORT=3000
const ROOT_NODE=`http://127.0.0.1:${DEFAULT_PORT}`
const blockchain=new Blockchain()
const transactionPool=new TransactionPool()
const wallet=new Wallet()
const pubsub=new PubSub({blockchain,transactionPool})
const transactionMiner=new TransactionMiner({blockchain,transactionPool,wallet,pubsub})

const isDevelopment=process.env.ENV==='development'

setTimeout(()=>{pubsub.broadcastChain()},1000)
app.get('/api/blocks',(req,res)=>{
   
    res.send(blockchain.chain)
})
app.post('/api/mine',(req,res)=>{
const {data}=req.body
blockchain.addBlock({data})
pubsub.broadcastChain()
res.redirect('/api/blocks')
})
app.post('/api/transact',(req,res)=>{
    const {amount,recipient}=req.body
    let transaction=transactionPool.existingTransaction({inputAddress:wallet.publicKey})
    try{
    if(transaction)
    transaction.update({senderWallet:wallet,amount,recipient})
    else
    transaction=wallet.createTransaction({amount,recipient,chain:blockchain.chain})

    transactionPool.setTransaction(transaction)
    pubsub.broadcastTransaction(transaction)
   }catch(error)
   {
      return res.status(400).send({type:'error',message:error.message})
   }
    console.log('transaction Pool', transactionPool)
    res.json({transaction})

})
app.get('/api/transaction-pool-map',(req,res)=>{
    res.send(transactionPool.transactionMap)
})
app.get('/api/mine-transactions',(req,res)=>{
    transactionMiner.mineTransactions()
    res.redirect('/api/blocks')
})
app.get('/api/wallet-info',(req,res)=>{
    res.send({
        address:wallet.publicKey,
        balance:Wallet.calculateBalance({chain:blockchain.chain,address:wallet.publicKey})
    })
})
app.get('*',(req,res)=>{

    const filepath=path.join(__dirname,'../client/src/index.html')
    res.sendFile(filepath)

})


const syncDataWithRoot=()=>{
    request({url:`${ROOT_NODE}/api/blocks`},(error,response,body)=>{
        if(!error && response.statusCode===200)
        {
            const rootChain=JSON.parse(body)
            console.log('replace chain in sync with',rootChain)
            blockchain.replaceChain(rootChain)
        }
    })
    request({url:`${ROOT_NODE}/api/transaction-pool-map`},(error,response,body)=>{
        if(!error && response.statusCode===200)
        {
            const rootTransactions=JSON.parse(body)
            console.log('replace chain in sync with',rootTransactions)
            transactionPool.setMap({transactionMap:rootTransactions})
        }
    })
}

if(isDevelopment)
{
const fooWallet=new Wallet()
const barWallet=new Wallet()

const generateTransactionWithWallet=({wallet,recipient,amount})=>{
    const transaction=wallet.createTransaction({amount,recipient,chain:blockchain.chain})
    transactionPool.setTransaction(transaction)
}

const walletAction=()=>generateTransactionWithWallet({
wallet,recipient:fooWallet.publicKey,amount:5
})
const fooWalletAction=()=>generateTransactionWithWallet({
    wallet:fooWallet,recipient:barWallet.publicKey,amount:10
    })

    const barWalletAction=()=>generateTransactionWithWallet({
        wallet:barWallet,recipient:wallet.publicKey,amount:15
        })    
 
 for(let i=0;i<10;i++)
 {
     if(i%3==0)
     {
         walletAction()
         fooWalletAction
     }
     else if(i%3==1)
     {
         walletAction()
         barWalletAction()
     }
     else
     {
         fooWalletAction()
         barWalletAction()
     }
     transactionMiner.mineTransactions();
 }       

}
let PEER_PORT;

if(process.env.GENERATE_PEER_PORT==='true')
PEER_PORT=DEFAULT_PORT+Math.ceil(Math.random()*1000)

const PORT=process.env.PORT||PEER_PORT||DEFAULT_PORT

app.listen(PORT,()=>{
    console.log(`listening on port ${PORT }`
    )
    if(PORT!=DEFAULT_PORT)
    syncDataWithRoot()
})