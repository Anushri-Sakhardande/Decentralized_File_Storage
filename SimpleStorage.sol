// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract SimpleStorage {
    
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

  uint sellOrderId;
  uint buyOrderId;
  uint storageContractId;

  SellOrder[] sellOrderArr;
  BuyOrder[]  buyOrderArr;
  StorageContract[]  storageContractArr;

  function deleteBuyOrderFromArray(uint buyOrderIndex) internal {
    if(buyOrderIndex != buyOrderArr.length - 1) {
        buyOrderArr[buyOrderIndex] = buyOrderArr[buyOrderArr.length - 1];
    }
    buyOrderArr.pop();
  }

  function deleteSellOrderFromArray(uint sellOrderIndex) internal {
    if(sellOrderIndex != sellOrderArr.length - 1) {
        sellOrderArr[sellOrderIndex] = sellOrderArr[sellOrderArr.length - 1];
    }
    sellOrderArr.pop();
  }

  function deleteStorageContractFromArray(uint storageContractIndex) internal {
    if(storageContractIndex != storageContractArr.length - 1) {
        storageContractArr[storageContractIndex] = storageContractArr[storageContractArr.length - 1];
    }
    storageContractArr.pop();
  }

  function weiAllowedToWithdraw(uint storageContractIndex) internal view returns (uint _weiAllowedToWithdraw) {
      StorageContract storage c = storageContractArr[storageContractIndex];
      if (c.startDate == 0) return 0;
      uint calcToDate = block.timestamp;
      if (c.stopDate != 0) calcToDate = c.stopDate;

      _weiAllowedToWithdraw = (calcToDate - c.withdrawedAtDate) * c.pricePerGB * c.volumeGB;
      if (_weiAllowedToWithdraw >= c.weiLeftToWithdraw) _weiAllowedToWithdraw = c.weiLeftToWithdraw;

      return _weiAllowedToWithdraw;
  }

  function createBuyOrder(uint volumeGB, uint pricePerGB, string memory DOConnectionInfo) public payable {
      buyOrderArr.push(BuyOrder(++buyOrderId, msg.sender, volumeGB, pricePerGB, msg.value, DOConnectionInfo));
  }

  function cancelBuyOrder(uint buyOrderIndex, uint buyOrderID) public {
      BuyOrder storage order = buyOrderArr[buyOrderIndex];
      require(order.DO == msg.sender && order.id == buyOrderID, "Not authorized to cancel");

      uint amount = order.weiInitialAmount;
      deleteBuyOrderFromArray(buyOrderIndex);
      (bool success, ) = msg.sender.call{value: amount}("");
      require(success, "Transfer failed");
  }

  function getBuyOrder(uint buyOrderIndex) public view returns(uint id, address DO, uint volume, uint pricePerGB, uint weiInitialAmount, string memory DOConnectionInfo) {
      BuyOrder storage order = buyOrderArr[buyOrderIndex];
      return (order.id, order.DO, order.volumeGB, order.pricePerGB, order.weiInitialAmount, order.DOConnectionInfo);
  }

  function buyOrdersLength() public view returns(uint) {
      return buyOrderArr.length;
  }

  function createSellOrder(uint volumeGB, uint pricePerGB, string memory DSOConnectionInfo) public {
      sellOrderArr.push(SellOrder(++sellOrderId, msg.sender, volumeGB, pricePerGB, DSOConnectionInfo));
  }

  function getSellOrder(uint sellOrderIndex) public view returns(uint id, address DSO, uint volume, uint pricePerGB, string memory DSOConnectionInfo) {
      SellOrder storage order = sellOrderArr[sellOrderIndex];
      return (order.id, order.DSO, order.volumeGB, order.pricePerGB, order.DSOConnectionInfo);
  }

  function sellOrdersLength() public view returns(uint) {
      return sellOrderArr.length;
  }

  function cancelSellOrder(uint sellOrderIndex, uint sellOrderID) public {
      SellOrder storage order = sellOrderArr[sellOrderIndex];
      require(order.DSO == msg.sender && order.id == sellOrderID, "Not authorized to cancel");
      deleteSellOrderFromArray(sellOrderIndex);
  }

  function createStorageContract(uint orderIndex, uint orderID, uint orderType, string memory connectionInfo) public payable returns (uint newStorageContractID) {
      if (orderType == 1) {
          require(buyOrderArr[orderIndex].id == orderID, "Invalid buy order ID");
          BuyOrder storage buyOrder = buyOrderArr[orderIndex];

          storageContractArr.push(StorageContract(
              ++storageContractId,
              buyOrder.DO,
              msg.sender,
              buyOrder.DOConnectionInfo,
              connectionInfo,
              buyOrder.volumeGB,
              0,
              0,
              buyOrder.pricePerGB,
              buyOrder.weiInitialAmount,
              0
          ));

          deleteBuyOrderFromArray(orderIndex);
          return storageContractId;

      } else if (orderType == 2) {
          require(sellOrderArr[orderIndex].id == orderID, "Invalid sell order ID");
          SellOrder storage sellOrder = sellOrderArr[orderIndex];

          storageContractArr.push(StorageContract(
              ++storageContractId,
              msg.sender,
              sellOrder.DSO,
              connectionInfo,
              sellOrder.DSOConnectionInfo,
              sellOrder.volumeGB,
              0,
              0,
              sellOrder.pricePerGB,
              msg.value,
              0
          ));

          deleteSellOrderFromArray(orderIndex);
          return storageContractId;
      } else {
          revert("Invalid order type");
      }
  }

  function refillStorageContract(uint storageContractIndex, uint storageContractID) public payable {
      StorageContract storage c = storageContractArr[storageContractIndex];
      require(c.DO == msg.sender && c.id == storageContractID && c.stopDate == 0, "Invalid contract");
      c.weiLeftToWithdraw += msg.value;
  }

  function withdrawFromStorageContract(uint storageContractIndex, uint storageContractID) public returns(uint withdrawedWei) {
      StorageContract storage c = storageContractArr[storageContractIndex];
      require((c.DSO == msg.sender || c.DO == msg.sender) && c.id == storageContractID, "Unauthorized");

      withdrawedWei = weiAllowedToWithdraw(storageContractIndex);

      if (msg.sender == c.DSO && withdrawedWei != 0) {
          c.weiLeftToWithdraw -= withdrawedWei;
          c.withdrawedAtDate = block.timestamp;
          (bool success, ) = msg.sender.call{value: withdrawedWei}("");
          require(success, "Transfer failed");

          if (c.stopDate != 0 && c.weiLeftToWithdraw == 0) {
              deleteStorageContractFromArray(storageContractIndex);
          }
          return withdrawedWei;
      }

      if (msg.sender == c.DO && c.stopDate != 0) {
          require(withdrawedWei == 0, "No funds to withdraw");
          withdrawedWei = c.weiLeftToWithdraw;
          c.weiLeftToWithdraw -= withdrawedWei;
          (bool success, ) = msg.sender.call{value: withdrawedWei}("");
          require(success, "Transfer failed");
          deleteStorageContractFromArray(storageContractIndex);
          return withdrawedWei;
      }

      revert("Invalid withdrawal attempt");
  }

  function startStorageContract(uint storageContractIndex, uint storageContractID) public {
      StorageContract storage c = storageContractArr[storageContractIndex];
      require(c.DO == msg.sender && c.id == storageContractID, "Unauthorized");
      c.startDate = block.timestamp;
      c.withdrawedAtDate = block.timestamp;
  }

  function stopStorageContract(uint storageContractIndex, uint storageContractID) public returns(uint withdrawedWei) {
      StorageContract storage c = storageContractArr[storageContractIndex];
      require(c.id == storageContractID && c.stopDate == 0, "Contract already stopped or invalid");
      require(c.DO == msg.sender || c.DSO == msg.sender, "Unauthorized");

      c.stopDate = block.timestamp;
      withdrawedWei = weiAllowedToWithdraw(storageContractIndex);

    if (msg.sender == c.DO){
        withdrawedWei = c.weiLeftToWithdraw - withdrawedWei;
    }

    if (msg.sender == c.DSO){
        c.withdrawedAtDate = block.timestamp;
    }

    c.weiLeftToWithdraw -= withdrawedWei;
       if (msg.sender == c.DO || msg.sender == c.DSO) {
        (bool success, ) = msg.sender.call{value: withdrawedWei}("");
        require(success, "Transfer failed");
    }

    if (c.weiLeftToWithdraw == 0) {
        deleteStorageContractFromArray(storageContractIndex);
    }
  }

  function getStorageContract(uint storageContractIndex) public view returns(
        uint id,
        address DO,
        address DSO,
        string memory DOConnectionInfo,
        string memory DSOConnectionInfo,
        uint volumeGB,
        uint startDate,
        uint stopDate,
        uint pricePerGB,
        uint weiLeftToWithdraw,
        uint withdrawedAtDate,
        uint weiAllowedToWithdraw_Output
    ) {

      StorageContract memory contr = storageContractArr[storageContractIndex];
      uint watw = weiAllowedToWithdraw(storageContractIndex);

      return (contr.id,
              contr.DO,
              contr.DSO,
              contr.DOConnectionInfo,
              contr.DSOConnectionInfo,
              contr.volumeGB,
              contr.startDate,
              contr.stopDate,
              contr.pricePerGB,
              contr.weiLeftToWithdraw,
              contr.withdrawedAtDate,
              watw
              );
  }
  
  function storageContractsLength() public  view returns(uint){
      return storageContractArr.length;
  }
}
