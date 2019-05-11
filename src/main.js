var cfg = require('../config.json');
var RPC = require('./rpc.js');
var Wallet = require('./wallet.js')
var bitcore = require('bitcore-lib-cash');

const rpc = new RPC(cfg.rpcip, cfg.rpcport, cfg.rpcuser, cfg.rpcpassword);

const seed = "this is my very secure seed";
const mainWallet = new Wallet(seed);
let wallets = [];
let utxos = []
const totalWallets = 600;

const feePerOutput = 600;
const dustToGenerateASecondOutput = 1000

// Creathe the 600 wallets
j = 0;
while (j < totalWallets) {
    wallets.push(new Wallet(seed + j))
    j++;
}

async function send25Transactions(walletIndex) {
    let k = 0;
    const wallet = wallets[walletIndex];
    let utxo = utxos[walletIndex];

    while (k < 25) {
        let balance = utxo.satoshis;
        balanceToSend = balance - dustToGenerateASecondOutput - (feePerOutput * 2);
        balanceInBch = bitcore.Unit.fromSatoshis(balanceToSend).toBTC();

        console.log("Wallet index = " + walletIndex + ". k = " + k + ". balance = " + balanceToSend + ". balancebch = " + balanceInBch)

        // Create the transaction (the second output is not going to be used anymore)
        var tx = new bitcore.Transaction()
            .from(utxo)
            .fee(feePerOutput * 2)
            .to([{
                "address": wallet.GetAddres(),
                "satoshis": balanceToSend
            }, {
                "address": wallet.GetAddres(),
                "satoshis": dustToGenerateASecondOutput
            }])
            .sign(wallet.GetPrivKey());

        // Send the transaction
        let newHash = await rpc.sendRawTransaction(tx.serialize());
        utxo = new bitcore.Transaction.UnspentOutput({
            "txid": newHash,
            "vout": 0,
            "address": wallet.GetAddres(),
            "scriptPubKey": wallet.GetP2pkhScript(),
            "amount": balanceInBch
        })
        k++;
    }
    utxos[walletIndex] = utxo;
    return true;
}

// Run 
(async () => {

    // Send 50*99 BCH to the mainWallet
    await rpc.mineBlocks(201);
    const amountToSendToMainWallet = 50 * 99;
    let initUtxoHash = await rpc.sendToAddress(mainWallet.GetAddres(), amountToSendToMainWallet)
    await rpc.mineBlocks(1);

    // Create the utxo
    let firstUtxo = new bitcore.Transaction.UnspentOutput({
        "txid": initUtxoHash,
        "vout": 0,
        "address": mainWallet.GetAddres(),
        "scriptPubKey": mainWallet.GetP2pkhScript(),
        "amount": amountToSendToMainWallet
    })

    // Send the balance to the 600 wallets
    // Calculate satothis to send
    let fees = feePerOutput * totalWallets * 3;
    let balance = bitcore.Unit.fromBTC(amountToSendToMainWallet).toSatoshis();
    balance = balance - fees;
    balancePerUtxo = balance / totalWallets;
    balancePerUtxoInBch = bitcore.Unit.fromSatoshis(balancePerUtxo).toBTC();

    // Create outputs
    let dest = []
    let i = 0
    while (i < totalWallets) {
        dest.push({
            "address": wallets[i].GetAddres(),
            "satoshis": balancePerUtxo
        });
        i++;
    }

    // Create the transaction
    var tx = new bitcore.Transaction()
        .from(firstUtxo)
        .fee(fees)
        .to(dest)
        .sign(mainWallet.GetPrivKey());

    // Send the transaction
    let newHash = await rpc.sendRawTransaction(tx.serialize());

    i = 0
    while (i < totalWallets) {
        utxos[i] = new bitcore.Transaction.UnspentOutput({
            "txid": newHash,
            "vout": i,
            "address": wallets[i].GetAddres(),
            "scriptPubKey": wallets[i].GetP2pkhScript(),
            "amount": balancePerUtxoInBch
        })
        i++;
    }


    // Mine a block to confirm it
    await rpc.mineBlocks(1);

    // NOTE: Don't use promises.all because the bitcoind rpc will start to reject txns
    // var promises = [];
    // console.time("Time this");
    // i = 0
    // while (i < totalWallets) {
    //     promises.push(send25Transactions(i));
    //     i++;
    // }
    // await Promise.all(promises);
    // console.timeEnd("Time this");

    console.time("Time this");
    i = 0
    while (i < totalWallets) {
        await send25Transactions(i);
        i++;
    }
    console.timeEnd("Time this");

    // Confirm all the txns
    await rpc.mineBlocks(1);

})();