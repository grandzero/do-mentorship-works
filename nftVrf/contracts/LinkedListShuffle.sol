// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
contract LinkedListShuffle {

    struct Node{
        uint128 next;
        uint128 data;
    }
    uint128 headIndex;
    uint128 iterator;
    Node[] public list;
    
    constructor(uint128 total){
        list.push(Node(1,0));
        for(uint128 i=1; i<total; ++i){
            
            list.push(Node(i+1,i));
            
        }
    }

    function insertChain(uint128 node, uint128 afterNode) public{
        uint128 newHeadIndex = list[node].next;

        list[node].next = list[afterNode].next;

        list[afterNode].next = headIndex;

        headIndex = newHeadIndex;
        iterator = headIndex;
    }

    function traverse() external returns (Node memory){
        Node memory value = list[iterator];
        iterator = value.next;
        return value;
    }

    function shuffle() external {
        insertChain(3,6);
        insertChain(4,7);
        insertChain(2,5);
        insertChain(1,3);
    }
}
