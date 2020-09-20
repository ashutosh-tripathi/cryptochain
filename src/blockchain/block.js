const hexToBinary=require('hex-to-binary')
const { GENESIS_DATA, MINE_RATE } = require("../config/config")
const cryptoHash = require("../utils/cryptoHash")

class Block{
    constructor({timestamp,lastHash,hash,data,nonce,difficulty})
    {
        this.timestamp=timestamp
        this.lastHash=lastHash
        this.hash=hash
        this.data=data
        this.nonce=nonce
        this.difficulty=difficulty
    }

    static genesis(){
        return new this(GENESIS_DATA)
    }
    static mineBlock({lastBlock,data})
    {
        let timestamp,nonce=0,hash
        let {difficulty}=lastBlock
        
        do{
            nonce++
            timestamp=Date.now()
            difficulty=this.adjustDifficulty({originalBlock:lastBlock,timestamp})
            hash=cryptoHash(timestamp,lastBlock.hash,data,nonce,difficulty)

        }while(hexToBinary(hash).substring(0,difficulty)!='0'.repeat(difficulty))
        return new Block({timestamp,lastHash:lastBlock.hash,hash,data,difficulty,nonce})
    }
    static adjustDifficulty({originalBlock,timestamp})
    {
        const {difficulty}=originalBlock
        if(difficulty<1)
        return 1
        const difference=timestamp-originalBlock.timestamp
        if(difference>MINE_RATE)
        return difficulty-1
        else if(difference<MINE_RATE)
        return difficulty+1
        else
        return difficulty
    }
}

module.exports=Block