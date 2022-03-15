//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./lib/EnumerableMap.sol";

contract CryptoFund {
    using EnumerableMap for EnumerableMap.AddressToUintMap;
    enum State {
        Pending,
        Active,
        Completed,
        Paused
    }
    struct Startup {
        uint256 requestedAmount;
        uint256 totalFunded;
    }
    struct Investor {
        uint256 totalRegisterAmount;
        uint256 voteRightLeft;
    }
    uint256 public endDate;
    uint256 public winnerRequestedAmount;
    State private activeState;
    mapping(address => Startup) public startups;
    address public owner;
    address public winner;
    mapping(address => Investor) public investors;
    mapping(address => EnumerableMap.AddressToUintMap) usersInvestments; // User's investment amount on T;

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev permitting only owner to do certain operations
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this operation");
        _;
    }

    /**
     * @dev for operations which require state is active
     */
    modifier isActive() {
        require(activeState == State.Active, "Funding is not active yet");
        require(endDate > block.timestamp, "End date passed");
        _;
    }

    /**
     * @dev for operations which require state is not paused
     */
    modifier whenNotPaused() {
        require(activeState != State.Paused, "Funding is paused");
        _;
    }

    /**
     * @dev This function is helping startups to
     * register their fund request to smart contract
     * @param proposalAmount uint256 required amount to proposal complete
     */
    function registerStartup(uint256 proposalAmount) external {
        require(proposalAmount > 0, "Minimum amount can't be 0");
        require(activeState == State.Pending, "Acceptance completed");
        // Startup memory newRegister = Startup(proposalAmount, 0);
        startups[msg.sender] = Startup(proposalAmount, 0);
    }

    /**
     * @dev function returns required amount for spesific startup
     * @param  _startup address of selected startup
     * @return uint256 value of required amount
     */
    function getAmountOfProposal(address _startup)
        external
        view
        returns (uint256)
    {
        require(isValidStartup(_startup), "Startup address is not valid");

        return startups[_startup].requestedAmount;
    }

    /**
     * @notice Users need to send at least 1 wei to be able to register
     * @dev this function is payable and let users register as investors
     */
    function registerUser() external payable whenNotPaused {
        require(
            msg.value > 0,
            "You need to send at least 1 wei to register as investor"
        );
        investors[msg.sender].totalRegisterAmount += msg.value;
        investors[msg.sender].voteRightLeft += msg.value;
    }

    /**
     * @notice Funding automatically becomes active when enddate imported
     * @dev sets the endtime for funding round
     * @param _endTime endtime of funding
     */
    function setEndTime(uint256 _endTime) external onlyOwner {
        require(
            _endTime > 15,
            "End time should be bigger then 15 second of current"
        );
        endDate = block.timestamp + _endTime;
        activeState = State.Active;
    }

    /**
     * @dev sets the active state
     * @param _st is desired state
     */
    function setActiveState(State _st) public onlyOwner {
        activeState = _st;
    }

    /**
     * @dev Returns user's investment at selected address
     * @param index given index number
     * @return address, uint256 address of startup, amount invested to that startup
     */
    function getUsersSelectedInvestment(uint256 index)
        public
        view
        returns (address, uint256)
    {
        // EnumerableMap.AddressToUintMap storage invesments = usersInvestments[
        //     msg.sender
        // ];
        return usersInvestments[msg.sender].at(index);
    }

    /**
     * @dev Only registered investors can invest
     * Status should be active
     * Investor should have enough fund
     * @param _startup address of startup
     * @param _amount desired amount of investment
     */
    function investWithAddress(address _startup, uint256 _amount)
        external
        isActive
    {
        // This line checks two requirement
        // Only investors will have voteLeft bigger then 1
        // Check if investor enough fund
        require(isValidStartup(_startup), "Startup is not valid");
        require(
            _amount <= investors[msg.sender].voteRightLeft,
            "Insufficient balance"
        );
        investors[msg.sender].voteRightLeft -= _amount;
        EnumerableMap.AddressToUintMap storage invesments = usersInvestments[
            msg.sender
        ];
        (bool success, uint256 investedAmount) = invesments.tryGet(_startup);
        // Unchecked kullan taşma koşulları, gas avantajı sağlar
        invesments.set(_startup, investedAmount + _amount);
        startups[_startup].totalFunded += _amount;
        if (
            winner == address(0) &&
            startups[_startup].totalFunded >= startups[_startup].requestedAmount
        ) {
            // Save first winner
            winner = _startup;
            winnerRequestedAmount = startups[_startup].requestedAmount;
        }
    }

    /**
     * @dev This internal function checks is given startup is valid
     * @param _startup address to be checked
     * @return return if valid, return true else false
     */
    function isValidStartup(address _startup) internal view returns (bool) {
        if (_startup == address(0) || startups[msg.sender].requestedAmount > 0)
            return false;
        return true;
    }

    /**
     * @dev winner can get requested amount, this function can be called if
     * Time completed
     * Sender is winner
     * Winner did't withdraw fund already
     */
    function claimStartupFund() external payable {
        require(block.timestamp > endDate, "Funding is not completed");
        require(
            msg.sender == winner,
            "You can't receive funds if you are not winner"
        );
        require(
            startups[msg.sender].requestedAmount > 0,
            "You are not a valid startup"
        );
        uint256 price = startups[msg.sender].requestedAmount;
        startups[msg.sender].requestedAmount = 0;
        payable(winner).transfer(price);
    }

    /**
     * @dev This function can be called if
     * Investor is valid
     * Investor has funds on startups
     * Investor didn't withraw already
     */
    function claimInvestor() external payable {
        require(
            investors[msg.sender].totalRegisterAmount > 0,
            "User is not valid"
        );
        EnumerableMap.AddressToUintMap
            storage sendersInvestments = usersInvestments[msg.sender];

        require(block.timestamp > endDate, "Funding is not completed");
        uint256 withdrawAmount;
        withdrawAmount += investors[msg.sender].voteRightLeft;

        // No need to run a loop
        // We need to calculate only winners ratio and we can return all invested amount
        for (uint256 i; i < sendersInvestments.length(); i++) {
            (address startup, uint256 investedAmount) = sendersInvestments.at(
                i
            );
            if (startup != winner) {
                withdrawAmount += investedAmount;
            } else {
                uint256 allAmount = startups[winner].totalFunded;

                withdrawAmount +=
                    investedAmount -
                    ((winnerRequestedAmount * investedAmount) / allAmount);
            }
        }
        investors[msg.sender].totalRegisterAmount = 0;
        investors[msg.sender].voteRightLeft = 0;
        payable(msg.sender).transfer(withdrawAmount - 1);
    }
}
