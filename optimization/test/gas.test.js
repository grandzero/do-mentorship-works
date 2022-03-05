const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

describe("Stress tests on different NFT proposals", function () {
  let owner,addr1,addr2,addr3,addrAll;
  let e11, e721;
  let gasUsage = {};
  let provider;


  // let successCallback = async(cf, fc, args, options, saveGas, addr) => {
  //   let tx;
  //   let sender = addr ?? owner;
  //   let connectedContract = await cf.connect(sender);
  //   if(args){
  //     tx = options ? await connectedContract[fc](...args, options) : await connectedContract[fc](...args) 
  //   }
  //   else{
  //     tx = options ? await connectedContract[fc](options) : await connectedContract[fc]() 
  //   }
  //   //tx = args ? options ?  await cf.connect(sender).contractFunction(...args,options) : await cf.connect(sender).contractFunction(...args) : options ? await cf.connect(sender).contractFunction(options) : await cf.connect(sender).contractFunction();
  //   let receipt = await tx.wait();
  //   if(saveGas){
  //     const gasUsed = receipt.cumulativeGasUsed.toString();
  //     gasUsage[fc] = gasUsed;
  //   }
  //   return receipt;
  // };



  beforeEach(async ()=>{
    provider = waffle.provider;
    [owner,addr1,addr2,addr3,...addrAll] = await ethers.getSigners();
    const ERC1155Test = await ethers.getContractFactory("ERC1155Test");
    e11 = await ERC1155Test.deploy();
    await e11.deployed();

    const ERC721Test = await ethers.getContractFactory("ERC721Test");
    e721 = await ERC721Test.deploy();
    await e721.deployed();
  })

  it("Should mint 10 NFT from ERC721", async function () {
    for(let i = 0; i<10; ++i){
      let tx = await e721.connect(addr1).claim();
      let receipt = await tx.wait();
      const gasUsed = receipt.cumulativeGasUsed;
      gasUsage.claimERC721 = gasUsage?.claimERC721 ? gasUsage.claimERC721.add(gasUsed) : gasUsed;
    }
    gasUsage.claimERC721String = gasUsage.claimERC721.toString();
    expect(await e721.ownerOf(1)).to.equal(addr1.address);
});
  
  it("Should mint 100 NFT from ERC721", async function () {
      for(let i = 0; i<100; ++i){
        let tx = await e721.connect(addr1).claim();
        let receipt = await tx.wait();
        const gasUsed = receipt.cumulativeGasUsed;
        gasUsage.claimERC721_100 = gasUsage?.claimERC721_100 ? gasUsage.claimERC721_100.add(gasUsed) : gasUsed;
      }
      gasUsage.claimERC721String_100 = gasUsage.claimERC721_100.toString();
      expect(await e721.ownerOf(99)).to.equal(addr1.address);
  });

  it("Should mint 1000 NFT from ERC721", async function () {
    for(let i = 0; i<1000; ++i){
      let tx = await e721.connect(addr1).claim();
      let receipt = await tx.wait();
      const gasUsed = receipt.cumulativeGasUsed;
      gasUsage.claimERC721_1000 = gasUsage?.claimERC721_1000 ? gasUsage.claimERC721_1000.add(gasUsed) : gasUsed;
    }
    gasUsage.claimERC721String_1000 = gasUsage.claimERC721_1000.toString();
    expect(await e721.ownerOf(999)).to.equal(addr1.address);
});

// it("Should mint 7777 NFT from ERC721", async function () {
//   for(let i = 0; i<7777; ++i){
//     let tx = await e721.connect(addr1).claim();
//     let receipt = await tx.wait();
//     const gasUsed = receipt.cumulativeGasUsed;
//     gasUsage.claimERC721_7777 = gasUsage?.claimERC721_7777 ? gasUsage.claimERC721_7777.add(gasUsed) : gasUsed;
//   }
//   gasUsage.claimERC721String_7777 = gasUsage.claimERC721_7777.toString();
//   expect(await e721.ownerOf(999)).to.equal(addr1.address);
// });

/**
 * 
 * MINT WITH DIFFERENT ACCOUNTS
 * 
 */

 it("Should mint with different accounts 10 NFT from ERC721", async function () {
  for(let i = 0; i<10; ++i){
    let tx = await e721.connect(addrAll[i]).claim();
    let receipt = await tx.wait();
    const gasUsed = receipt.cumulativeGasUsed;
    gasUsage.claimERC721_wallet = gasUsage?.claimERC721_wallet ? gasUsage.claimERC721_wallet.add(gasUsed) : gasUsed;
  }
  gasUsage.claimERC721String_wallet = gasUsage.claimERC721_wallet.toString();
  expect(await e721.ownerOf(1)).to.equal(addrAll[1].address);
});

it("Should mint with different accounts 100 NFT from ERC721", async function () {
    for(let i = 0; i<100; ++i){
      let tx = await e721.connect(addrAll[i]).claim();
      let receipt = await tx.wait();
      const gasUsed = receipt.cumulativeGasUsed;
      gasUsage.claimERC721_wallet100 = gasUsage?.claimERC721_wallet100 ? gasUsage.claimERC721_wallet100.add(gasUsed) : gasUsed;
    }
    gasUsage.claimERC721String_wallet100 = gasUsage.claimERC721_wallet100.toString();
    expect(await e721.ownerOf(99)).to.equal(addrAll[99].address);
});

it("Should mint with different accounts 1000 NFT from ERC721", async function () {
  for(let i = 0; i<1000; ++i){
    let tx = await e721.connect(addrAll[i]).claim();
    let receipt = await tx.wait();
    const gasUsed = receipt.cumulativeGasUsed;
    gasUsage.claimERC721_wallet1000 = gasUsage?.claimERC721_wallet1000 ? gasUsage.claimERC721_wallet1000.add(gasUsed) : gasUsed;
  }
  gasUsage.claimERC721String_wallet1000 = gasUsage.claimERC721_wallet1000.toString();
  expect(await e721.ownerOf(999)).to.equal(addrAll[999].address);
});

/**
 * 
 * BATCH MINT ERC1155
 * 
 */

it("Should batch mint 10 NFT from ERC1155", async function () {
  let numbersArray = Array.from(Array(10).keys());
  let onesArray = Array.from({length: 10}, (_, index) => 1);

  let tx = await e11.connect(addr1).mintBatch(numbersArray, onesArray, []);
  let receipt = await tx.wait();
  const gasUsed = receipt.cumulativeGasUsed;
  gasUsage.claimERC1155_batch10 = gasUsage?.claimERC1155_batch10 ? gasUsage.claimERC1155_batch10.add(gasUsed) : gasUsed;
  
  gasUsage.claimERC1155String_batch10 = gasUsage.claimERC1155_batch10.toString();
  expect(await e11.balanceOf(addr1.address,9)).to.equal(1);
});

it("Should batch mint 100 NFT from ERC1155", async function () {
  let numbersArray = Array.from(Array(100).keys());
  let onesArray = Array.from({length: 100}, (_, index) => 1);

  let tx = await e11.connect(addr1).mintBatch(numbersArray, onesArray, []);
  let receipt = await tx.wait();
  const gasUsed = receipt.cumulativeGasUsed;
  gasUsage.claimERC1155_batch100 = gasUsage?.claimERC1155_batch100 ? gasUsage.claimERC1155_batch100.add(gasUsed) : gasUsed;
  
  gasUsage.claimERC1155String_batch100 = gasUsage.claimERC1155_batch100.toString();
  expect(await e11.balanceOf(addr1.address,99)).to.equal(1);
});

it("Should batch mint 1000 NFT from ERC1155", async function () {
  let numbersArray = Array.from(Array(1000).keys());
  let onesArray = Array.from({length: 1000}, (_, index) => 1);

  let tx = await e11.connect(addr1).mintBatch(numbersArray, onesArray, []);
  let receipt = await tx.wait();
  const gasUsed = receipt.cumulativeGasUsed;
  gasUsage.claimERC1155_batch1000 = gasUsage?.claimERC1155_batch1000 ? gasUsage.claimERC1155_batch1000.add(gasUsed) : gasUsed;
  
  gasUsage.claimERC1155String_batch1000 = gasUsage.claimERC1155_batch1000.toString();
  expect(await e11.balanceOf(addr1.address,99)).to.equal(1);
});

// it("Should batch mint 7777 NFT from ERC1155", async function () {
//   let numbersArray = Array.from(Array(7777).keys());
//   let onesArray = Array.from({length: 7777}, (_, index) => 1);

//   let tx = await e11.connect(addr1).mintBatch(numbersArray, onesArray, []);
//   let receipt = await tx.wait();
//   const gasUsed = receipt.cumulativeGasUsed;
//   gasUsage.claimERC1155_batch7777 = gasUsage?.claimERC1155_batch7777 ? gasUsage.claimERC1155_batch7777.add(gasUsed) : gasUsed;
  
//   gasUsage.claimERC1155String_batch7777 = gasUsage.claimERC1155_batch7777.toString();
//   expect(await e11.balanceOf(addr1.address,99)).to.equal(1);
// });

/**
 * 
 * LOOP MINT ERC1155
 * 
 */

 it("Should LOOP mint 10 NFT from ERC1155", async function () {

  for(let i = 0; i<10; ++i){
    let tx = await e11.connect(addr1).mint([]);
    let receipt = await tx.wait();
    const gasUsed = receipt.cumulativeGasUsed;
    gasUsage.claimERC1155_loop = gasUsage?.claimERC1155_loop ? gasUsage.claimERC1155_loop.add(gasUsed) : gasUsed;
  }
  gasUsage.claimERC1155String_loop = gasUsage.claimERC1155_loop.toString();
  expect(await e11.balanceOf(addr1.address,9)).to.equal(1);
});

it("Should LOOP mint 100 NFT from ERC1155", async function () {

  for(let i = 0; i<100; ++i){
    let tx = await e11.connect(addr1).mint([]);
    let receipt = await tx.wait();
    const gasUsed = receipt.cumulativeGasUsed;
    gasUsage.claimERC1155_loop100 = gasUsage?.claimERC1155_loop100 ? gasUsage.claimERC1155_loop100.add(gasUsed) : gasUsed;
  }
  gasUsage.claimERC1155String_loop100 = gasUsage.claimERC1155_loop100.toString();
  expect(await e11.balanceOf(addr1.address,99)).to.equal(1);
});

it("Should LOOP mint 1000 NFT from ERC1155", async function () {

  for(let i = 0; i<1000; ++i){
    let tx = await e11.connect(addr1).mint([]);
    let receipt = await tx.wait();
    const gasUsed = receipt.cumulativeGasUsed;
    gasUsage.claimERC1155_loop1000 = gasUsage?.claimERC1155_loop1000 ? gasUsage.claimERC1155_loop1000.add(gasUsed) : gasUsed;
  }
  gasUsage.claimERC1155String_loop1000 = gasUsage.claimERC1155_loop1000.toString();
  expect(await e11.balanceOf(addr1.address,99)).to.equal(1);
});

/**
 * 
 * LOOP MINT WITH DIFFERENT ACCOUNTS ERC1155
 * 
 */

 it("Should LOOP mint with different accounts 10 NFT from ERC1155", async function () {

  for(let i = 0; i<10; ++i){
    let tx = await e11.connect(addrAll[i]).mint([]);
    let receipt = await tx.wait();
    const gasUsed = receipt.cumulativeGasUsed;
    gasUsage.claimERC1155_loopWallet = gasUsage?.claimERC1155_loopWallet ? gasUsage.claimERC1155_loopWallet.add(gasUsed) : gasUsed;
  }
  gasUsage.claimERC1155String_loopWallet = gasUsage.claimERC1155_loopWallet.toString();
  expect(await e11.balanceOf(addrAll[9].address,9)).to.equal(1);
});

it("Should LOOP mint  100 NFT with different accounts from ERC1155", async function () {

  for(let i = 0; i<100; ++i){
    let tx = await e11.connect(addrAll[i]).mint([]);
    let receipt = await tx.wait();
    const gasUsed = receipt.cumulativeGasUsed;
    gasUsage.claimERC1155_loopWallet100 = gasUsage?.claimERC1155_loopWallet100 ? gasUsage.claimERC1155_loopWallet100.add(gasUsed) : gasUsed;
  }
  gasUsage.claimERC1155String_loopWallet100 = gasUsage.claimERC1155_loopWallet100.toString();
  expect(await e11.balanceOf(addrAll[99].address,99)).to.equal(1);
});

it("Should LOOP mint 1000 NFT with different accounts from ERC1155", async function () {

  for(let i = 0; i<1000; ++i){
    let tx = await e11.connect(addrAll[i]).mint([]);
    let receipt = await tx.wait();
    const gasUsed = receipt.cumulativeGasUsed;
    gasUsage.claimERC1155_loopWallet1000 = gasUsage?.claimERC1155_loopWallet1000 ? gasUsage.claimERC1155_loopWallet1000.add(gasUsed) : gasUsed;
  }
  gasUsage.claimERC1155String_loopWallet1000 = gasUsage.claimERC1155_loopWallet1000.toString();
  expect(await e11.balanceOf(addrAll[999].address,999)).to.equal(1);
});




  it("", async function(){
    gasUsage.difference = gasUsage.claimERC721_wallet1000.sub(gasUsage.claimERC1155_loopWallet1000);
    gasUsage.difference = gasUsage.difference.toString();
    delete gasUsage.claimERC721;
    delete gasUsage.claimERC721_100;
    delete gasUsage.claimERC721_1000;
    // delete gasUsage.claimERC721_7777; // To be able to test this big loops, need to increase timeout and gas hardhat config
    delete gasUsage.claimERC721_wallet;
    delete gasUsage.claimERC721_wallet100;
    delete gasUsage.claimERC721_wallet1000;
    
    delete gasUsage.claimERC1155_batch10;
    delete gasUsage.claimERC1155_batch100;
    delete gasUsage.claimERC1155_batch1000;
    // delete gasUsage.claimERC1155_batch7777; // To be able to test this big loops, need to increase timeout and gas hardhat config
    delete gasUsage.claimERC1155_loop;
    delete gasUsage.claimERC1155_loop100;
    delete gasUsage.claimERC1155_loop1000;

    delete gasUsage.claimERC1155_loopWallet;
    delete gasUsage.claimERC1155_loopWallet100;
    delete gasUsage.claimERC1155_loopWallet1000;
    console.table(gasUsage);
  })
});
