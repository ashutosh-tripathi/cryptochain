const Block = require("../src/blockchain/block")
const Blockchain = require("../src/blockchain/blockchain")
const {Wallet} = require("../src/wallet/Wallet")
const {Transaction}=require("../src/wallet/transactions.js")
describe('blockchain',()=>{
    let blockchain,newChain,originalChain
    beforeEach(()=>{
        blockchain=new Blockchain()
        newChain=new Blockchain()
        originalChain=blockchain.chain
    })
    
    
    it('contains a `chain` array instance',()=>{
        expect(blockchain.chain instanceof Array).toBe(true)
    })
    it('starts with the genesis block',()=>{
        expect(blockchain.chain[0]).toEqual(Block.genesis())
    })
    it('adds a new Block',()=>{
        const data='foo bar'
        blockchain.addBlock({data})
        expect(blockchain.chain[blockchain.chain.length-1].data).toBe(data)
    })
    
    describe('is Valid Chain',()=>{
        describe('when the chain does not start with genesis block',()=>{
            it('returns false',()=>{
                blockchain.chain[0]={data:'fake-genesis'}
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
            })
        })
        describe('when the chain starts with genesis block and has multiple blocks',()=>{
            describe('and a lastHash reference has changed',()=>{
                it('returns false',()=>{
                    
                    blockchain.addBlock({data:'1st Block'})
                    blockchain.addBlock({data:'2nd Block'})
                    blockchain.addBlock({data:'3rd Block'})
                    blockchain.chain[2].lastHash='broken-lastHash'
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)

                })
            })
            describe('and the chain contains block with invalid field',()=>{
                it('returns false',()=>{
                    blockchain.addBlock({data:'1st Block'})
                    blockchain.addBlock({data:'2nd Block'})
                    blockchain.addBlock({data:'3rd Block'})
                    blockchain.chain[2].data='broken-lastHash'
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
                })
            })
            describe('and the chain doesnot contains any invalid Block',()=>{
                it('returns true',()=>{
                    blockchain.addBlock({data:'1st Block'})
                    blockchain.addBlock({data:'2nd Block'})
                    blockchain.addBlock({data:'3rd Block'})
                    
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true)
                })
            })
        })


    })
    describe('replace chain',()=>{
        beforeEach(()=>{
            errorMock=jest.fn()
            logMock=jest.fn()

            global.console.error=errorMock
            global.console.log=logMock
        })
        describe('when the chain is not longer',()=>{
            it('does not replace the chain',()=>{
                newChain.chain[0]={new:'Chain'}
                blockchain.replaceChain(newChain.chain)
                expect(blockchain.chain).toEqual(originalChain)
            })
        })
        describe('when the chain is longer',()=>{
            beforeEach(()=>{
                wallet=new Wallet()
                transaction=wallet.createTransaction({amount:70,recipient:'temp-foo'})
            newChain.addBlock({data:[transaction]})
            newChain.addBlock({data:[transaction]})
            newChain.addBlock({data:[transaction]})
        })
            describe('and the chain is invalid',()=>{
                
                it('does not replace the chain',()=>{
                    newChain.chain[2].hash='some-fake-hash'
                    blockchain.replaceChain(newChain.chain)
                    expect(blockchain.chain).toEqual(originalChain)

                })
            })
            describe('and the chain is valid',()=>{
                it('does replace the chain',()=>{
                    blockchain.replaceChain(newChain.chain)
                    expect(blockchain.chain).toEqual(newChain.chain)
                })
            })
        })

    })
    describe('valid transactions',()=>{
        let transaction,rewardTransaction,wallet
        beforeEach(()=>{
            wallet=new Wallet()
            transaction=wallet.createTransaction({amount:70,recipient:'temp-foo'})
            rewardTransaction=Transaction.rewardTransaction({minerWallet:wallet})
        })
        describe('and the transaction data is valid',()=>{
            it('returns true',()=>{
                newChain.addBlock({data:[transaction,rewardTransaction]})
                expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(true)
            })

        })
        describe('and the transaction data has multiple rewards',()=>{
            it('returns false',()=>{
                newChain.addBlock({data:[transaction,rewardTransaction,rewardTransaction]})
                expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false)
            })
        })
        describe('and the transaction data has one malformed output map',()=>{
            describe('and the transaction is not a reward transaction',()=>{
                it('returns false',()=>{
                    transaction.outputMap[wallet.publicKey]=999999
                    newChain.addBlock({data:[transaction,rewardTransaction]})
                    expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false)   

                })
            })
            describe('and the transaction is a reward transaction',()=>{
                it('returns false',()=>{
                    rewardTransaction.outputMap[wallet.publicKey]=999999
                    newChain.addBlock({data:[transaction,rewardTransaction]})
                    expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false)   
                })
            })
        })
        describe('and the transaction data has atleast one malformed input',()=>{
            it('returns false',()=>{
                wallet.balance=9000
                const evilOutputMap={
                    [wallet.publicKey]:8900,
                    foorecipient:100
                }
                const evilTransaction={
                    input:{
                        timestamp:Date.now(),
                        amount:wallet.balance,
                        address:wallet.publicKey,
                        signature:wallet.sign(evilOutputMap)
                    },
                    outputMap:evilOutputMap
                }
                newChain.addBlock({data:[evilTransaction,rewardTransaction]})
                expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false)
            })
        })
        describe('and the block contains multiple identical transaction',()=>{
            it('returns false',()=>{
                newChain.addBlock({
                    data:[transaction,transaction,transaction,rewardTransaction]
                })
                expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false)
            })
        })
    })
})