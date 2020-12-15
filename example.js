const DazaarEthTweak = require('.')
const key = DazaarEthTweak.keygen()

const d = new DazaarEthTweak(key)

console.log(key.publicKey)
const addr = d.address('foo', 'bar') // get address for a specific session
console.log(key.publicKey)
console.log(addr)
console.log(d.publicData())
console.log(key.publicKey) // your public key and eth address
console.log(d.keyPair('foo', 'bar')) // the tweaked keypair
console.log(key.publicKey)
