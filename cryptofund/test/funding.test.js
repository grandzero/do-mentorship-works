const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

describe("CryptoFund Funding Tests", function () {
    let owner,addr1,addr2,addr3,addrAll;
    let cf;
    let winnerAddress,winnerStartupDetails,secondStartupDetails;
    let gasUsage = {};
    let provider;
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

  before(async function(){
    provider = waffle.provider;
    const CryptoFund = await ethers.getContractFactory("CryptoFund");
    cf = await CryptoFund.deploy();
    [owner,addr1,addr2,addr3,...addrAll] = await ethers.getSigners();
    await cf.deployed();

    // Register 2 startup 1000 / 5000
    await successCallback("registerStartup",[1000],null,false,addr1); // Register startup with address1
    await successCallback("registerStartup",[5000],null,false,addr2); // Register startup with address2
    // Register 4 investor 10000 / 10000 / 10000 / 10000
    for(let i = 0; i<4; ++i){
      await successCallback("registerUser",null,{value:10000},false,addrAll[i]); // Register investor
    }
    // Set State Active
    await successCallback("setEndTime",[60],null,false); // Set end time for 5 minutes later
    // Invest Investor1 => 500 => Startup1
    await successCallback("investWithAddress", [addr1.address,500],null,false,addrAll[0]);
    // Invest Investor1 => 1000 => Startup2
    await successCallback("investWithAddress", [addr2.address,900],null,false,addrAll[0]);

    // Invest Investor2 => 200 => Startup1
    await successCallback("investWithAddress", [addr1.address,200],null,false,addrAll[1]);
    // Invest Investor2 => 1500 => Startup2
    await successCallback("investWithAddress", [addr2.address,1500],null,false,addrAll[1]);

    // Invest Investor3 => 200 => Startup1
    await successCallback("investWithAddress", [addr1.address,200],null,false,addrAll[2]);
    // Invest Investor3 => 1500 => Startup2
    await successCallback("investWithAddress", [addr2.address,1600],null,false,addrAll[2]);


    // Invest Investor4 => 50 => Startup1
    await successCallback("investWithAddress", [addr1.address,50],null,false,addrAll[3]);
    // Invest Investor4 => 5000 => Startup2
    await successCallback("investWithAddress", [addr2.address,5000],null,false,addrAll[3]);

    // Winner will be Startup2
    winnerAddress = await cf.winner();
    // Winner startup will have 9000 fund
    winnerStartupDetails = await cf.startups(winnerAddress);
    // Second startup will have 950 fund total
    secondStartupDetails = await cf.startups(addr1.address);
  })

  it("Should test winner", async function(){
    expect(winnerAddress).to.equal(addr2.address);
    expect(winnerStartupDetails.totalFunded.toString()).to.equal("9000");
    expect(winnerStartupDetails.requestedAmount.toString()).to.equal("5000");
    expect(secondStartupDetails.requestedAmount.toString()).to.equal("1000");
    expect(secondStartupDetails.totalFunded.toString()).to.equal("950");
  });



  it("Should winner startup get it's requested fund", async function(){
        // Wait for 60 second in network
        await provider.send("evm_increaseTime", [1000*60]);
        let startupsWalletBeforeBalance = await provider.getBalance(addr2.address);
        let contractsBeforeBalance = await provider.getBalance(cf.address);
        //sent Request
        let tx = await cf.connect(addr2).claimStartupFund();
        const receipt = await tx.wait();
        const gasUsed = receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice) // Calculate total used gas
        gasUsage.claimStartupFund = receipt.cumulativeGasUsed.toString();
        
        startupsWalletBeforeBalance = startupsWalletBeforeBalance.sub(gasUsed); // Before balance payed gas so we need to sub the tx
        
        let startupsWalletAfterBalance = await provider.getBalance(addr2.address);
        let contractsAfterBalance = await provider.getBalance(cf.address);
        
        // Calculate difference between contract balance before and now
        let difference = contractsBeforeBalance.sub(contractsAfterBalance);

        // Difference should be same with the startups requested amount
        expect(difference.toString()).to.equal(winnerStartupDetails.requestedAmount.toString());

        let startupsWalletDifference = startupsWalletAfterBalance.sub(startupsWalletBeforeBalance);
        expect(startupsWalletDifference).to.equal(winnerStartupDetails.requestedAmount);
  
  });

  it("Should't winner startup get it's requested fund twice", async function(){
    await expect(failCallback("claimStartupFund", null, null, addr2)).to.be.revertedWith("You are not a valid startup");
    // If any of the projects can't get fund enough, every investment should return to owners
  });

  
  it("Should't other startups withdraw fund", async function(){
    await expect(failCallback("claimStartupFund", null, null, addr1)).to.be.revertedWith("You can't receive funds if you are not winner");
  });


  it("Should investors should be able to claim all non-used funds", async function(){
    // Investor 1 will claim fund
    let investorsWalletBeforeBalance = await provider.getBalance(addrAll[0].address);
    let tx = await cf.connect(addrAll[0]).claimInvestor();

    const receipt = await tx.wait();
    const gasUsed = receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice) // Calculate total used gas
    gasUsage.claimInvestor = receipt.cumulativeGasUsed.toString();

    // Calculation
    /**
     * Investor 1 funded 10k total
     * Invested 500 to addr1 startup
     * Invested 900 to addr2 startup
     * Winner was addr2 startup so calculation :
     * Investor will receive 10000-1400 = 8600 for unspend investment
     * Investor will receive 500 for startup-1 since it's not winner
     * Investor invested 900 to addr2 startup
     * Startup-2 funded 9000 total
     * Startup-2 requested amount is 5000
     * Investors ratio on total fund is : 900/9000 = 0.1
     * Investor will receive 900 - (5000*0.1) = 400 from winner
     * Investor 1 should receive 8600 + 500 + 400 = 9500 total
     */

     investorsWalletBeforeBalance = investorsWalletBeforeBalance.sub(gasUsed);
     let investorsWalletAfterBalance = await provider.getBalance(addrAll[0].address);

     let walletDifference = investorsWalletAfterBalance.sub(investorsWalletBeforeBalance);
    
     expect(walletDifference.toString()).to.equal("9499");
  });

  it("Should't investors claim funds twice", async function(){
    await expect(failCallback("claimInvestor",null,null,addrAll[0])).to.be.revertedWith("User is not valid")
});

// it("Should investors should be able to claim all non-used funds", async function(){
//     // Investor 1 will claim fund
//     let investorsWalletBeforeBalance = await provider.getBalance(addrAll[1].address);
//     let tx = await cf.connect(addrAll[1]).claimInvestor();

//     const receipt = await tx.wait();
//     const gasUsed = receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice) // Calculate total used gas
//     gasUsage.claimInvestor = receipt.cumulativeGasUsed.toString();

//     // Calculation
//     /**
//      * Investor 1 funded 10k total
//      * Invested 200 to addr1 startup
//      * Invested 1500 to addr2 startup
//      * Winner was addr2 startup so calculation :
//      * Investor will receive 10000-1700 = 8300 for unspend investment
//      * Investor will receive 200 for startup-1 since it's not winner
//      * Investor invested 1500 to addr2 startup
//      * Startup-2 funded 9000 total
//      * Startup-2 requested amount is 5000
//      * Investors ratio on total fund is : 1500/9000 = 0.166666
//      * Investor will receive 1500 - (5000*0.1666) = 666 from winner
//      * Investor 1 should receive 8300 + 200 + 666 = 9166 total
//      */

//      investorsWalletBeforeBalance = investorsWalletBeforeBalance.sub(gasUsed);
//      let investorsWalletAfterBalance = await provider.getBalance(addrAll[1].address);

//      let walletDifference = investorsWalletAfterBalance.sub(investorsWalletBeforeBalance);
    
//      expect(walletDifference.toString()).to.equal("9166");
//   });

//   it("Should investors should be able to claim all non-used funds", async function(){
//     // Investor 1 will claim fund
//     let investorsWalletBeforeBalance = await provider.getBalance(addrAll[2].address);
//     let tx = await cf.connect(addrAll[2]).claimInvestor();

//     const receipt = await tx.wait();
//     const gasUsed = receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice) // Calculate total used gas
//     gasUsage.claimInvestor = receipt.cumulativeGasUsed.toString();

//     // Calculation
//     /**
//      * Investor 1 funded 10k total
//      * Invested 200 to addr1 startup
//      * Invested 1600 to addr2 startup
//      * Winner was addr2 startup so calculation :
//      * Investor will receive 10000-1800 = 8200 for unspend investment
//      * Investor will receive 200 for startup-1 since it's not winner
//      * Investor invested 1600 to addr2 startup
//      * Startup-2 funded 9000 total
//      * Startup-2 requested amount is 5000
//      * Investors ratio on total fund is : 1600/9000 = 0.1777
//      * Investor will receive 1600 - (5000*0.1777) = 711 from winner
//      * Investor 1 should receive 8200 + 200 + 711 = 9111 total
//      */

//      investorsWalletBeforeBalance = investorsWalletBeforeBalance.sub(gasUsed);
//      let investorsWalletAfterBalance = await provider.getBalance(addrAll[2].address);

//      let walletDifference = investorsWalletAfterBalance.sub(investorsWalletBeforeBalance);
  
//      expect(walletDifference.toString()).to.equal("9111");
//   });



  it("Should all investors claim funds", async function(){
        for(let i = 1; i<=3; ++i){
            await successCallback("claimInvestor",null,null,false,addrAll[i]);
        }
       let contractsBalance = await provider.getBalance(cf.address);
       expect(contractsBalance.toString()).to.equal("2");
  });

 
  it("Compare all gas usages", function(){
    console.table(gasUsage);
  });

});
