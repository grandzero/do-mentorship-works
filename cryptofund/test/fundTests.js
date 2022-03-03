const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CryptoFund", function () {
    let owner,addr1,addr2,addr3,addrAll;
    let cf;
    let gasUsage = {};

    let successCallback = async(fc, args, options, saveGas, addr) => {
      let tx;
      let sender = addr ?? owner;
      let connectedContract = await cf.connect(sender);
      if(args){
        tx = options ? await connectedContract[fc](...args, options) : await connectedContract[fc](...args) 
      }
      else{
        tx = options ? await connectedContract[fc](options) : await connectedContract[fc]() 
      }
      //tx = args ? options ?  await cf.connect(sender).contractFunction(...args,options) : await cf.connect(sender).contractFunction(...args) : options ? await cf.connect(sender).contractFunction(options) : await cf.connect(sender).contractFunction();
      let receipt = await tx.wait();
      if(saveGas){
        const gasUsed = receipt.cumulativeGasUsed.toString();
        gasUsage[fc] = gasUsed;
      }
      return receipt;
    };

    let failCallback = async(fc,args, options,addr) => {
      let sender = addr?? owner;
      let connectedContract = await cf.connect(sender);
      if(args){
       return options ? await connectedContract[fc](...args, options) : await connectedContract[fc](...args) 
      }
      else{
       return  options ? await connectedContract[fc](options) : await connectedContract[fc]() 
      }
    }

  beforeEach(async function(){
    const CryptoFund = await ethers.getContractFactory("CryptoFund");
    cf = await CryptoFund.deploy();
    [owner,addr1,addr2,addr3,...addrAll] = await ethers.getSigners();
    await cf.deployed();
  })

  it("Should register as startup owner", async function(){
      let tx = await cf.connect(addr1).registerStartup(1000);
      let receipt = await tx.wait();
      const gasUsed = receipt.cumulativeGasUsed.toString();
      gasUsage.registerStartup = gasUsed;
      let amount = await cf.getAmountOfProposal(addr1.address);
      expect(amount).to.equal(1000);
  });
  

  it("Should owner set the end date and start the funding process", async function(){
      let tx = await cf.setEndTime(60*5) // 5 minutes
      let receipt = await tx.wait();
      const gasUsed = receipt.cumulativeGasUsed.toString();
      gasUsage.setEndTime = gasUsed;
      let endTime = await cf.endDate();

      const blockNumBefore = await ethers.provider.getBlockNumber();
      const blockBefore = await ethers.provider.getBlock(blockNumBefore);
      const timestampBefore = blockBefore.timestamp;  
      
      
      expect(endTime).to.be.equal(timestampBefore+60*5);
  });

  it("Should't let user register as investor with 0", async function(){
      await expect(failCallback("registerUser", null, {value: ethers.utils.parseEther("0")}, addr1)).to.be.revertedWith("You need to send at least 1 wei to register as investor");
  });
  
  it("Should register as investor by accepting payment", async function(){
      await successCallback("registerUser",null,{value:10000},true,addr1);
      let investorDetails = await cf.connect(addr1).investors(addr1.address);
      expect(investorDetails.totalRegisterAmount).to.equal(10000);
  });

  it("Should give investor vote right as much as his investment", async function(){
      await successCallback("registerStartup",[1000],null,false,addr1); // Register startup with 1 address
      await successCallback("setEndTime",[60*15],null,false); // Set end time for 5 minutes later
      await successCallback("registerUser",null,{value:10000},false,addr2); // Register with 1 investor
      await successCallback("investWithAddress", [addr1.address,10000],null,true,addr2) // addr2 invests all his money
      let investmentOfaddr2 = await cf.connect(addr2).getUsersSelectedInvestment(0);
      await expect(investmentOfaddr2[0] === addr1.address && investmentOfaddr2[1].toString() === "10000").to.equal(true);
  });

  it("Should't give investor vote right more then his investment", async function(){
    await successCallback("registerStartup",[1000],null,false,addr1); // Register startup with 1 address
    await successCallback("setEndTime",[60*15],null,false); // Set end time for 5 minutes later
    await successCallback("registerUser",null,{value:10000},false,addr2); // Register with 1 investor
    await expect(failCallback("investWithAddress", [addr1.address,1000001],null,addr2)).to.be.revertedWith("Insufficient balance");
  });

  it(`Should make
      -Four investors be able to invest in two startups
      -Make one winner`, 
    async function(){
    // Register 2 startup 1000 / 5000
    await successCallback("registerStartup",[1000],null,false,addr1); // Register startup with address1
    await successCallback("registerStartup",[5000],null,false,addr2); // Register startup with address2
    // Register 4 investor 10000 / 10000 / 10000 / 10000
    for(let i = 0; i<4; ++i){
      await successCallback("registerUser",null,{value:10000},false,addrAll[i]); // Register investor
    }
    // Set State Active
    await successCallback("setEndTime",[60*15],null,false); // Set end time for 5 minutes later
    // Invest Investor1 => 500 => Startup1
    await successCallback("investWithAddress", [addr1.address,500],null,false,addrAll[0]);
    // Invest Investor1 => 1000 => Startup2
    await successCallback("investWithAddress", [addr2.address,1000],null,false,addrAll[0]);

    // Invest Investor2 => 200 => Startup1
    await successCallback("investWithAddress", [addr1.address,200],null,false,addrAll[1]);
    // Invest Investor2 => 1500 => Startup2
    await successCallback("investWithAddress", [addr2.address,1500],null,false,addrAll[1]);

    // Invest Investor3 => 200 => Startup1
    await successCallback("investWithAddress", [addr1.address,200],null,false,addrAll[2]);
    // Invest Investor3 => 1500 => Startup2
    await successCallback("investWithAddress", [addr2.address,1500],null,false,addrAll[2]);


    // Invest Investor4 => 50 => Startup1
    await successCallback("investWithAddress", [addr1.address,50],null,false,addrAll[3]);
    // Invest Investor4 => 5000 => Startup2
    await successCallback("investWithAddress", [addr2.address,5000],null,false,addrAll[3]);

    // Winner will be Startup2
    let winnerAddress = await cf.winner();
    // Winner startup will have 9000 fund
    let winnerStartupDetails = await cf.startups(winnerAddress);
    // Second startup will have 950 fund total
    let secondStartupDetails = await cf.startups(addr1.address);

    let condition = 
    winnerAddress === addr2.address && 
    winnerStartupDetails.totalFunded.toString() === "9000" &&
    winnerStartupDetails.requestedAmount.toString() === "5000" &&
    secondStartupDetails.requestedAmount.toString() === "1000" &&
    secondStartupDetails.totalFunded.toString() === "950";

    expect(condition).to.equal(true);

  });

  it("Should let owner finalize the winner", async function(){
    // If any of the projects can't get fund enough, every investment should return to owners
  });

  it("Should transfer balance to winner and update investors claim balance", async function(){

  });

  it("Should investors should be able to claim all non-used funds", async function(){

  });

  it("Should't investors claim funds twice", async function(){

  });

  it("Compare all gas usages", function(){
    console.table(gasUsage);
  });

});
