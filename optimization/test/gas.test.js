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

  it("", async function(){
    delete gasUsage.claimERC721;
    delete gasUsage.claimERC721_100;
    delete gasUsage.claimERC721_1000;
    delete gasUsage.claimERC1155_batch10;
    console.table(gasUsage);
  })
});
