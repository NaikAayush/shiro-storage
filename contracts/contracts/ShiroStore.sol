// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract ShiroStore {
    event NewFile(address owner, string cid, uint256 timestamp, uint256 validity);
    event DeleteFile(address owner, string cid, uint256 timestamp);
    event ExtendLife(address owner, string cid, uint256 timestamp, uint256 extendBy);
}
