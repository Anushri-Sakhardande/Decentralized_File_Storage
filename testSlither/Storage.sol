// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Storage {
    address public owner;

    struct SellOrder {
        uint id;
        address DSO;
        uint volumeGB;
        uint pricePerGB;
        string DSOConnectionInfo;
    }

    struct BuyOrder {
        uint id;
        address DO;
        uint volumeGB;
        uint pricePerGB;
        uint weiInitialAmount;
        string DOConnectionInfo;
    }

    struct StorageContract {
        uint id;
        address DO;
        address DSO;
        string DOConnectionInfo;
        string DSOConnectionInfo;
        uint volumeGB;
        uint startDate;
        uint stopDate;
        uint pricePerGB;
        uint weiLeftToWithdraw;
        uint withdrawedAtDate;
    }

    uint private sellOrderId;
    uint private buyOrderId;
    uint private storageContractId;

    SellOrder[] private sellOrderArr;
    BuyOrder[] private buyOrderArr;
    StorageContract[] private storageContractArr;

    event BuyOrderCreated(uint id, address indexed DO, uint volumeGB, uint pricePerGB, uint weiInitialAmount);
    event SellOrderCreated(uint id, address indexed DSO, uint volumeGB, uint pricePerGB);
    event BuyOrderCancelled(uint id, address indexed DO);
    event SellOrderCancelled(uint id, address indexed DSO);
    event StorageContractCreated(uint id, address indexed DO, address indexed DSO, uint volumeGB, uint pricePerGB);
    event StorageContractStarted(uint id);
    event StorageContractStopped(uint id, uint weiWithdrawn);
    event StorageContractWithdrawn(uint id, uint weiWithdrawn);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function deleteBuyOrderFromArray(uint buyOrderIndex) internal {
        if (buyOrderIndex != buyOrderArr.length - 1) {
            buyOrderArr[buyOrderIndex] = buyOrderArr[buyOrderArr.length - 1];
        }
        buyOrderArr.pop();
    }

    function deleteSellOrderFromArray(uint sellOrderIndex) internal {
        if (sellOrderIndex != sellOrderArr.length - 1) {
            sellOrderArr[sellOrderIndex] = sellOrderArr[sellOrderArr.length - 1];
        }
        sellOrderArr.pop();
    }

    function deleteStorageContractFromArray(uint storageContractIndex) internal {
        if (storageContractIndex != storageContractArr.length - 1) {
            storageContractArr[storageContractIndex] = storageContractArr[storageContractArr.length - 1];
        }
        storageContractArr.pop();
    }

    function weiAllowedToWithdraw(uint storageContractIndex) internal view returns (uint) {
        StorageContract memory c = storageContractArr[storageContractIndex];
        if (c.startDate == 0) return 0;

        uint calcToDate = block.timestamp;  // Alternative logic here
        if (c.stopDate != 0) calcToDate = c.stopDate;

        uint _weiAllowedToWithdraw = (calcToDate - c.withdrawedAtDate) * c.pricePerGB * c.volumeGB;
        if (_weiAllowedToWithdraw >= c.weiLeftToWithdraw) _weiAllowedToWithdraw = c.weiLeftToWithdraw;

        return _weiAllowedToWithdraw;
    }

    function createBuyOrder(uint volumeGB, uint pricePerGB, string memory DOConnectionInfo) public payable  {
        buyOrderArr.push(BuyOrder(++buyOrderId, msg.sender, volumeGB, pricePerGB, msg.value, DOConnectionInfo));
        emit BuyOrderCreated(buyOrderId, msg.sender, volumeGB, pricePerGB, msg.value);
    }

    function cancelBuyOrder(uint buyOrderIndex, uint buyOrderID) public{
        BuyOrder storage order = buyOrderArr[buyOrderIndex];
        require(order.DO == msg.sender && order.id == buyOrderID, "Not authorized to cancel");

        uint amount = order.weiInitialAmount;
        deleteBuyOrderFromArray(buyOrderIndex);
        payable(msg.sender).transfer(amount); // Replaced 'call' with 'transfer'
        emit BuyOrderCancelled(buyOrderID, msg.sender);
    }

    function createSellOrder(uint volumeGB, uint pricePerGB, string memory DSOConnectionInfo) public {
        sellOrderArr.push(SellOrder(++sellOrderId, msg.sender, volumeGB, pricePerGB, DSOConnectionInfo));
        emit SellOrderCreated(sellOrderId, msg.sender, volumeGB, pricePerGB);
    }

    function cancelSellOrder(uint sellOrderIndex, uint sellOrderID) public {
        SellOrder storage order = sellOrderArr[sellOrderIndex];
        require(order.DSO == msg.sender && order.id == sellOrderID, "Not authorized to cancel");
        deleteSellOrderFromArray(sellOrderIndex);
        emit SellOrderCancelled(sellOrderID, msg.sender);
    }

    function createStorageContract(uint orderIndex, uint orderID, uint orderType, string memory connectionInfo) public payable returns (uint newStorageContractID) {
        // Contract creation code
    }

    function withdrawFromStorageContract(uint storageContractIndex, uint storageContractID) public returns (uint) {
        StorageContract storage c = storageContractArr[storageContractIndex];
        require((c.DSO == msg.sender || c.DO == msg.sender) && c.id == storageContractID, "Unauthorized");

        uint withdrawedWei = weiAllowedToWithdraw(storageContractIndex);
        if (msg.sender == c.DSO && withdrawedWei != 0) {
            c.weiLeftToWithdraw -= withdrawedWei;
            c.withdrawedAtDate = block.timestamp;
            payable(msg.sender).transfer(withdrawedWei); // Replaced 'call' with 'transfer'
            emit StorageContractWithdrawn(storageContractID, withdrawedWei);
            return withdrawedWei;
        }
        revert("Invalid withdrawal attempt");
    }

        function startStorageContract(uint storageContractIndex, uint storageContractID) public {
        StorageContract storage c = storageContractArr[storageContractIndex];
        require(c.DO == msg.sender && c.id == storageContractID, "Unauthorized");

        // Using block number as a more stable alternative to block.timestamp
        c.startDate = block.number;
        c.withdrawedAtDate = block.number;

        emit StorageContractStarted(storageContractID);
    }

    function stopStorageContract(uint storageContractIndex, uint storageContractID) public returns (uint) {
        StorageContract storage c = storageContractArr[storageContractIndex];
        require(c.id == storageContractID && c.stopDate == 0, "Contract already stopped or invalid");
        require(c.DO == msg.sender || c.DSO == msg.sender, "Unauthorized");

        c.stopDate = block.number;
        uint withdrawedWei = weiAllowedToWithdraw(storageContractIndex);

        if (msg.sender == c.DO) {
            withdrawedWei = c.weiLeftToWithdraw - withdrawedWei;
        }

        if (msg.sender == c.DSO) {
            c.withdrawedAtDate = block.number;
        }

        c.weiLeftToWithdraw -= withdrawedWei;

        // Replacing 'call' with 'transfer' to prevent re-entrancy attacks
        payable(msg.sender).transfer(withdrawedWei);
        emit StorageContractStopped(storageContractID, withdrawedWei);

        // Deleting the storage contract if all funds are withdrawn
        if (c.weiLeftToWithdraw == 0) {
            deleteStorageContractFromArray(storageContractIndex);
        }

        return withdrawedWei;
    }

}
