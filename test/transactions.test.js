const {Wallet} = require("../src/wallet/Wallet")
const {Transaction}=require("../src/wallet/transactions");
const { verifySignature } = require("../src/utils/keypairutils");
const { REWARD_INPUT, MINING_REWARD } = require("../src/config/config");
const transactionPool = require("../src/wallet/transaction-pool");

describe('transactions',()=>{
    let transaction,senderWallet,recipient,amount;
    beforeEach(()=>{
        senderWallet=new Wallet()
        recipient='recipient-public-key'
        amount=10
        transaction=new Transaction({senderWallet,recipient,amount})
    })
    it('has an`id`',()=>{
        expect(transaction).toHaveProperty('id')
    })
    describe('outputMap',()=>{
        it('has an output map', ()=>{
            expect(transaction).toHaveProperty('outputMap')
        })
        it('outputs the amount to `recipient`',()=>{
            expect(transaction.outputMap[recipient]).toEqual(amount)
        })
        it('reverts the balance to `senderWallet`',()=>{
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance-amount)
        })

    })
    describe('input',()=>{
        it('has an `input`',()=>{
            expect(transaction).toHaveProperty('input')
        })
        it('has a `timestamp` in the input',()=>{
            expect(transaction.input).toHaveProperty('timestamp')
        })
        it('sets the amount to sender wallet balance',()=>{
            expect(transaction.input.amount).toEqual(senderWallet.balance)
        })
        it('sets the `address` to sender wallet `publickey`',()=>{
            expect(transaction.input.address).toEqual(senderWallet.publicKey)
        })
        it('signs the input',()=>{
            expect(verifySignature({
                publicKey:senderWallet.publicKey,
                data:transaction.outputMap,
                signature:transaction.input.signature
            }
            )).toBe(true)
        })
    })
    describe('valid transaction',()=>{
        let errorMock
        beforeEach(()=>{
            errorMock=jest.fn()
            global.console.error=errorMock
        })
        describe('when the transaction is valid',()=>{
            it('returns true',()=>{
            expect(Transaction.validTransaction(transaction)).toBe(true)
            })
        })
        describe('when the transaction is invalid',()=>{
            describe('and the output map value is incorrect',()=>{
                it('returns false',()=>{
                    transaction.outputMap[senderWallet.publicKey]=999999
                    expect(Transaction.validTransaction(transaction)).toBe(false)
                    // expect(errorMock).toHaveBeenCalled()
                    
                    })
            })
            describe('and the transaction input signature is invalid',()=>{
                it('returns false',()=>{
                    transaction.input.signature=new Wallet().sign(transaction.outputMap)
                    expect(Transaction.validTransaction(transaction)).toBe(false)
              
              
                    })
            })
        })
    })
    describe('update',()=>{
        let originalSignature,originalSenderOutput,nextRecipient,nextAmount
        describe('and the amount is invalid',()=>{
            it('throws an erro',()=>{
               expect(()=>{transaction.update({senderWallet,recipient:'foo',amount:99999})}).toThrow('amount exceeds balance')
            })
        })

        describe('and the amount is valid',()=>{
        beforeEach(()=>{
            originalSignature=transaction.input.signature
            originalSenderOutput=transaction.outputMap[senderWallet.publicKey]
            nextRecipient='foo-second'
            nextAmount=10
            transaction.update({senderWallet,recipient:nextRecipient,amount:nextAmount})
        })

        it('outputs the amount to next recipient',()=>{
            expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount)
        })
        it('subtracts the amount from accounts balance',()=>{
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput-nextAmount)

        })
        it('maintains a total output that matches input amount',()=>{
            expect(Object.values(transaction.outputMap)
            .reduce((total,outputAmount)=>total+outputAmount)).toEqual(transaction.input.amount)
        })
        it('resigns the transaction',()=>{
            expect(transaction.input.signature).not.toEqual(originalSignature)
        })

        describe('and another update to same recipient',()=>{
            let addedAmount
            beforeEach(()=>{
                addedAmount=20
                transaction.update({senderWallet,recipient:nextRecipient,amount:addedAmount})
            })
            it('adds to recipient amount',()=>{
                expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount+addedAmount)
            })
            it('should subtract new amount from original amount',()=>{
                expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput-nextAmount-addedAmount)
            })
        })
    })
                            
          })
    describe('rewardTransaction()',()=>{
        let rewardTransaction,minerWallet
        beforeEach(()=>{
            minerWallet=new Wallet()
            rewardTransaction=Transaction.rewardTransaction({minerWallet})
        })
        it('creates a transaction with reward input',()=>{
            expect(rewardTransaction.input).toEqual(REWARD_INPUT)
        })
        it('creates one transaction for miner with the mining reward',()=>{
            expect(rewardTransaction.outputMap[minerWallet.publicKey]).toEqual(MINING_REWARD)
        })
    })     
})