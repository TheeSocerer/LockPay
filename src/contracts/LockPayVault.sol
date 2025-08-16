// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.20;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// contract LockPayVault {
//     IERC20 public stableToken;

//     struct Lock {
//         address locker;
//         bytes32 recipientHash; // keccak(phone + pin)
//         uint256 amount;
//         bool redeemed;
//         uint256 expiration; // timestamp
//     }

//     uint256 public nextLockId = 1;
//     mapping(uint256 => Lock) public locks;

//     event Locked(uint256 lockId, address locker, uint256 amount);
//     event Redeemed(uint256 lockId, address redeemer, uint256 amount);

//     constructor(IERC20 _stableToken) {
//         stableToken = _stableToken;
//     }

//     function lockFunds(bytes32 recipientHash, uint256 amount, uint256 lockDuration) external {
//         require(amount > 0, "Amount must be > 0");
//         stableToken.transferFrom(msg.sender, address(this), amount);

//         locks[nextLockId] = Lock({
//             locker: msg.sender,
//             recipientHash: recipientHash,
//             amount: amount,
//             redeemed: false,
//             expiration: block.timestamp + lockDuration
//         });

//         emit Locked(nextLockId, msg.sender, amount);
//         nextLockId++;
//     }

//     function redeemFunds(string memory phone, string memory pin) external {
//         bytes32 hashValue = keccak256(abi.encodePacked(phone, pin));

//         for (uint256 i = 1; i < nextLockId; i++) {
//             Lock storage l = locks[i];
//             if (!l.redeemed && l.recipientHash == hashValue && l.expiration >= block.timestamp) {
//                 l.redeemed = true;
//                 stableToken.transfer(msg.sender, l.amount);
//                 emit Redeemed(i, msg.sender, l.amount);
//                 return;
//             }
//         }

//         revert("No valid lock found for this phone + PIN");
//     }

//     function refundExpired(uint256 lockId) external {
//         Lock storage l = locks[lockId];
//         require(block.timestamp > l.expiration, "Lock not expired");
//         require(!l.redeemed, "Already redeemed");

//         l.redeemed = true;
//         stableToken.transfer(l.locker, l.amount);
//     }
// }
