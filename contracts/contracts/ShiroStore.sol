// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

struct File {
    bool valid;
    bool deleted;
    string cid;
    uint256 timestamp;
    uint256 validity;
}

interface IShiroStore {
    function putFile(
        string memory cid,
        uint256 validity
    ) external payable;

    function getFiles() external view returns (File[] memory);

    function deleteFile(string memory cid) external;
}

contract ShiroStore is IShiroStore {
    event NewFile(
        address owner,
        string cid,
        uint256 timestamp,
        uint256 validity
    );
    event DeleteFile(address owner, string cid, uint256 timestamp);
    event ExtendLife(
        address owner,
        string cid,
        uint256 timestamp,
        uint256 extendBy
    );

    address[] owners;
    mapping(address => File[]) store;

    function memcmp(bytes memory a, bytes memory b)
        internal
        pure
        returns (bool)
    {
        return (a.length == b.length) && (keccak256(a) == keccak256(b));
    }

    function strcmp(string memory a, string memory b)
        internal
        pure
        returns (bool)
    {
        return memcmp(bytes(a), bytes(b));
    }

    function findFile(address owner, string memory cid)
        internal
        view
        returns (File storage)
    {
        for (uint256 i = 0; i < store[owner].length; ++i) {
            File storage file = store[owner][i];
            if (file.valid && !file.deleted && strcmp(file.cid, cid)) {
                return file;
            }
        }

        revert("File not found or is deleted.");
    }

    function findOrCreateFile(address owner, string memory cid)
        internal
        returns (File storage)
    {
        for (uint256 i = 0; i < store[owner].length; ++i) {
            File storage file = store[owner][i];
            if (file.valid && !file.deleted && strcmp(file.cid, cid)) {
                return file;
            }
        }

        if (store[owner].length == 0) {
            owners.push(owner);
        }

        return store[owner].push();
    }

    function deleteGivenFile(address owner, File storage file) internal {
        file.deleted = true;

        emit DeleteFile(owner, file.cid, block.timestamp);
    }

    function putFile(
        string memory cid,
        uint256 validity
    ) external payable {
        require(bytes(cid).length == 46, "Invalid IPFS CID length.");

        require(validity >= 3600, "Validity must be at least an hour.");

        address owner = msg.sender;

        File storage file = findOrCreateFile(owner, cid);

        // add to remaining validity if it wasn't deleted
        if (
            file.valid &&
            !file.deleted &&
            file.timestamp + file.validity >= block.timestamp
        ) {
            validity += (file.timestamp + file.validity) - block.timestamp;
        }

        file.valid = true;
        file.deleted = false;
        file.cid = cid;
        file.timestamp = block.timestamp;
        file.validity = validity;

        emit NewFile(owner, cid, block.timestamp, validity);
    }

    function getFiles() external view returns (File[] memory) {
        address owner = msg.sender;

        uint256 resultCount = 0;
        for (uint256 idx = 0; idx < store[owner].length; ++idx) {
            File storage file = store[owner][idx];
            if (file.valid && !file.deleted) {
                resultCount++;
            }
        }

        File[] memory files = new File[](resultCount);

        uint256 arrIdx = 0;
        for (uint256 idx = 0; idx < store[owner].length; ++idx) {
            File storage file = store[owner][idx];
            if (file.valid && !file.deleted) {
                files[arrIdx] = file;
                arrIdx++;
            }
        }

        return files;
    }

    function deleteFile(string memory cid) external {
        address owner = msg.sender;

        File storage file = findFile(owner, cid);

        deleteGivenFile(owner, file);
    }

    function garbageCollect() external {
        for (uint256 ownerIdx = 0; ownerIdx < owners.length; ++ownerIdx) {
            address owner = owners[ownerIdx];
            for (
                uint256 fileIdx = 0;
                fileIdx < store[owner].length;
                ++fileIdx
            ) {
                File storage file = store[owner][fileIdx];
                if (
                    file.valid &&
                    !file.deleted &&
                    file.timestamp + file.validity <= block.timestamp
                ) {
                    deleteGivenFile(owner, file);
                }
            }
        }
    }
}
