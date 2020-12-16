const keygen = require('eth-keygen')
const checksum = require('eth-checksum')
const etk = require('eth-tweak-key')
const keccak = require('sha3-wasm').keccak256

module.exports = class Tweaker {
  constructor (opts = {}) {
    this.chainId = opts.chainId
    this.publicKey = toBuffer(opts.publicKey)
    this.secretKey = toBuffer(opts.secretKey) || null
  }

  getTweak (seller, buyer) {
    const meta = 'dazaar ' + seller.toString('hex') + ' ' + buyer.toString('hex')
    return hash(Buffer.from(meta))
  }

  static validatePublicKey (pk) {
    return etk.validatePublicKey(pk)
  }

  tweakPublicData (seller, buyer) {
    let tweak = this.getTweak(seller, buyer)

    while (true) {
      const res = etk.tweakPublic(Buffer.from(this.publicKey), tweak, this.chainId)
      if (etk.validatePublicKey(res.publicKey)) return res
      tweak = hash(tweak)
    }
  }

  address (seller, buyer) {
    const tweak = this.tweakPublicData(seller, buyer)
    return tweak.address
  }

  keyPair (seller, buyer, sk = this.secretKey) {
    if (!sk) throw new Error('Secret key required')

    sk = toBuffer(sk)
    let tweak = this.getTweak(seller, buyer)

    while (true) {
      const secretKey = etk.tweakPrivate(Buffer.from(sk), tweak)
      const res = Tweaker.publicData(secretKey, this.chainId)
      if (etk.validatePublicKey(res.publicKey)) return { secretKey, ...res }
      tweak = hash(tweak)
    }
  }

  publicData () {
    const digest = hash(Buffer.from(this.publicKey.slice(1))).slice(-20)
    const address = checksum.encode(digest, this.chainId)

    return {
      publicKey: this.publicKey,
      address
    }
  }

  static publicData (sk, chainId) {
    const { publicKey, address } = this.keygen(sk, chainId)

    return { publicKey, address }
  }

  static keygen (sk, chainId) {
    const { address, publicKey, privateKey: secretKey } = keygen(toBuffer(sk), chainId)

    return { address, publicKey, secretKey }
  }
}

function toBuffer (sk) {
  if (typeof sk === 'string') return Buffer.from(sk, 'hex')
  return sk
}

function hash (b) {
  return keccak().update(b).digest()
}
