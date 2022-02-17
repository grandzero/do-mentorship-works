//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "./Storage.sol";

contract Owner {
    Storage public _storage;

    function setStorage(address storageAddr) external {
        _storage = Storage(storageAddr);
    }

    function buyX(uint256 _amount) external {
        _storage.setBalance(msg.sender, _amount);
    }

    function getBalance() external view returns (uint256) {
        return _storage.getBalance(msg.sender);
    }
}
