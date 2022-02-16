// server/index.js
const path = require('path');
const express = require("express");
const Web3 = require("web3");
const Tx = require('ethereumjs-tx').Transaction
const ethers = require("ethers");
require('dotenv').config()
//http://127.0.0.1:8545/
const PORT = process.env.PORT || 3001;
const web3 = new Web3(new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545"));
const app = express();
app.use(express.json());
var cors = require('cors');
const { hashMessage } = require('ethers/lib/utils');
const contractAddress = "0x74D657B2f70C17B396710e4C3d1163F9333c2444";
app.use(cors());
//const privateKey1 = Buffer.from(process.env.PRIVATE_KEY_1, 'hex');

app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
});

app.get("/build/js/app.js", (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build/js', 'app.js'));
});

app.get("/build/js/web3.min.js", (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build/js', 'web3.min.js'));
});


app.get("/message", async (req, res) => {
 

  let message = "This message will be signed";
  let {signature, messageHash, r, s, v} = await web3.eth.accounts.sign(message, process.env.PRIVATE_KEY_1);

  res.json({r,s,v,messageHash,sign: signature, contractAddress, signer:web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY_1).address, message, nonce:1});
});

app.post("/message", async(req,res) => {
  // Choose Library
  // console.log("web3.eth.accounts.hashMessage(message); => ", web3.eth.accounts.hashMessage(message));
  // console.log("sign = ", signature);
  // console.log("web3 message hash => ", messageHash);
  // console.log("message hash => ", web3.eth.accounts.hashMessage(web3.utils.utf8ToHex(message)));
  const {signature, messageHash} = req.body;
  
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY_1, provider);
  const abi = [
    "function verify( address _signer, string memory _message, uint _nonce, bytes memory signature ) public pure returns (bool, address, address)",
    "function getMessageHash( string memory _message, uint _nonce ) public pure returns (bytes32)",
    "function verifyWithRVS(address _signer,bytes32 _ethSignedMessageHash, bytes32 r, bytes32 s, uint8 v) public pure returns (bool, address, address)",
    "function recoverWithECDSA(bytes32 hash, bytes memory signature) public pure returns(address)"
  ];

  let contract = await new ethers.Contract(contractAddress, abi, signer);
  let tx = await contract.recoverWithECDSA(messageHash, signature);
  if(tx?.hash){
    await provider.waitForTransaction(hash);
  }
  
   res.json({resolvedAddress:tx});
})


app.post("/transaction", async(req,res) => {
   // Choose Library
   const {raw, lib1, lib2} = req.body;
   
  console.log("raw is", raw);
  await web3.eth.sendSignedTransaction(raw, (err, txHash) => {
    console.log('txHash: ', txHash);
    console.log(err);
   });
   res.json({txHash, err});
})

app.get("/transaction", async (req,res)=>{
  // Choose Library
  const {lib1, lib2} = req.query;
  const contractAddress = "0x5a6427774c2b7a89614d72e7f55848C128377c08";
  const abi = [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_greeting",
          "type": "string"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "greet",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_greeting",
          "type": "string"
        }
      ],
      "name": "setGreeting",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  web3.eth.getTransactionCount("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", async (err, txCount) => {
    // Build a transaction
    const contract = await new web3.eth.Contract(abi, contractAddress);
    let myData=contract.methods.setGreeting("From Backend").encodeABI()

    const txObject = {
         nonce: web3.utils.toHex(txCount),
         to: contractAddress,
         //value: web3.utils.toHex(web3.utils.toWei('1', 'ether')),
         gasLimit: web3.utils.toHex(21000),
         gasPrice: web3.utils.toHex(web3.utils.toWei('100', 'gwei')),
         data : myData
    }
    // Sign the transaction
    const tx = new Tx(txObject);
    
    //tx.sign(privateKey1)
    const serializedTransaction = tx.serialize()
    const raw = '0x' + serializedTransaction.toString('hex')
    // Broadcast the transaction
    // web3.eth.sendSignedTransaction(raw, (err, txHash) => {
    //      console.log('txHash: ', txHash)
    //      console.log(err)
    //     })
    // })


//   const contract = await new web3.eth.Contract(abi, contractAddress);
//   let myData=contract.methods.setGreeting("Last Wallet").encodeABI()
//   const signature = await web3.eth.accounts.signTransaction({
//     to: contractAddress,
//     data: myData,
//     gas: 2000000,
//     chainId: 1337 
// },
// "0525cdf2b120c810e699bbcee7f052afca732cab561fe123156eb392ef7d0ac0"
// );

    res.json({signature: {}, contract:contractAddress, abi:abi, raw:raw});
  });
  //res.json({signature: signature, contract: contractAddress, abi:abi});
});

  // All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
   // const root = require('path').join(__dirname, 'client', 'build')
   console.log(path.resolve(__dirname, '../client', 'index.html'));
    res.sendFile(path.resolve(__dirname, '../client', 'index.html'));
});
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

