# @dazaar/eth-tweak

Tweak an eth public key into a series of session keys for Dazaar payments.

```
npm install @dazaar/eth-tweak
```

## Usage

``` js
const DazaarEthTweak = require('@dazaar/eth-tweak')

const d = new DazaarEthTweak({
  publicKey: ..., // your main eth public key
  secretKey: ..., // your main eth secret key (optional, only need to generate tweaked private keys)
  chainId: ...    // optional chain id
})

const addr = d.address(sellerKey, buyerKey) // get address for a specific session
const { publicKey, address } = d.publicData() // your public key and eth address
const { secretKey, publicKey, address } = d.keyPair(sellerKey, buyerKey) // the tweaked keypair
```

## License

MIT
