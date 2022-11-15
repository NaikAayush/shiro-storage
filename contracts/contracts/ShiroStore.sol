// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./ShiroUtils.sol" as ShiroUtils;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

import "./vendor/JsmnSolLib.sol";

struct File {
    bool valid;
    bool deleted;
    bool rejected;
    string cid;
    string provider;
    uint256 timestamp;
    uint256 validity;
    uint256 value;
    uint256 sizeInBytes;
}

interface IShiroStore {
    function putFile(
        string memory cid,
        uint256 validity,
        string memory provider,
        uint256 sizeInBytes
    ) external payable;

    function getFiles() external view returns (File[] memory);

    function deleteFile(string memory cid) external;
}

contract ShiroStore is
    IShiroStore,
    AutomationCompatibleInterface,
    ChainlinkClient,
    ConfirmedOwner
{
    using Chainlink for Chainlink.Request;

    event NewFile(
        address owner,
        string cid,
        string provider,
        uint256 timestamp,
        uint256 validity,
        uint256 value,
        uint256 sizeInBytes
    );
    event DeleteFile(address owner, string cid, uint256 timestamp);
    event RejectFile(
        address owner,
        string cid,
        uint256 timestamp,
        uint256 givenSize,
        uint256 expectedSize
    );
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
            if (isFileAvailable(file) && ShiroUtils.strcmp(file.cid, cid)) {
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
            if (isFileAvailable(file) && ShiroUtils.strcmp(file.cid, cid)) {
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

    function isFileAvailable(File storage file) internal view returns (bool) {
        return file.valid && !file.deleted && !file.rejected;
    }

    function putFile(
        string memory cid,
        uint256 validity,
        string memory provider,
        uint256 sizeInBytes
    ) external payable {
        require(validity >= 3600, "Validity must be at least an hour.");

        validateStorageProvider(provider);

        address owner = msg.sender;

        uint256 price = calculatePrice(sizeInBytes, validity);
        require(
            msg.value >= price,
            string.concat(
                "Not enough value given!. Got: ",
                ShiroUtils.uint2str(msg.value),
                " Wanted at least: ",
                ShiroUtils.uint2str(price)
            )
        );

        File storage file = findOrCreateFile(owner, cid);

        uint256 value = msg.value;
        // add to remaining validity if it wasn't deleted
        if (
            isFileAvailable(file) &&
            file.timestamp + file.validity >= block.timestamp
        ) {
            uint256 remainingValidity = (file.timestamp + file.validity) -
                block.timestamp;
            value += file.value * (remainingValidity / file.validity);
            validity += remainingValidity;
        }

        file.valid = true;
        file.deleted = false;
        file.rejected = false;
        file.cid = cid;
        file.provider = provider;
        file.timestamp = block.timestamp;
        file.validity = validity;
        file.value = value;
        file.sizeInBytes = sizeInBytes;

        requestFileSize(owner, cid, validity);
    }

    function getFiles() external view returns (File[] memory) {
        address owner = msg.sender;

        uint256 resultCount = 0;
        for (uint256 idx = 0; idx < store[owner].length; ++idx) {
            File storage file = store[owner][idx];
            if (isFileAvailable(file)) {
                resultCount++;
            }
        }

        File[] memory files = new File[](resultCount);

        uint256 arrIdx = 0;
        for (uint256 idx = 0; idx < store[owner].length; ++idx) {
            File storage file = store[owner][idx];
            if (isFileAvailable(file)) {
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
                    isFileAvailable(file) &&
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
        returns (bool upkeepNeeded, bytes memory performData)
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
                    isFileAvailable(file) &&
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

    // === Chainlink Price Feeds + Any API ===
    bytes32 private jobId;
    uint256 private fee;
    AggregatorV3Interface internal usdEthPriceFeed;

    // reciprocal of cost (in USD) per byte per 1000 hours
    uint256 private bytePerUSD = 10 * 11;

    constructor(
        address chainlinkTokenAddr,
        address chainlinkOracleAddr,
        address usdEthPriceFeedAddr
    ) ConfirmedOwner(msg.sender) {
        setChainlinkToken(chainlinkTokenAddr);
        setChainlinkOracle(chainlinkOracleAddr);
        usdEthPriceFeed = AggregatorV3Interface(usdEthPriceFeedAddr);
        jobId = "dabeb1d0dab342c8ac8093a47345a632";
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
    }

    function getLatestEthUsd() internal view returns (int256) {
        (, int256 price, , , ) = usdEthPriceFeed.latestRoundData();
        return price;
    }

    // validity in seconds
    function calculatePrice(uint256 sizeInBytes, uint256 validity)
        internal
        view
        returns (uint256)
    {
        int256 usdPerEth = getLatestEthUsd();
        require(usdPerEth >= 0, "USD-ETH conversion rate cannot be negative");

        return
            (sizeInBytes *
                (10**usdEthPriceFeed.decimals()) *
                (10**18) *
                validity) / (bytePerUSD * uint256(usdPerEth) * 1000 * 3600);
    }

    function requestFileSize(
        address owner,
        string memory cid,
        uint256 validity
    ) internal returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfillFileSize.selector
        );

        // Set the URL to perform the GET request on
        req.add(
            "get",
            string.concat(
                "https://storage.shiro.network/fileSize?cid=",
                cid,
                "&",
                "owner=",
                ShiroUtils.toAsciiString(owner),
                "&",
                "validity=",
                ShiroUtils.uint2str(validity)
            )
        );

        // Sends the request
        return sendChainlinkRequest(req, fee);
    }

    function fulfillFileSize(
        bytes32 requestId,
        address owner,
        string memory cid,
        uint256 size,
        uint256 validity
    ) public recordChainlinkFulfillment(requestId) {
        File storage file = findOrCreateFile(owner, cid);

        if (size != file.sizeInBytes) {
            // TODO: find a way to return payment back to user.
            emit RejectFile(
                owner,
                cid,
                block.timestamp,
                file.sizeInBytes,
                size
            );
            file.rejected = true;
        } else {
            emit NewFile(
                owner,
                cid,
                file.provider,
                block.timestamp,
                validity,
                file.value,
                file.sizeInBytes
            );
        }
    }

    // function requestFilePriceUSD(string memory cid)
    //     internal
    //     returns (bytes32 requestId)
    // {
    //     Chainlink.Request memory req = buildChainlinkRequest(
    //         jobId,
    //         address(this),
    //         this.fulfillFilePriceUSD.selector
    //     );

    //     // Set the URL to perform the GET request on
    //     req.add(
    //         "get",
    //         string.concat(
    //             "http://storage.shiro.network/estimatePrice?cid=",
    //             cid
    //         )
    //     );

    //     req.add("path", "price");

    //     req.addInt("times", 1);

    //     // Sends the request
    //     return sendChainlinkRequest(req, fee);
    // }

    // function fulfillFilePriceUSD(bytes32 _requestId, uint256 _volume)
    //     public
    //     recordChainlinkFulfillment(_requestId)
    // {}

    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer"
        );
    }
    // === ---------------- ===
}
