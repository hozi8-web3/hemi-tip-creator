// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CreatorTipping is ReentrancyGuard, Ownable {
    struct CreatorProfile {
        string username;
        string bio;
        string avatarURI;
        string[] socials; // ["twitter:@handle", "youtube:channel", etc.]
        uint256 totalTipsReceived;
        uint256 tipCount;
        bool exists;
    }

    struct Tip {
        address from;
        address to;
        uint256 amount;
        address token; // address(0) for ETH
        uint256 timestamp;
        string message;
    }

    mapping(address => CreatorProfile) public creatorProfiles;
    mapping(address => bool) public isCreator;
    address[] public creators;
    
    Tip[] public tips;
    mapping(address => uint256[]) public creatorTips; // creator => tip indices
    
    // Events
    event ProfileCreated(address indexed creator, string username);
    event ProfileUpdated(address indexed creator, string username);
    event TipSent(
        address indexed from,
        address indexed to,
        uint256 amount,
        address token,
        string message,
        uint256 tipIndex
    );

    constructor() {}

    function createProfile(
        string memory _username,
        string memory _bio,
        string memory _avatarURI,
        string[] memory _socials
    ) external {
        require(bytes(_username).length > 0, "Username required");
        require(bytes(_username).length <= 50, "Username too long");
        require(bytes(_bio).length <= 500, "Bio too long");
        require(bytes(_avatarURI).length <= 200, "Avatar URI too long");
        require(_socials.length <= 10, "Too many social links");
        
        // Validate social links length
        for (uint i = 0; i < _socials.length; i++) {
            require(bytes(_socials[i]).length <= 100, "Social link too long");
        }
        
        if (!isCreator[msg.sender]) {
            creators.push(msg.sender);
            isCreator[msg.sender] = true;
        }

        creatorProfiles[msg.sender] = CreatorProfile({
            username: _username,
            bio: _bio,
            avatarURI: _avatarURI,
            socials: _socials,
            totalTipsReceived: creatorProfiles[msg.sender].totalTipsReceived,
            tipCount: creatorProfiles[msg.sender].tipCount,
            exists: true
        });

        emit ProfileCreated(msg.sender, _username);
    }

    function updateProfile(
        string memory _username,
        string memory _bio,
        string memory _avatarURI,
        string[] memory _socials
    ) external {
        require(creatorProfiles[msg.sender].exists, "Profile doesn't exist");
        require(bytes(_username).length > 0, "Username required");
        require(bytes(_username).length <= 50, "Username too long");
        require(bytes(_bio).length <= 500, "Bio too long");
        require(bytes(_avatarURI).length <= 200, "Avatar URI too long");
        require(_socials.length <= 10, "Too many social links");
        
        // Validate social links length
        for (uint i = 0; i < _socials.length; i++) {
            require(bytes(_socials[i]).length <= 100, "Social link too long");
        }
        
        creatorProfiles[msg.sender].username = _username;
        creatorProfiles[msg.sender].bio = _bio;
        creatorProfiles[msg.sender].avatarURI = _avatarURI;
        creatorProfiles[msg.sender].socials = _socials;

        emit ProfileUpdated(msg.sender, _username);
    }

    function tipETH(address _creator, string memory _message) 
        external 
        payable 
        nonReentrant 
    {
        require(msg.value > 0, "Tip amount must be > 0");
        require(creatorProfiles[_creator].exists, "Creator doesn't exist");
        require(_creator != msg.sender, "Cannot tip yourself");

        // Transfer ETH to creator
        (bool success, ) = _creator.call{value: msg.value}("");
        require(success, "ETH transfer failed");

        // Record tip
        uint256 tipIndex = tips.length;
        tips.push(Tip({
            from: msg.sender,
            to: _creator,
            amount: msg.value,
            token: address(0),
            timestamp: block.timestamp,
            message: _message
        }));

        creatorTips[_creator].push(tipIndex);
        creatorProfiles[_creator].totalTipsReceived += msg.value;
        creatorProfiles[_creator].tipCount++;

        emit TipSent(msg.sender, _creator, msg.value, address(0), _message, tipIndex);
    }

    function tipERC20(
        address _creator,
        address _token,
        uint256 _amount,
        string memory _message
    ) external nonReentrant {
        require(_amount > 0, "Tip amount must be > 0");
        require(creatorProfiles[_creator].exists, "Creator doesn't exist");
        require(_creator != msg.sender, "Cannot tip yourself");
        require(_token != address(0), "Invalid token address");

        // Transfer tokens from sender to creator
        IERC20(_token).transferFrom(msg.sender, _creator, _amount);

        // Record tip
        uint256 tipIndex = tips.length;
        tips.push(Tip({
            from: msg.sender,
            to: _creator,
            amount: _amount,
            token: _token,
            timestamp: block.timestamp,
            message: _message
        }));

        creatorTips[_creator].push(tipIndex);
        creatorProfiles[_creator].totalTipsReceived += _amount; // Note: different tokens have different values
        creatorProfiles[_creator].tipCount++;

        emit TipSent(msg.sender, _creator, _amount, _token, _message, tipIndex);
    }

    // View functions
    function getCreatorProfile(address _creator) 
        external 
        view 
        returns (CreatorProfile memory) 
    {
        return creatorProfiles[_creator];
    }

    function getCreatorTips(address _creator) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return creatorTips[_creator];
    }

    function getTip(uint256 _tipIndex) 
        external 
        view 
        returns (Tip memory) 
    {
        require(_tipIndex < tips.length, "Tip doesn't exist");
        return tips[_tipIndex];
    }

    function getAllCreators() external view returns (address[] memory) {
        return creators;
    }

    function getTotalTips() external view returns (uint256) {
        return tips.length;
    }

    function getCreatorSocials(address _creator) 
        external 
        view 
        returns (string[] memory) 
    {
        return creatorProfiles[_creator].socials;
    }
}