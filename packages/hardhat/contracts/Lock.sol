// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

/* solhint-disable not-rely-on-time*/
contract Lock {
    uint256 public unlockTime;
    address payable public owner;

    uint256 private storageVariable = 0;

    event Withdrawal(uint256 amount, uint256 when);

    constructor(uint256 _unlockTime) payable {
        require(block.timestamp < _unlockTime, "Unlock time in the past");

        unlockTime = _unlockTime;
        owner = payable(msg.sender);
    }

    /**
     * @dev Withdraws the funds from the contract.
     */
    function withdraw() public {
        // Uncomment this line, and the import of "hardhat/console.sol", to print a log in your terminal
        // console.log("Unlock time is %o and block timestamp is %o", unlockTime, block.timestamp);

        require(block.timestamp >= unlockTime, "You can't withdraw yet");
        require(msg.sender == owner, "You aren't the owner");

        emit Withdrawal(address(this).balance, block.timestamp);

        owner.transfer(address(this).balance);
    }

    function setStorageVariable2(uint256 _storageVariable) public {
        require(msg.sender == owner, "You aren't the owner");
        storageVariable = _storageVariable;
    }

    function getStorageVariable() public view returns (uint256) {
        return storageVariable;
    }
}
