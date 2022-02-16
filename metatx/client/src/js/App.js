import React from "react";

import SendMessageFrontend from "./SendMessageFrontend";
import SendMessageBackend from "./SendMessageBackend";
import SendTxFrontend from "./SendTxFrontend";
// https://docs.ethers.io/v5/api/provider2s/provider2/#provider2-sendTransaction

window.isSended = false;
export default function App() {

  // const [signature, setSignature] = React.useState();
  // const [transaction, setTransaction] = React.useState();
 
 
  // React.useEffect(()=>{
    
  // },[]);


  // React.useEffect(()=>{
  //   axios.get("/message").then(async (res) => {
      
  //     // const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     // const { hash } = await provider.sendTransaction(
  //     //   res.data.raw
  //     // );
  //     // let a = await provider.waitForTransaction(hash);
  //     //   console.log(a);
        
  //       console.log("res.data.raw => ", res.data.raw);
  //       web3.eth.sendSignedTransaction(res.data.raw, (err, txHash) => {
  //       console.log('txHash: ', txHash)
  //       console.log(err)
  //      })
  //     })
    
     
     
  //   //   console.log("signature : ",res.data.signature.rawTransaction);
  //   //  let tx = await web3.eth.sendSignedTransaction(res.data.signature.rawTransaction);
  //   //  console.log("tx details : ",tx);
  //   //   const provider = new ethers.providers.Web3Provider(window.ethereum);
  //   //   const signer = provider.getSigner();
  //   //   console.log(signer);
  //   //  const abi = ["function greet() public view returns (string memory)", "function setGreeting(string memory _greeting) public"];
  //   //  let contract = await new ethers.Contract(res.data.contract, abi, signer);
  //   //  console.log(contract);
  //    //let result = await contract.greet();
  //     //console.log("result si :", result);
  //   //   await window.ethereum.enable();
  //   //     console.log(res.data.signature);
  //   //     //let txSerialize = ethers.utils.serializeTransaction(res.data.signature);
  //   //     if (!window.ethereum)
  //   //   throw new Error("No crypto wallet found. Please install it.");

  //   // const accounts = await window.ethereum.send("eth_requestAccounts");
  //   // console.log(accounts);
  //   // const provider2 = new ethers.providers.Web3Provider(window.ethereum);
  //   // //const provider2 = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
  //   // const signer = provider2.getSigner();
  //   // console.log(res.data.signature.rawTransaction);
  //   // const network = await provider2.getNetwork();

  //   // console.log("Network name=", network.name);
  //   // console.log("Network chain id=", network.chainId);
  //   // //signer.sendUncheckedTransaction(res.data.signature.rawTransaction);
    
  //   //  // let txReturn = await provider2.sendTransaction(res.data.signature.rawTransaction);
  //   //  // console.log("txReturn is : ",txReturn);
     
  //   //   let addr = res.data.contract;
  //   //   const abi = ["function greet() public view returns (string memory)", "function setGreeting(string memory _greeting) public"];
  //   //   let contract = await new ethers.Contract(addr, abi, signer);
  //   //   console.log(contract);
  //   //   if(!window?.isSended){
  //   //     let frontend = await contract.setGreeting("Hello New ! ");
  //   //    console.log("Ftx ==> ", frontend);
  //   //     //console.log("provider2 is : ", provider2);
  //   //    // const signer = await provider2.getSigner();
  //   //    // console.log("signer is : ", signer);
  //   //     //let newTx = await provider2.sendTransaction(res.data.signature.rawTransaction); //contract.provider.sendTransaction(res.data.signature.rawTransaction);
  //   //   //console.log("result of new tx",newTx);
  //   //   }
  //   //   window.isSended = true;
  //   //   try{
  //   //     let result = await contract.greet();
  //   //   console.log("result si :", result);
  //   //   }catch(err){
  //   //     console.log(err);
  //   //   }
    
    
  // })

    // const tx = {
    //   to: "0x983952D557A8176A816AE536499991CC93dfc466",
    //   value: ethers.utils.parseEther("1.0"),
    //   from: "0x08B745e2a7B39333ac451E6E99Cd8420A5286F59",
    //   nonce: 0,
    //   data: "0x0",
    //   gasLimit: 21000,
    //   gasPrice: 100,
    //   maxFeePerGas: 1000,
    //   maxPriorityFeePerGas: 10000,
    //   chainId: Number("0x13881")
    // };

  return (
    <div>
      <SendMessageFrontend />
      <br />
      <p>---------------------------------------------------------</p>
      <br/>
      <SendMessageBackend />
      <br />
      <p>---------------------------------------------------------</p>
      <br/>
      <SendTxFrontend />
      <br />
      <p>---------------------------------------------------------</p>
      <br/>
    </div>
  );
}
