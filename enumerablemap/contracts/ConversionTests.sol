//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract ConversionTest {
    struct A {
        uint256 b;
        uint256 c;
    }

    A[] public values;
    mapping(bytes32 => uint256) map;

    function callTest() external view returns (uint256) {
        return map["HelloWorld"];
    }

    function getIntToBytes(uint256 test) external pure returns (bytes32) {
        return bytes32(test);
    }

    function getAddrToInt(address test) external pure returns (bytes32) {
        //bytes32(uint256(uint160(value)))
        return bytes32(uint256(uint160(test)));
    }

    function abiEncode(address test) external pure returns (bytes32) {
        //bytes32(uint256(uint160(value)))
        return bytes32(uint256(uint160(test)));
    }

    function bytesToAddr(bytes32 addr) external pure returns (address) {
        return address(uint160(uint256(addr)));
    }
}
