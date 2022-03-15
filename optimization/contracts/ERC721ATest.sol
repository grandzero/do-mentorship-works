// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./ERC721A.sol";

contract ERC721ATest is ERC721A {
    constructor() ERC721A("ERC721Test", "ET721") {}
   
    function claim() public {
        _safeMint(msg.sender, 1);
    }

}