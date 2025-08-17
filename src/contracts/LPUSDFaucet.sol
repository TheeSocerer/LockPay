// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title LPUSDFaucet
 * @dev A faucet contract for distributing LPUSD tokens to users for testing
 */
contract LPUSDFaucet is ERC20, Ownable, ReentrancyGuard {
    // Faucet configuration
    uint256 public constant FAUCET_AMOUNT = 100 * 10**18; // 100 LPUSD per request
    uint256 public constant COOLDOWN_PERIOD = 1 hours; // 1 hour cooldown between requests
    
    // Mapping to track last request time for each address
    mapping(address => uint256) public lastRequestTime;
    
    // Events
    event TokensRequested(address indexed user, uint256 amount, uint256 timestamp);
    event FaucetRefilled(address indexed refiller, uint256 amount);
    
    constructor() ERC20("LockPay StableCoin", "LPUSD") Ownable(msg.sender) {
        // Initial supply for the faucet
        _mint(address(this), 100000 * 10**18); // 100,000 LPUSD for faucet
    }
    
    /**
     * @dev Request LPUSD tokens from the faucet
     * Users can request tokens once per cooldown period
     */
    function requestTokens() external nonReentrant {
        require(
            block.timestamp >= lastRequestTime[msg.sender] + COOLDOWN_PERIOD,
            "Faucet: Cooldown period not elapsed"
        );
        
        require(
            balanceOf(address(this)) >= FAUCET_AMOUNT,
            "Faucet: Insufficient tokens available"
        );
        
        // Update last request time
        lastRequestTime[msg.sender] = block.timestamp;
        
        // Transfer tokens to user
        _transfer(address(this), msg.sender, FAUCET_AMOUNT);
        
        emit TokensRequested(msg.sender, FAUCET_AMOUNT, block.timestamp);
    }
    
    /**
     * @dev Check if a user can request tokens
     * @param user Address to check
     * @return canRequest True if user can request tokens
     * @return timeRemaining Time remaining until next request (0 if can request now)
     */
    function canRequestTokens(address user) external view returns (bool canRequest, uint256 timeRemaining) {
        uint256 nextRequestTime = lastRequestTime[user] + COOLDOWN_PERIOD;
        
        if (block.timestamp >= nextRequestTime && balanceOf(address(this)) >= FAUCET_AMOUNT) {
            return (true, 0);
        } else {
            timeRemaining = block.timestamp >= nextRequestTime ? 0 : nextRequestTime - block.timestamp;
            return (false, timeRemaining);
        }
    }
    
    /**
     * @dev Get faucet information
     * @return availableTokens Number of tokens available in faucet
     * @return faucetAmount Amount given per request
     * @return cooldownPeriod Cooldown period between requests
     */
    function getFaucetInfo() external view returns (
        uint256 availableTokens,
        uint256 faucetAmount,
        uint256 cooldownPeriod
    ) {
        return (
            balanceOf(address(this)),
            FAUCET_AMOUNT,
            COOLDOWN_PERIOD
        );
    }
    
    /**
     * @dev Refill the faucet with more tokens (owner only)
     * @param amount Amount of tokens to add to faucet
     */
    function refillFaucet(uint256 amount) external onlyOwner {
        require(amount > 0, "Faucet: Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Faucet: Insufficient balance");
        
        _transfer(msg.sender, address(this), amount);
        
        emit FaucetRefilled(msg.sender, amount);
    }
    
    /**
     * @dev Emergency function to withdraw all tokens from faucet (owner only)
     * @param recipient Address to receive the tokens
     */
    function emergencyWithdraw(address recipient) external onlyOwner {
        require(recipient != address(0), "Faucet: Invalid recipient");
        
        uint256 faucetBalance = balanceOf(address(this));
        require(faucetBalance > 0, "Faucet: No tokens to withdraw");
        
        _transfer(address(this), recipient, faucetBalance);
    }
    
    /**
     * @dev Get user's last request time
     * @param user Address to check
     * @return Last request timestamp
     */
    function getLastRequestTime(address user) external view returns (uint256) {
        return lastRequestTime[user];
    }
}
