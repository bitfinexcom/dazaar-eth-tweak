const secp256k1 = require('secp256k1')
const keccak = require('keccak')
const checksum = require('eth-checksum')
const etk = require('eth-tweak-key')

module.exports = class Tweaker {
  constructor (opts = {}) {
    this.chainId = opts.chainId || undefined
    this.publicKey = toBuffer(opts.publicKey)
    this.secretKey = toBuffer(opts.secretKey) || null
  }

  getTweak (seller, buyer) {
    const meta = 'dazaar ' + seller.toString('hex') + ' ' + buyer.toString('hex')
    return hash(Buffer.from(meta))
  }

  tweakPublicData (seller, buyer) {
    let tweak = this.getTweak(seller, buyer)

    for (let i = 0; i < 1e3; i++) {
      const res = etk.tweakPublic(this.publicKey, tweak, this.chainId)
      if (etk.validatePublicKey(res.publicKey)) return res
      tweak = hash(tweak)
    }

    throw new Error('Key not tweakable')
  }

  address (seller, buyer) {
    const tweak = this.tweakPublicData(seller, buyer)
    return tweak.address
  }

  keyPair (seller, buyer, sk = this.secretKey) {
    if (!sk) throw new Error('Secret key required')

    sk = toBuffer(sk)
    let tweak = this.getTweak(seller, buyer)

    for (let i = 0; i < 1e3; i++) {
      const secretKey = etk.tweakPrivate(sk, tweak)
      const res = Tweaker.publicData(secretKey, this.chainId)
      if (etk.validatePublicKey(res.publicKey)) return { secretKey, ...res }
      tweak = hash(tweak)
    }

    throw new Error('Key not tweakable')
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
    const p = Buffer.from(secp256k1.publicKeyCreate(toBuffer(sk), false))
    const digest = hash(Buffer.from(p.slice(1))).slice(-20)
    const address = checksum.encode(digest, chainId)

    return {
      publicKey: p,
      address
    }
  }
}

function toBuffer (sk) {
  if (typeof sk === 'string') return Buffer.from(sk, 'hex')
  return sk
}

function hash (b) {
  return keccak('keccak256').update(b).digest()
}
