// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./lib/ERC721A.sol";

contract ERC721Test is ERC721A {
    constructor() ERC721("ERC721Test", "ET721") {}
   
    function claim() public {
        _safeMint(msg.sender, 1);
    }

}