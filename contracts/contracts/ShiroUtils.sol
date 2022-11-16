// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

function memcmp(bytes memory a, bytes memory b) pure returns (bool) {
    return (a.length == b.length) && (keccak256(a) == keccak256(b));
}

function strcmp(string memory a, string memory b) pure returns (bool) {
    return memcmp(bytes(a), bytes(b));
}

function uint2str(uint256 _i) pure returns (string memory _uintAsString) {
    if (_i == 0) {
        return "0";
    }
    uint256 j = _i;
    uint256 len;
    while (j != 0) {
        len++;
        j /= 10;
    }
    bytes memory bstr = new bytes(len);
    uint256 k = len;
    while (_i != 0) {
        k = k - 1;
        uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
        bytes1 b1 = bytes1(temp);
        bstr[k] = b1;
        _i /= 10;
    }
    return string(bstr);
}

function char(bytes1 b) pure returns (bytes1 c) {
    if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
    else return bytes1(uint8(b) + 0x57);
}

function toAsciiString(address x) pure returns (string memory) {
    bytes memory s = new bytes(40);
    for (uint256 i = 0; i < 20; i++) {
        bytes1 b = bytes1(uint8(uint256(uint160(x)) / (2**(8 * (19 - i)))));
        bytes1 hi = bytes1(uint8(b) / 16);
        bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
        s[2 * i] = char(hi);
        s[2 * i + 1] = char(lo);
    }
    return string(s);
}
