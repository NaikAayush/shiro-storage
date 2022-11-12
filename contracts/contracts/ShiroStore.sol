// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./ShiroUtils.sol" as ShiroUtils;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

struct File {
    bool valid;
    bool deleted;
    string cid;
    string provider;
    uint256 timestamp;
    uint256 validity;
}

interface IShiroStore {
    function putFile(
        string memory cid,
        uint256 validity,
        string memory provider
    ) external payable;

    function getFiles() external view returns (File[] memory);

    function deleteFile(string memory cid) external;
}

contract ShiroStore is IShiroStore, AutomationCompatibleInterface {
    event NewFile(
        address owner,
        string cid,
        string provider,
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

    function findFile(address owner, string memory cid)
        internal
        view
        returns (File storage)
    {
        for (uint256 i = 0; i < store[owner].length; ++i) {
            File storage file = store[owner][i];
            if (
                file.valid && !file.deleted && ShiroUtils.strcmp(file.cid, cid)
            ) {
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
            if (
                file.valid && !file.deleted && ShiroUtils.strcmp(file.cid, cid)
            ) {
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

    function validateStorageProvider(string memory provider) internal pure {
        if (ShiroUtils.strcmp(provider, "ipfs")) {} else if (
            ShiroUtils.strcmp(provider, "web3.storage")
        ) {} else if (ShiroUtils.strcmp(provider, "nft.storage")) {} else if (
            ShiroUtils.strcmp(provider, "pinata")
        ) {} else if (ShiroUtils.strcmp(provider, "storj")) {} else if (
            ShiroUtils.strcmp(provider, "estuary")
        ) {} else {
            revert(string.concat("invalid storage provider: ", provider));
        }
    }

    function putFile(
        string memory cid,
        uint256 validity,
        string memory provider
    ) external payable {
        require(bytes(cid).length == 46, "Invalid IPFS CID length.");

        require(validity >= 3600, "Validity must be at least an hour.");

        validateStorageProvider(provider);

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
        file.provider = provider;
        file.timestamp = block.timestamp;
        file.validity = validity;

        emit NewFile(owner, cid, provider, block.timestamp, validity);
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

    // === Chainlink automation ===
    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory performData
        )
    {
        upkeepNeeded = false;
        performData = new bytes(0);

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
                    upkeepNeeded = true;
                }
            }
        }
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        this.garbageCollect();
    }
    // === -------------------- ===
}
