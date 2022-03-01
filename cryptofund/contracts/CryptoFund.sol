//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract CryptoFund {
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
    uint256 public endDate;
    State private activeState;
    mapping(address => Startup) startups;
    address public owner;
    address public winner;
    mapping(address => uint256) voteRightLeft;
    mapping(address => mapping(address => uint256)) usersInvestments; // User's investment amount on T;

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
        Startup memory newRegister = Startup(proposalAmount, 0);
        startups[msg.sender] = newRegister;
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
        voteRightLeft[msg.sender] = msg.value;
    }

    /**
     * @notice Funding automatically becomes active when enddate imported
     * @dev sets the endtime for funding round
     * @param _endTime endtime of funding
     */
    function setEndTime(uint256 _endTime) external onlyOwner {
        require(
            _endTime > block.timestamp + 15,
            "End time should be bigger then 15 second of current"
        );
        endDate = _endTime;
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
        require(_amount <= voteRightLeft[msg.sender], "Insufficient balance");
        voteRightLeft[msg.sender] -= _amount;
        usersInvestments[msg.sender][_startup] += _amount;
        startups[_startup].totalFunded += _amount;
        if (
            winner == address(0) &&
            startups[_startup].totalFunded >= startups[_startup].requestedAmount
        ) {
            // Save first winner
            winner = _startup;
        }
    }

    function isValidStartup(address _startup) internal view returns (bool) {
        if (_startup == address(0) || startups[msg.sender].requestedAmount > 0)
            return false;
        return true;
    }

    receive() external payable {}
}
