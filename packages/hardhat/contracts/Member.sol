//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

/// @notice struct Member when a holder has been registered
struct Member {
    address wallet;
    uint256 reputationLevel;
    uint256 reputationPoints;
    bool banned;
}
