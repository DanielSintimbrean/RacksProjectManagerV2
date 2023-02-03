//SPDX-License-Identifier: MIT
/**
 * @author KaladinStormblessed16 and Daniel Sintimbrean
 */
pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./interfaces/IRacksProjectManager.sol";
import "./lib/StructuredLinkedList.sol";

//              ▟██████████   █████    ▟███████████   █████████████
//            ▟████████████   █████  ▟█████████████   █████████████   ███████████▛
//           ▐█████████████   █████▟███████▛  █████   █████████████   ██████████▛
//            ▜██▛    █████   ███████████▛    █████       ▟██████▛    █████████▛
//              ▀     █████   █████████▛      █████     ▟██████▛
//                    █████   ███████▛      ▟█████▛   ▟██████▛
//   ▟█████████████   ██████              ▟█████▛   ▟██████▛   ▟███████████████▙
//  ▟██████████████   ▜██████▙          ▟█████▛   ▟██████▛   ▟██████████████████▙
// ▟███████████████     ▜██████▙      ▟█████▛   ▟██████▛   ▟█████████████████████▙
//                        ▜██████▙            ▟██████▛          ┌────────┐
//                          ▜██████▙        ▟██████▛            │  LABS  │
//                                                              └────────┘

contract RacksProjectManager is
    IRacksProjectManager,
    Initializable,
    OwnableUpgradeable,
    AccessControlUpgradeable
{
    /// @notice interfaces
    /// @custom:oz-upgrades-unsafe-allow state-variable-immutable
    IHolderValidation private immutable holderValidation;
    IERC20 private erc20;

    /// @notice State variables
    bytes32 private constant ADMIN_ROLE = 0x00;
    address[] private members;
    bool private paused;
    uint256 private progressiveId;

    using StructuredLinkedList for StructuredLinkedList.List;
    StructuredLinkedList.List private projectsList;
    mapping(uint256 => Project) private projectStore;

    mapping(address => bool) private accountIsBanned;
    mapping(address => uint256) private projectId;
    mapping(address => Member) private membersData;

    /// @notice Check that user is Admin
    modifier onlyAdmin() {
        if (!hasRole(ADMIN_ROLE, msg.sender))
            revert RacksProjectManager_NotAdminErr();
        _;
    }

    /// @notice Check that user is Holder or Admin
    modifier onlyHolder() {
        if (
            holderValidation.isHolder(msg.sender) == address(0) &&
            !hasRole(ADMIN_ROLE, msg.sender)
        ) revert RacksProjectManager_NotHolderErr();
        _;
    }

    /// @notice Check that the smart contract is paused
    modifier isNotPaused() {
        if (paused) revert RacksProjectManager_IsPausedErr();
        _;
    }

    ///////////////////
    //   Constructor //
    ///////////////////
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(IHolderValidation _holderValidation) {
        holderValidation = _holderValidation;
    }

    ///////////////////
    //   Initialize  //
    ///////////////////
    function initialize(IERC20 _erc20) external initializer {
        erc20 = _erc20;
        __Ownable_init();
        __AccessControl_init();
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    ///////////////////////
    //  Logic Functions  //
    ///////////////////////

    /**
     * @notice Create Project
     * @param _name Project name
     * @param _colateralCost Colateral that members must pay to join the project
     * @param _reputationLevel Reputation level required to join the project
     * @param _maxMembersNumber Maximum number of members that can join the project
     * @dev Only callable by Admins
     */
    function createProject(
        string memory _name,
        uint256 _colateralCost,
        uint256 _reputationLevel,
        uint256 _maxMembersNumber
    ) external onlyAdmin isNotPaused {
        if (
            _colateralCost < 0 ||
            _reputationLevel <= 0 ||
            _maxMembersNumber <= 0 ||
            bytes(_name).length <= 0
        ) revert RacksProjectManager_InvalidParameterErr();

        Project newProject = new Project(
            this,
            _name,
            _colateralCost,
            _reputationLevel,
            _maxMembersNumber
        );

        progressiveId++;
        projectStore[progressiveId] = newProject;
        projectId[address(newProject)] = progressiveId;
        projectsList.pushFront(progressiveId);

        _setupRole(ADMIN_ROLE, address(newProject));
        emit NewProjectCreated(_name, address(newProject));
    }

    /**
     * @notice Add Member
     * @dev Only callable by Holders who are not already Members
     * emit - NewMemberRegistered
     */
    function registerMember() external onlyHolder isNotPaused {
        if (isWalletMember(msg.sender))
            revert RacksProjectManager_MemberAlreadyExistsErr();

        members.push(msg.sender);
        membersData[msg.sender] = Member(msg.sender, 1, 0, false);
        emit NewMemberRegistered(msg.sender);
    }

    ///////////////////////
    //  Setter Functions //
    ///////////////////////

    /**
     * @notice Set new Admin
     * @dev Only callable by the Admin
     */
    function addAdmin(address _newAdmin) external onlyOwner {
        grantRole(ADMIN_ROLE, _newAdmin);
    }

    /**
     * @notice Remove an account from the user role
     * @dev Only callable by the Admin
     */
    function removeAdmin(address _account) external virtual onlyOwner {
        revokeRole(ADMIN_ROLE, _account);
    }

    /**
     * @notice Set new ERC20 Token
     * @dev Only callable by the Admin
     */
    function setERC20Address(address _erc20) external onlyAdmin {
        erc20 = IERC20(_erc20);
    }

    /**
     * @notice Set a ban state for a Member
     * @dev Only callable by Admins.
     */
    function setMemberStateToBanList(
        address _account,
        bool _state
    ) external onlyAdmin {
        accountIsBanned[_account] = _state;

        if (_state == true) {
            (bool existNext, uint256 i) = projectsList.getNextNode(0);

            while (i != 0 && existNext) {
                Project project = projectStore[i];
                if (project.isActive() && project.isMemberInProject(_account)) {
                    project.removeMember(_account, false);
                }
                (existNext, i) = projectsList.getNextNode(i);
            }
        }
    }

    /// @inheritdoc IRacksProjectManager
    function setAccountToMemberData(
        address _account,
        Member memory _newData
    ) public override onlyAdmin {
        membersData[_account] = _newData;
    }

    /// Increase Member's Reputation Level
    function increaseMemberRP(
        address _account,
        uint256 _reputationPointsReward
    ) public onlyAdmin {
        if (_reputationPointsReward <= 0)
            revert RacksProjectManager_InvalidParameterErr();

        Member memory member = membersData[_account];

        uint256 grossReputationPoints = member.reputationPoints +
            _reputationPointsReward;

        member.reputationLevel = grossReputationPoints / 100;
        member.reputationPoints = grossReputationPoints % 100;

        /// 1 -> 2 | 100
        /// 2 -> 3 | 200
        /// 3 -> 4 | 300
        /// 4 -> 5 | 400

        /// 100 -> 2
        /// 300 -> 3
        /// 600 -> 4
        /// 1000 -> 5
        /// 1500 -> 6
        /// 2100 -> 7
        /// 2800 -> 8
        /// 3600 -> 9
        /// 4500 -> 10

        membersData[_account] = member;
    }

    function setIsPaused(bool _newPausedValue) public onlyAdmin {
        paused = _newPausedValue;
    }

    ////////////////////////
    //  Getter Functions //
    //////////////////////

    /// @inheritdoc IRacksProjectManager
    function isAdmin(address _account) public view override returns (bool) {
        return hasRole(ADMIN_ROLE, _account);
    }

    /// @notice Returns Holder Validation contract address
    function getHolderValidationInterface()
        external
        view
        returns (IHolderValidation)
    {
        return holderValidation;
    }

    /// @inheritdoc IRacksProjectManager
    function getERC20Interface() public view override returns (IERC20) {
        return erc20;
    }

    /// @inheritdoc IRacksProjectManager
    function getRacksPMOwner() public view override returns (address) {
        return owner();
    }

    /// @inheritdoc IRacksProjectManager
    function isMemberBanned(
        address _account
    ) external view override returns (bool) {
        return accountIsBanned[_account];
    }

    /**
     * @notice Get projects depending on Level
     * @dev Only callable by Holders
     */
    function getProjects() public view onlyHolder returns (Project[] memory) {
        if (hasRole(ADMIN_ROLE, msg.sender)) return getAllProjects();
        Project[] memory filteredProjects = new Project[](
            projectsList.sizeOf()
        );

        unchecked {
            uint256 callerReputationLv = isWalletMember(msg.sender)
                ? membersData[msg.sender].reputationLevel
                : 1;
            uint256 j = 0;
            (bool existNext, uint256 i) = projectsList.getNextNode(0);

            while (i != 0 && existNext) {
                if (
                    projectStore[i].getReputationLevel() <= callerReputationLv
                ) {
                    filteredProjects[j] = projectStore[i];
                    j++;
                }
                (existNext, i) = projectsList.getNextNode(i);
            }
        }

        return filteredProjects;
    }

    function getAllProjects() public view returns (Project[] memory) {
        Project[] memory allProjects = new Project[](projectsList.sizeOf());

        uint256 j = 0;
        (bool existNext, uint256 i) = projectsList.getNextNode(0);

        while (i != 0 && existNext) {
            allProjects[j] = projectStore[i];
            j++;
            (existNext, i) = projectsList.getNextNode(i);
        }

        return allProjects;
    }

    /// @notice Get Member by index
    function getMember(uint256 _index) public view returns (Member memory) {
        return membersData[members[_index]];
    }

    /**
     * @inheritdoc IRacksProjectManager
     */
    function isWalletMember(
        address _account
    ) public view override returns (bool) {
        return membersData[_account].wallet != address(0);
    }

    /// @inheritdoc IRacksProjectManager
    function getMemberData(
        address _account
    ) public view override returns (Member memory) {
        return membersData[_account];
    }

    /**
     * @notice Get total number of contributors
     * @dev Only callable by Holders
     */
    function getNumberOfMembers() external view onlyHolder returns (uint256) {
        return members.length;
    }

    /// @inheritdoc IRacksProjectManager
    function isPaused() external view override returns (bool) {
        return paused;
    }

    /// @inheritdoc IRacksProjectManager
    function deleteProject() external override {
        uint256 id = projectId[msg.sender];

        require(id > 0);

        projectId[msg.sender] = 0;
        projectsList.remove(id);
    }

    function isHolder(address _account) external view returns (bool) {
        return holderValidation.isHolder(_account) != address(0);
    }
}
