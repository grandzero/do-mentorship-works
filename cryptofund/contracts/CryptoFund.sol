//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "solidity-linked-list/contracts/StructuredLinkedList.sol";

contract CryptoFund {
    using StructuredLinkedList for StructuredLinkedList.List;
    address public owner;

    struct Investor {
        uint256 totalFund;
        StructuredLinkedList.List investmentsList;
    }

    constructor() {
        owner = msg.sender;
    }
}
