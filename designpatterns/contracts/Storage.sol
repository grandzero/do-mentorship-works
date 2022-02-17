//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Storage {
    mapping(address => uint256) private _balances;
    address private _owner;
    address private admin;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == _owner, "You are not owner");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "You are not admin");
        _;
    }

    function setOwner(address _newOwner) external onlyAdmin {
        _owner = _newOwner;
    }

    function setBalance(address _to, uint256 _amount) external onlyOwner {
        require(_to != address(0));
        _balances[_to] = _amount;
    }

    function getBalance(address _user)
        external
        view
        onlyOwner
        returns (uint256)
    {
        return _balances[_user];
    }
}
