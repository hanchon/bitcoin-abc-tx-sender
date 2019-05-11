var bitcore = require('bitcore-lib-cash');

module.exports = class Wallet {

    constructor(seed) {
        this.network = bitcore.Networks.regtest;

        let value = Buffer.from(seed);

        const hash = bitcore.crypto.Hash.sha256(value);
        const bn = bitcore.crypto.BN.fromBuffer(hash);

        this.privateKey = new bitcore.PrivateKey(bn, this.network);
        this.address = this.privateKey.toAddress(this.network);
        this.script = bitcore.Script.buildPublicKeyHashOut(this.address);

    }

    GetAddres() {
        return this.address.toLegacyAddress();
    }

    GetPrivKey() {
        return this.privateKey;
    }

    GetP2pkhScript() {
        return this.script;
    }

}