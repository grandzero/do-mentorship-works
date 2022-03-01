const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CryptoFund", function () {
    let owner,addr1,addr2,addr3,addrAll;
  beforeEach(async function(){
    const CryptoFund = await ethers.getContractFactory("CryptoFund");
    const cf = await CryptoFund.deploy();
    [owner,addr1,addr2,addr3,addrAll] = await ethers.getSigners();
    await cf.deployed();
  })

  it("Should register as startup owner", async function(){
    
  });
  
  it("Should let startup enter request amount", async function(){

  });

  it("Should owner set the end date and start the funding process", async function(){

  });

  it("Should register as investor by accepting payment", async function(){

  });

  it("Should give investore vote right as much as his investment", async function(){

  });

  it("Should let investor invest to startup", async function(){

  });

  it("Should let owner finalize the winner", async function(){
    // If any of the projects can't get fund enough, every investment should return to owners
  });

  it("Should transfer balance to winner and update investors claim balance", async function(){

  });

  it("Should investors should be able to claim all non-used funds", async function(){

  });



});
