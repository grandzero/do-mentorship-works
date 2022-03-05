// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./lib/ERC721A.sol";

contract ERC721Test is ERC721A {
    uint256 public tokenCounter;
    constructor() ERC721("ERC721Test", "ET721") {}
    
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }

    function claim() public {
        _safeMint(msg.sender, tokenCounter++);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }
}