import React, {useEffect, useState} from "react";
import {ethers} from "ethers";
import axios from "axios";
export default function SendMessageBackend(){
    const [input, setInput] = React.useState("");
    const [sign, setSign] = React.useState();
    const [resolvedAddress, setResolvedAddress] = React.useState();
    const handleSignAndSendMessage = async () => {
        if (!window.ethereum)
      throw new Error("No crypto wallet found. Please install it.");
      const web3 = new Web3(Web3.givenProvider);
    const accounts = await web3.eth.getAccounts();

    //await window.ethereum.send("eth_requestAccounts");
    //const provider = new ethers.providers.Web3Provider(window.ethereum);
    //const signer = provider.getSigner();
    //const signature = await signer.signMessage(input);
    console.log(accounts);
    const signature= await web3.eth.personal.sign(input, accounts[0]);
    const messageHash = web3.eth.accounts.hashMessage(web3.utils.utf8ToHex(input))
    setSign(signature);
        axios.post("/message", {signature, messageHash}, {headers:{
            'Content-Type': 'application/json',
        }}).then(async (res) => {
            setResolvedAddress(res.data.resolvedAddress);
        });
      }

      return(
          <>
    <label htmlFor="msg">Sign This : </label>
      <br />
       <input
        id="msg"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></input> 
      <br />
      <button onClick={handleSignAndSendMessage}>Sign And Send Backend</button>
      <p>{sign ?? ""}</p> <br></br>
      <p>Resolved Address  : {resolvedAddress ?? ""}</p>
      
      </>
      )

}