const {Wallet} = require("../src/wallet/Wallet")
const {verifySignature}=require('../src/utils/keypairutils.js')
const {Transaction}=require("../src/wallet/transactions");
const Blockchain = require("../src/blockchain/blockchain");
const {STARTING_BALANCE}=require("../src/config/config")


describe('WalletTest',()=>{
    let wallet
    beforeEach(()=>{
        wallet=new Wallet()
    })
    it('has a `balance`',()=>{
        expect(wallet).toHaveProperty('balance')
    })
    it('has a  `publicKey`',()=>{

        expect(wallet).toHaveProperty('publicKey')
    })
    describe('signature',()=>{
        const data="foobar"
        it('verifies a signature',()=>{
            expect(verifySignature({data,signature:wallet.sign(data),publicKey:wallet.publicKey})).toBe(true)
        })
        it('doesnot verify a signature',()=>{
            expect(verifySignature({data,signature:new Wallet().sign(data),publicKey:wallet.publicKey})).toBe(false)
        })

    })
    describe('createTransaction()',()=>{
        describe('and the amount exceeds the balance',()=>{
            it('throws an error',()=>{
                expect(()=>wallet.createTransaction({amount:99999,recipient:'foo-recipient  '})).toThrow('Amount exceeds Balance')
            })
        })
        describe('and the amount is valid',()=>{
            let transaction,amount,recipient
            beforeEach(()=>{
                amount=50
                recipient='foo-recipient'
                transaction=wallet.createTransaction({amount,recipient})
            })
            it('creates an instance of `transaction`',()=>{
                expect(transaction instanceof Transaction).toBe(true)
            })
            it('matches the transaction input with wallet',()=>{
                expect(transaction.input.address).toEqual(wallet.publicKey)
            })
            it('outputs the amount to recipient',()=>{
                expect(transaction.outputMap[recipient]).toEqual(amount)
            })

        })
        describe('and a chain is passed',()=>{
            it('calls `Wallet.calculateBalance`',()=>{
                const calculateBalanceMock=jest.fn()
                const originalCalculateBalance=Wallet.calculateBalance
                Wallet.calculateBalance=calculateBalanceMock
                
                wallet.createTransaction({
                    recipient:"foo",
                    amount:10,
                    chain:new Blockchain().chain
                })
                expect(calculateBalanceMock).toHaveBeenCalled()
                Wallet.calculateBalance=originalCalculateBalance
            })
        })
    })
    describe('calculateBalance()',()=>{
        let blockchain
        beforeEach(()=>{
            blockchain=new Blockchain()
        })
        describe('and there are no outputs for wallet',()=>{
            it('returns the starting balance',()=>{
                expect(Wallet.calculateBalance({chain:blockchain.chain,
                address:wallet.publicKey})).toEqual(STARTING_BALANCE)
            })
        })
        describe('and there are outputs for wallet',()=>{
            let transactionOne,transactionTwo
            beforeEach(()=>{
                transactionOne=new Wallet().createTransaction({
                    recipient:wallet.publicKey,
                    amount:50})
                transactionTwo=new Wallet().createTransaction({
                    recipient:wallet.publicKey,
                    amount:60})    
                blockchain.addBlock({
                    data:[transactionOne,transactionTwo]
                })
            })
           it('adds the sum of all outputs to wallet balance',()=>{
                expect(Wallet.calculateBalance({chain:blockchain.chain,
                address:wallet.publicKey})).toEqual(STARTING_BALANCE+transactionOne.outputMap[wallet.publicKey]+transactionTwo.outputMap[wallet.publicKey])
           })



        })
        describe('and the wallet has made a transaction',()=>{
            let recentTransaction
            beforeEach(()=>{
                recentTransaction=wallet.createTransaction({
                    recipient:'foo-address',
                    amount:30
                })
                blockchain.addBlock({data:[recentTransaction]})
            })
            it('returns the output amount of the recent transaction',()=>{
                expect(Wallet.calculateBalance({
                    chain:blockchain.chain,
                    address:wallet.publicKey}
                )).toEqual(recentTransaction.outputMap[wallet.publicKey])
            })
            describe('and there are outputs next to after recent transaction',()=>{
                let sameBlockTransaction,nextBlockTransaction
                beforeEach(()=>{
                    recentTransaction=wallet.createTransaction({
                        recipient:'later-foo-address',
                        amount:20
                    })
                    sameBlockTransaction=Transaction.rewardTransaction({minerWallet:wallet})
                    blockchain.addBlock({data:[recentTransaction,sameBlockTransaction]})
                    nextBlockTransaction=new Wallet().createTransaction({
                        recipient:wallet.publicKey,
                        amount:30
                    })
                    blockchain.addBlock({data:[nextBlockTransaction]})
                })

                it('includes the ouput amount in returned balance',()=>{
                    expect(Wallet.calculateBalance({chain:blockchain.chain,
                    address:wallet.publicKey})).toEqual(
                        recentTransaction.outputMap[wallet.publicKey]+sameBlockTransaction.outputMap[wallet.publicKey]+
                        nextBlockTransaction.outputMap[wallet.publicKey]
                    )
                })
            })
        })

    })


})