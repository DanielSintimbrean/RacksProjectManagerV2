//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IRacksProjectManager.sol";
import "./errors/Err_Project.sol";
import "./lib/StructuredLinkedList.sol";

contract Project is Ownable, AccessControl {
    /// @notice Enumerations
    enum ProjectState {
        Pending,
        Active,
        Finished,
        Deleted
    }

    /// @notice Constants
    ProjectState private constant PENDING = ProjectState.Pending;
    ProjectState private constant ACTIVE = ProjectState.Active;
    ProjectState private constant FINISHED = ProjectState.Finished;
    ProjectState private constant DELETED = ProjectState.Deleted;

    bytes32 private constant ADMIN_ROLE = 0x00;

    /// Interfaces
    IRacksProjectManager private immutable racksPM;
    IERC20 private immutable racksPM_ERC20;

    /// ProjectMember
    using StructuredLinkedList for StructuredLinkedList.List;
    StructuredLinkedList.List private memberList;

    uint256 private progressiveId = 0;

    mapping(address => uint256) private memberId;
    mapping(uint256 => address) private memberAddress;

    mapping(address => uint256) private membersParticipation;
    mapping(address => uint256) private projectFunds;

    /// State variables
    string private name;
    uint256 private colateralCost;
    uint256 private reputationLevel;
    uint256 private maxMemberNumber;
    uint256 private totalAmountFunded;
    address[] public fundes;
    ProjectState private projectState;

    /**
     * @notice Check that the project has no members, therefore is editable
     */
    modifier isEditable() {
        if (memberList.sizeOf() > 0) revert Project_IsNotEditableErr();
        _;
    }

    /**
     * @notice Check that the project is not finished
     */
    modifier isNotFinished() {
        if (projectState == FINISHED) revert Project_ProjectFinishedErr();
        _;
    }

    /**
     * @notice Check that user is Admin
     */
    modifier onlyAdmin() {
        if (!hasRole(ADMIN_ROLE, msg.sender)) revert Project_NotAdminErr();
        _;
    }

    /**
     * @notice Check that user is member
     */
    modifier onlymember() {
        if (!racksPM.isWalletMember(msg.sender)) revert Project_NotMemberErr();
        _;
    }

    /**
     * @notice Check that the smart contract is not Paused
     */
    modifier isNotPaused() {
        if (racksPM.isPaused()) revert Project_IsPausedErr();
        _;
    }

    /**
     * @notice Check that the smart contract is not Pending
     */
    modifier isNotPending() {
        if (projectState == PENDING) revert Project_IsPendingErr();
        _;
    }

    /**
     * @notice Check that the smart contract is not Deleted
     */
    modifier isNotDeleted() {
        if (projectState == DELETED) revert Project_IsDeletedErr();
        _;
    }

    // Events
    event newProjectMemberRegistered(
        address projectAddress,
        address newProjectmember
    );
    event projectFunded(
        address projectAddress,
        address funderWallet,
        uint256 amount
    );

    constructor(
        IRacksProjectManager _racksPM,
        string memory _name,
        uint256 _colateralCost,
        uint256 _reputationLevel,
        uint256 _maxMemberNumber
    ) {
        racksPM = _racksPM;
        name = _name;
        colateralCost = _colateralCost;
        reputationLevel = _reputationLevel;
        maxMemberNumber = _maxMemberNumber;

        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, _racksPM.getRacksPMOwner());

        racksPM_ERC20 = _racksPM.getERC20Interface();
        projectState = PENDING;
    }

    ////////////////////////
    //  Logic Functions  //
    //////////////////////

    /**
     * @notice Add Project member
     * @dev Only callable by Holders who are already Member
     */
    function registerInProject()
        external
        onlymember
        isNotFinished
        isNotPaused
        isNotDeleted
        isNotPending
    {
        if (isMemberInProject(msg.sender))
            revert Project_MemberAlreadyExistsErr();

        if (memberList.sizeOf() == maxMemberNumber)
            revert Project_MaxMembersNumberExceededErr();

        Member memory member = getMemberData(msg.sender);

        if (racksPM.isMemberBanned(member.wallet))
            revert Project_MemberIsBannedErr();

        if (member.reputationLevel < reputationLevel)
            revert Project_MemberHasNoReputationEnoughErr();

        ++progressiveId;
        memberList.pushFront(progressiveId);
        memberId[member.wallet] = progressiveId;
        memberAddress[progressiveId] = member.wallet;

        emit newProjectMemberRegistered(address(this), msg.sender);

        if (colateralCost > 0) {
            bool success = racksPM_ERC20.transferFrom(
                msg.sender,
                address(this),
                colateralCost
            );

            if (!success) revert Project_Erc20TransferFailed();
        }
    }

    /**
     * @notice Finish Project
     * @dev Only callable by Admins when the project isn't completed
     * - The members and participationWeights array must have the same size of the project members list.
     * - If there is a banned member in the project, you have to pass his address and participation (should be 0) anyways.
     * - The sum of @param _participationWeights can not be more than 100
     */
    function finishProject(
        uint256 _totalReputationPointsReward,
        address[] memory _members,
        uint256[] memory _participationWeights
    ) external onlyAdmin isNotFinished isNotPaused isNotDeleted isNotPending {
        if (
            _totalReputationPointsReward <= 0 ||
            _members.length != memberList.sizeOf() ||
            _participationWeights.length != memberList.sizeOf()
        ) revert Project_InvalidParameterErr();

        projectState = FINISHED;
        uint256 totalParticipationWeight;

        unchecked {
            for (uint256 i; i < _members.length; i++) {
                if (!isMemberInProject(_members[i]))
                    revert Project_NotMemberErr();

                uint256 participationWeight = _participationWeights[i];

                membersParticipation[_members[i]] = participationWeight;
                totalParticipationWeight += participationWeight;
            }
            if (totalParticipationWeight > 100)
                revert Project_InvalidParameterErr();
        }
        unchecked {
            (bool existNext, uint256 i) = memberList.getNextNode(0);

            while (i != 0 && existNext) {
                address contrAddress = memberAddress[i];

                uint256 reputationToIncrease = (_totalReputationPointsReward *
                    membersParticipation[contrAddress]) / 100;

                //racksPM. (reputationToIncrease, i);
                // racksPM.setAccountToMemberData(contrAddress, projectMember[i]);

                if (colateralCost > 0) {
                    bool success = racksPM_ERC20.transfer(
                        contrAddress,
                        colateralCost
                    );
                    if (!success) revert Project_Erc20TransferFailed();
                }

                (existNext, i) = memberList.getNextNode(i);
            }
        }
        if (racksPM_ERC20.balanceOf(address(this)) > 0) shareProfits();
    }

    /**
     * @notice Fund the project with ERC20
     * @dev This serves as a reward to members
     */
    function fundProject(
        uint256 _amount
    ) external isNotPaused isNotDeleted isNotPending {
        if (_amount <= 0 || memberList.sizeOf() < 1)
            revert Project_InvalidParameterErr();

        totalAmountFunded += _amount;
        projectFunds[msg.sender] += _amount;
        fundes.push(msg.sender);
        emit projectFunded(address(this), msg.sender, _amount);
        bool success = racksPM_ERC20.transferFrom(
            msg.sender,
            address(this),
            _amount
        );
        if (!success) revert Project_Erc20TransferFailed();
    }

    /**
     * @notice Give Away extra rewards
     * @dev Only callable by Admins when the project is completed
     */
    function giveAway()
        external
        onlyAdmin
        isNotPaused
        isNotDeleted
        isNotPending
    {
        if (projectState != ProjectState.Finished)
            revert Project_NotCompletedErr();

        if (
            address(this).balance <= 0 &&
            racksPM_ERC20.balanceOf(address(this)) <= 0
        ) revert Project_NoFundsGiveAwayErr();

        shareProfits();
    }

    ////////////////////////
    //  Helper Functions //
    //////////////////////

    /**
     * @notice Used to give away profits
     * @dev Only callable by Admins when project completed
     */
    function shareProfits() private onlyAdmin {
        if (projectState != ProjectState.Finished)
            revert Project_NotCompletedErr();

        unchecked {
            uint256 projectBalanceERC20 = racksPM_ERC20.balanceOf(
                address(this)
            );
            uint256 projectBalanceEther = address(this).balance;
            (bool existNext, uint256 i) = memberList.getNextNode(0);

            while (i != 0 && existNext) {
                address contrAddress = memberAddress[i];
                if (racksPM_ERC20.balanceOf(address(this)) > 0) {
                    bool successTransfer = racksPM_ERC20.transfer(
                        contrAddress,
                        (projectBalanceERC20 *
                            membersParticipation[contrAddress]) / 100
                    );
                    if (!successTransfer) revert Project_Erc20TransferFailed();
                }

                if (address(this).balance > 0) {
                    (bool success, ) = contrAddress.call{
                        value: (projectBalanceEther *
                            membersParticipation[contrAddress]) / 100
                    }("");
                    if (!success) revert Project_TransferGiveAwayFailed();
                }
                (existNext, i) = memberList.getNextNode(i);
            }
        }
    }

    /**
     * @notice Provides information about supported interfaces (required by AccessControl)
     */
    function supportsInterface(
        bytes4 _interfaceId
    ) public view virtual override returns (bool) {
        return super.supportsInterface(_interfaceId);
    }

    function deleteProject() public onlyAdmin isNotDeleted isEditable {
        projectState = DELETED;

        racksPM.deleteProject();

        if (racksPM_ERC20.balanceOf(address(this)) > 0) {
            unchecked {
                for (uint256 i = 0; i < fundes.length; i++) {
                    address funder = fundes[i];
                    uint256 amount = projectFunds[funder];
                    if (amount > 0) {
                        projectFunds[funder] = 0;
                        totalAmountFunded -= amount;
                        bool successTransfer = racksPM_ERC20.transfer(
                            funder,
                            amount
                        );
                        if (!successTransfer)
                            revert Project_Erc20TransferFailed();
                    }
                }
            }
        }
    }

    function removeMember(
        address _member,
        bool _returnColateral
    ) public onlyAdmin isNotDeleted {
        if (!isMemberInProject(_member)) revert Project_NotMemberErr();
        uint256 id = memberId[_member];
        memberId[_member] = 0;
        memberList.remove(id);

        if (_returnColateral && colateralCost > 0) {
            bool success = racksPM_ERC20.transfer(_member, colateralCost);
            if (!success) revert Project_Erc20TransferFailed();
        }
    }

    function getMemberData(
        address _memberAddress
    ) internal view returns (Member memory) {
        return racksPM.getMemberData(_memberAddress);
    }

    ////////////////////////
    //  Setter Functions //
    //////////////////////

    /**
     * @notice  the Project State
     * @dev Only callable by Admins when the project has no member yet and is pending.
     */
    function approveProject() external onlyAdmin isNotPaused isNotDeleted {
        if (projectState == PENDING) projectState = ACTIVE;
    }

    /**
     * @notice  the Project Name
     * @dev Only callable by Admins when the project has no member yet.
     */
    function setName(
        string memory _name
    ) external onlyAdmin isEditable isNotPaused isNotDeleted {
        if (bytes(_name).length <= 0) revert Project_InvalidParameterErr();
        name = _name;
    }

    /**
     * @notice Edit the Colateral Cost
     * @dev Only callable by Admins when the project has no member yet.
     */
    function setColateralCost(
        uint256 _colateralCost
    ) external onlyAdmin isEditable isNotPaused isNotDeleted {
        if (_colateralCost < 0) revert Project_InvalidParameterErr();
        colateralCost = _colateralCost;
    }

    /**
     * @notice Edit the Reputation Level
     * @dev Only callable by Admins when the project has no member yet.
     */
    function setReputationLevel(
        uint256 _reputationLevel
    ) external onlyAdmin isEditable isNotPaused isNotDeleted {
        if (_reputationLevel <= 0) revert Project_InvalidParameterErr();
        reputationLevel = _reputationLevel;
    }

    /**
     * @notice Edit the Reputation Level
     * @dev Only callable by Admins when the project has no member yet.
     */
    function setMaxMemberNumber(
        uint256 _maxMemberNumber
    ) external onlyAdmin isNotPaused isNotDeleted {
        if (_maxMemberNumber <= 0 || _maxMemberNumber < memberList.sizeOf())
            revert Project_InvalidParameterErr();
        maxMemberNumber = _maxMemberNumber;
    }

    ////////////////////////
    //  Getter Functions //
    //////////////////////

    /// @notice Get the project name
    function getName() external view returns (string memory) {
        return name;
    }

    /// @notice Get the colateral cost to enter as member
    function getColateralCost() external view returns (uint256) {
        return colateralCost;
    }

    /// @notice Get the reputation level of the project
    function getReputationLevel() external view returns (uint256) {
        return reputationLevel;
    }

    /// @notice Get the maximum member that can be in the project
    function getMaxMember() external view returns (uint256) {
        return maxMemberNumber;
    }

    /// @notice Get total number of members
    function getNumberOfMember() external view returns (uint256) {
        return memberList.sizeOf();
    }

    /// @notice Get all member addresses
    function getAllMemberAddress() external view returns (address[] memory) {
        address[] memory allMember = new address[](memberList.sizeOf());

        uint256 j = 0;
        (bool existNext, uint256 i) = memberList.getNextNode(0);

        while (i != 0 && existNext) {
            allMember[j] = memberAddress[i];
            j++;
            (existNext, i) = memberList.getNextNode(i);
        }

        return allMember;
    }

    /// @notice Return true if the address is a member in the project
    function isMemberInProject(address _member) public view returns (bool) {
        return memberId[_member] != 0;
    }

    /// @notice Get the participation weight in percent
    function getmemberParticipation(
        address _member
    ) external view returns (uint256) {
        if (projectState != ProjectState.Finished)
            revert Project_NotCompletedErr();
        return membersParticipation[_member];
    }

    /// @notice Get the balance of funds given by an address
    function getAccountFunds(address _account) external view returns (uint256) {
        return projectFunds[_account];
    }

    /// @notice Get total amount of funds a Project got since creation
    function getTotalAmountFunded() external view returns (uint256) {
        return totalAmountFunded;
    }

    /// @notice Returns whether the project is pending or not
    function isPending() external view returns (bool) {
        return projectState == PENDING;
    }

    /// @notice Returns whether the project is active or not
    function isActive() external view returns (bool) {
        return projectState == ACTIVE;
    }

    /// @notice Return true is the project is completed, otherwise return false
    function isFinished() external view returns (bool) {
        return projectState == FINISHED;
    }

    /// @notice Returns whether the project is deleted or not
    function isDeleted() external view returns (bool) {
        return projectState == DELETED;
    }
}
