//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "solidity-linked-list/contracts/StructuredLinkedList.sol";
import "./lib/EnumerableMap.sol";

contract CryptoFund {
    struct Investor {
        uint256 totalFund;
        uint256 voteLeft;
        uint256[] investmentId;
        address user;
    }
    enum State {
        Pending,
        Active,
        Completed,
        Paused
    }
    State private activeState;
    using StructuredLinkedList for StructuredLinkedList.List;
    using EnumerableMap for EnumerableMap.AddressToUintMap;
    StructuredLinkedList.List private investmentsList;
    EnumerableMap.AddressToUintMap private startups;
    Investor[] private investors;
    address public owner;
    uint256 public endDate;

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
        startups.set(msg.sender, proposalAmount);
    }

    /**
     * @dev returns proposal owner and amount
     * @param index uint256, index in the list
     * @return address, uint256 returns address of startup and required amount
     */
    function getProposalAt(uint256 index)
        external
        view
        returns (address, uint256)
    {
        return startups.at(index);
    }

    /**
     * @dev function returns required amount for spesific startup
     * @param  startup address of selected startup
     * @return uint256 value of required amount
     */
    function getAmountOfProposal(address startup)
        external
        view
        returns (uint256)
    {
        (bool success, uint256 amount) = startups.tryGet(startup);
        require(success, "Could not find startup");
        return amount;
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
        uint256[] memory empty;
        investors.push(Investor(msg.value, msg.value, empty, msg.sender));
    }

    /**
     * @dev sets the endtime for funding round
     * @param _endTime endtime of funding
     */
    function setEndTime(uint256 _endTime) external onlyOwner {
        require(
            _endTime > block.timestamp + 15,
            "End time should be bigger then 15 second of current"
        );
        endDate = _endTime;
    }

    receive() external payable {}
}
