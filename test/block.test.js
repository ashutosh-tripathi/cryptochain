
const Block = require('../src/blockchain/block')
const { GENESIS_DATA,MINE_RATE } = require('../src/config/config')
const cryptoHash = require("../src/utils/cryptoHash")
const hexToBinary = require('hex-to-binary')


describe('block',()=>{
    const timestamp=2000
    const lastHash='hash-last'
    const hash='this-hash'
    const data ='this-data'
    const nonce=1
    const difficulty=1
    const testblock=new Block({timestamp,lastHash,hash,data,nonce,difficulty})
    it('has all properties',()=>{
    expect(testblock.timestamp).toBe(timestamp)
    expect(testblock.lastHash).toBe(lastHash)
    expect(testblock.hash).toBe(hash)
    expect(testblock.data).toBe(data)
    expect(testblock.nonce).toBe(nonce)
    expect(testblock.difficulty).toBe(difficulty)
    })
    describe('genesis()',()=>{
        const genesisBlock=Block.genesis()
        // console.log(genesisBlock)
        it('returns a block',()=>{
            expect(genesisBlock instanceof Block).toBe(true)
        })
        it('returns the genesis data',()=>{
            expect(genesisBlock).toEqual(GENESIS_DATA)
        })
    })
    describe('mineBlock()',()=>{
        const lastBlock=Block.genesis()
        const data='mineData'
        const minedBlock=Block.mineBlock({lastBlock,data})
        // console.log(minedBlock)
        it('returns a block',()=>{
            expect(minedBlock instanceof Block).toBe(true)
        })
        it('sets the `lastHash` to be equal to hash of last Block',()=>{
            expect(minedBlock.lastHash).toEqual(lastBlock.hash)
        })
        it('sets the `data`',()=>{
            expect(minedBlock.data).toEqual(data)
        })
        it('sets a `timestamp`',()=>{
            expect(minedBlock.timestamp).not.toBe(undefined)
        })
        it('adjusts the difficulty',()=>{
            const possibleResults=[lastBlock.difficulty+1,lastBlock.difficulty-1]
            expect(possibleResults.includes(minedBlock.difficulty)).toBe(true)
        })
        it('creates a SHA-256 `hash` based on the proper inputs', () => {
            expect(minedBlock.hash)
              .toEqual(
                cryptoHash(
                  minedBlock.timestamp,
                  minedBlock.nonce,
                  minedBlock.difficulty,
                  lastBlock.hash,
                  data
                )
              )
          })
          it('sets a `hash` that matches the difficulty criteria', () => {
            expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty))
              .toEqual('0'.repeat(minedBlock.difficulty));
          });
    })
    describe('adjusts difficulty',()=>{
        it('raises the difficulty in a quickly mined block',()=>{
            expect(Block.adjustDifficulty({
                originalBlock:testblock,
                timestamp:testblock.timestamp+MINE_RATE-100
            })).toEqual(testblock.difficulty+1)
        })
        it('lowers the difficulty in a slowly mined block',()=>{
            expect(Block.adjustDifficulty({
                originalBlock:testblock,
                timestamp:testblock.timestamp+MINE_RATE+100
            })).toEqual(testblock.difficulty-1)
        })
        it('sets minimum difficulty of 1',()=>{
            testblock.difficulty=-1
            expect(Block.adjustDifficulty({originalBlock:testblock})).toBe(1)
        })
    })
})


