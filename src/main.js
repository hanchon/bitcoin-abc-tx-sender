var cfg = require('../config.json');
var RPC = require('./rpc.js');
var Wallet = require('./wallet.js')
var bitcore = require('bitcore-lib-cash');

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var port = 24004;


const rpc = new RPC(cfg.rpcip, cfg.rpcport, cfg.rpcuser, cfg.rpcpassword);

//Start the server
server.listen(port, async ()=>{
    await rpc.mineBlocks(1);
    return "A block was mined";
});
