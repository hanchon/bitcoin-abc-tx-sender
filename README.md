# Regtest tx sender

A simple code to send txns using the bitcoind rpc calls.


## Requirements

* NodeJs
* Bitcoin-abc


## Usage

* Run the bitcoin-abc node:
```
./bitcoind -regtest -printtoconsole -rpcuser=hanchon -rpcpassword=hanchonpass -rpcport=18888 -rpcworkqueue=1024 -blockmaxsize=32000000 -excessiveblocksize=32000000
```

* Clone this repo:
```
git clone https://github.com/hanchon/bitcoin-abc-tx-sender
```

* Install dependencies
```
cd bitcoin-abc-tx-sender
npm install
```

* Run the program:
```
node src/main.js
```

## Configure the program:

* The function `send25Transactions` can be modified to add more outputs and make the transaction bigger.
* Right know the program is using 600 wallets and each wallet send 25 transactions. The wallet count can be modified with `totalWallets`


## Know errors:

Sometimes when starting the program it returns:
```
{ result: null,
  error: { code: -26, message: '66: insufficient priority' },
  id: 'spam' }
```

This is a fee error, clear the blockchain and restart the node and this program.
