import React, {useEffect, useState} from "react";
import axios from 'axios';
import {ethers} from "ethers";
export default function SendMessageFrontend(){
    const [backendSignedMessage, setBackendSignedMessage] = React.useState();
    const handleSendSignedMessage = () => {
        axios.get("/message").then(async (res) => {
          const {sign, contractAddress, signer, nonce, message, messageHash, r, s, v} = res.data;
          const abi = [
            "function verify( address _signer, string memory _message, uint _nonce, bytes memory signature ) public pure returns (bool, address, address)",
            "function getMessageHash( string memory _message, uint _nonce ) public pure returns (bytes32)",
            "function verifyWithRVS(address _signer,bytes32 _ethSignedMessageHash, bytes32 r, bytes32 s, uint8 v) public pure returns (bool, address, address)",
            "function recoverWithECDSA(bytes32 hash, bytes memory signature) public pure returns(address)"
          ];
          //const contractAddress = res.data.contractAddress;
          console.log(res.data);
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const frontendSigner = provider.getSigner();
          console.log("contractAddress",contractAddress);
          let contract = await new ethers.Contract(contractAddress, abi, frontendSigner);
          console.log("signer is : ", signer);
          let tx = await contract.recoverWithECDSA(messageHash, sign);
          //let tx = await contract.verifyWithRVS(signer,messageHash,r,s,v);
          //let tx = await contract.verify(signer,message,nonce,sign);
          //let tx = await contract.getMessageHash(message, messageHash);
          if(tx?.hash){
            await provider.waitForTransaction(hash);
          }
          console.log(tx);
          setBackendSignedMessage(tx);
        });
      }

      return(
          <>
        <button onClick={handleSendSignedMessage}> Get Message From Backend </button>
      <p>Tx Recovered Address : {backendSignedMessage ? backendSignedMessage : ""}</p> <br></br>
     
      
      </>
      )

}