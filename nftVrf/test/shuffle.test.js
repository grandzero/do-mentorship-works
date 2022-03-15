const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

describe("Stress tests on different NFT proposals", function () {
  let owner,addr1,addr2,addr3,addrAll;
  let lls;
  let gasUsage = {};
  let LinkedListShuffle;
  let provider;





  beforeEach(async ()=>{
    provider = waffle.provider;
    [owner,addr1,addr2,addr3,...addrAll] = await ethers.getSigners();
    LinkedListShuffle = await ethers.getContractFactory("LinkedListShuffle");
    

  })

  it("Should shuffle 100 and see gas change", async function () {
      lls = await LinkedListShuffle.deploy(100);
      await lls.deployed();

      let tx = await lls.shuffle();
      let receipt = await tx.wait();
      const gasUsed = receipt.cumulativeGasUsed;
      gasUsage.shuffle100_4_times = gasUsed.toString();
   
    //gasUsage.claimERC721String = gasUsage.claimERC721.toString();
    //expect(await e721.ownerOf(1)).to.equal(addr1.address);
});

it("Should shuffle 1000 and see gas change", async function () {
  lls = await LinkedListShuffle.deploy(1000);
  await lls.deployed();
  
  let tx = await lls.shuffle();
  let receipt = await tx.wait();
  const gasUsed = receipt.cumulativeGasUsed;
  gasUsage.shuffle1000_4_times = gasUsed.toString();

//gasUsage.claimERC721String = gasUsage.claimERC721.toString();
//expect(await e721.ownerOf(1)).to.equal(addr1.address);
});
  
 



  it("", async function(){

    console.table(gasUsage);
  })
});