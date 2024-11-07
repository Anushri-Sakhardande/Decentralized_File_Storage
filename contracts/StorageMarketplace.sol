// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract StorageMarketplace {
    struct Access {
        address dataOwner;
        bool access;
    }

    struct Bid {
        address dataRequester;
        address dataOwner;
        uint256 price;
        bool active;
    }

    struct StorageAgreement {
        address dataOwner;
        address dataRequester;
        uint256 price;
    }

    struct File {
        string url;
        string name;
    }

    address[] private users;
    Bid[] public bids;

    mapping(address => bool) public dataOwners;
    mapping(address => bool) public dataRequesters;
    mapping(address => File[]) private value;
    mapping(address => bool) private hasUploaded;
    mapping(address => mapping(address => bool)) private ownership;

    // New mappings to track access for data requesters
    mapping(address => Access[]) private requesterAccessList;
    mapping(address => mapping(address => bool)) private previousData;

    mapping(address => StorageAgreement[]) public agreements;

    event BidPlaced(address indexed dataRequester, address indexed dataOwner, uint256 price);
    event BidAccepted(address indexed dataOwner, address indexed dataRequester, uint256 price);
    event FileAdded(address indexed user, File file);
    event AccessGranted(address indexed dataOwner, address indexed dataRequester);
    event AccessRevoked(address indexed dataOwner, address indexed dataRequester);

    modifier onlyDataOwner() {
        require(dataOwners[msg.sender], "Not a data owner");
        _;
    }

    modifier onlyDataRequester() {
        require(dataRequesters[msg.sender], "Not a data requester");
        _;
    }

    // Registration functions
    function registerAsDataOwner() external {
        require(!dataOwners[msg.sender], "Already registered as data owner");
        dataOwners[msg.sender] = true;
    }

    function registerAsDataRequester() external {
        require(!dataRequesters[msg.sender], "Already registered as data requester");
        dataRequesters[msg.sender] = true;
    }

    function getRole() external view returns (bool, bool) {
        return (dataOwners[msg.sender], dataRequesters[msg.sender]);
    }

    // Bidding functions
    function placeBid(address _dataOwner, uint256 _price) external payable onlyDataRequester {
        require(_price > 0, "Price must be positive");
        require(msg.value == _price, "Please send the bid amount");

        bids.push(Bid({
            dataRequester: msg.sender,
            dataOwner: _dataOwner,
            price: _price,
            active: true
        }));

        emit BidPlaced(msg.sender, _dataOwner, _price);
    }

    function acceptBid(uint256 _bidIndex) external onlyDataOwner {
        require(_bidIndex < bids.length, "Invalid bid index");

        Bid storage bid = bids[_bidIndex];
        require(bid.active, "Bid is not active");
        require(bid.dataOwner == msg.sender, "Bid does not belong to this Data Owner");

        // Mark bid as inactive before transferring funds (Checks-Effects-Interactions pattern)
        bid.active = false;

        // Transfer the funds from the bid to the data owner
        payable(msg.sender).transfer(bid.price);

        // Create a storage agreement and grant access to the data requester
        StorageAgreement memory agreement = StorageAgreement({
            dataOwner: msg.sender,
            dataRequester: bid.dataRequester,
            price: bid.price
        });
        agreements[msg.sender].push(agreement);
        grantAccess(bid.dataRequester);

        emit BidAccepted(msg.sender, bid.dataRequester, bid.price);
    }

    function getBids() external view returns (Bid[] memory) {
        return bids;
    }

    function getMyAgreements() external view returns (StorageAgreement[] memory) {
        return agreements[msg.sender];
    }

    function getBidsCount() external view returns (uint256) {
        return bids.length;
    }

    // File management functions
    function add(string memory url, string memory fileName) external onlyDataOwner {
        File memory file = File(url, fileName);
        value[msg.sender].push(file);

        // Track unique users
        if (!hasUploaded[msg.sender]) {
            users.push(msg.sender);
            hasUploaded[msg.sender] = true;
        }
        emit FileAdded(msg.sender, file);
    }

    // Grant access from data owner to data requester
    function grantAccess(address dataRequester) internal {
        ownership[msg.sender][dataRequester] = true;
        if (previousData[dataRequester][msg.sender]) {
            for (uint i = 0; i < requesterAccessList[dataRequester].length; i++) {
                if (requesterAccessList[dataRequester][i].dataOwner == msg.sender) {
                    requesterAccessList[dataRequester][i].access = true;
                }
            }
        } else {
            requesterAccessList[dataRequester].push(Access(msg.sender, true));
            previousData[dataRequester][msg.sender] = true;
        }
        emit AccessGranted(msg.sender, dataRequester);
    }

    function revokeAccess(address dataRequester) external {
        ownership[msg.sender][dataRequester] = false;
        for (uint i = 0; i < requesterAccessList[dataRequester].length; i++) {
            if (requesterAccessList[dataRequester][i].dataOwner == msg.sender) {
                requesterAccessList[dataRequester][i].access = false;
            }
        }
        emit AccessRevoked(msg.sender, dataRequester);
    }

    function display(address _user) external view returns (File[] memory) {
        require(_user == msg.sender || ownership[_user][msg.sender], "You don't have access");
        return value[_user];
    }

    // Function to display all users with their file names
    function listAllFiles() external view returns (address[] memory, string[][] memory) {
        string[][] memory allFileNames = new string[][](users.length);

        for (uint256 i = 0; i < users.length; i++) {
            address user = users[i];
            uint256 fileCount = value[user].length;
            
            // Array for each user's file names
            string[] memory fileNames = new string[](fileCount);

            for (uint256 j = 0; j < fileCount; j++) {
                fileNames[j] = value[user][j].name;
            }
            
            allFileNames[i] = fileNames;
        }

        return (users, allFileNames);
    }

    // Retrieve the list of data owners who have granted access to the data requester
    function getAccessibleDataOwners() external view returns (Access[] memory) {
        return requesterAccessList[msg.sender];
    }
}
