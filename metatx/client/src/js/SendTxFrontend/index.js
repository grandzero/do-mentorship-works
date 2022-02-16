import React,{useState, useEffect} from "react";
import axios from 'axios';
//import Web3 from 'web3';
import {ethers} from "ethers";


export default function SendTxFrontend(){
    const [rawSignedTx, setRawSignedTx] = useState("");
  
    const handleSend = async() => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
          const { hash } = await provider.sendTransaction(rawSignedTx);
          let a = await provider.waitForTransaction(hash);
          console.log(a);
    }
    return (
        <>
            <button onClick={()=>{
                axios.get("/transaction").then(async (res) => {
                    const {contractAddress, abi, raw} = res.data;
                    setRawSignedTx(raw);
                    
                })
            }} >Get Raw Tx</button><br></br>
            <p>{rawSignedTx ?? ""}</p><br></br>
            <button onClick={handleSend}>Send Raw Tx</button>
        </>
    )
}