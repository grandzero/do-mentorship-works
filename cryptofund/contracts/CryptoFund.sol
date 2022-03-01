//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "solidity-linked-list/contracts/StructuredLinkedList.sol";
import "./lib/EnumerableMap.sol";

contract CryptoFund {
    struct Investor {
        uint256 totalFund;
        StructuredLinkedList.List investmentsList;
    }
    using StructuredLinkedList for StructuredLinkedList.List;
    using EnumerableMap for EnumerableMap.AddressToUintMap;

    EnumerableMap.AddressToUintMap private startups;
    Investor[] private investors;
    address public owner;

    constructor() {
        owner = msg.sender;
    }
}
