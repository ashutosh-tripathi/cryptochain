const cryptoHash = require("../src/utils/cryptoHash")

describe('cryptoHash',()=>{
    it('produces right cryptohash',()=>{
        expect(cryptoHash('foo')).toEqual('b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b'.toLowerCase())

    })
    it('produces same hash irrespective of order',()=>{
        expect(cryptoHash('one','two','three')).toEqual(cryptoHash('two','three','one'))
    })

    it('produces a unique hash when properties are chnaged in input',()=>{
        const foo={}
        const hash1=cryptoHash(foo)
        foo['a']='a'
        const hash2=cryptoHash(foo)
        expect(hash1).not.toEqual(hash2)
    })
})