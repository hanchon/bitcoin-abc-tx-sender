var cfg = require('../config.json');
var RPC = require('./rpc.js');

var express = require('express');
var app = express();
var port = 24004;


const rpc = new RPC(cfg.rpcip, cfg.rpcport, cfg.rpcuser, cfg.rpcpassword);

//Start the server
app.listen(port, ()=>{});

app.get('/', async function (req, res) {
    await rpc.mineBlocks(1);
    res.send('A block was mined');
});