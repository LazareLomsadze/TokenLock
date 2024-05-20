// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract VestingWallet is Context, Ownable {
    using SafeERC20 for IERC20;

    event EtherReleased(uint256 amount);
    event ERC20Released(address indexed token, uint256 amount);

    uint256 private _released;
    mapping(address => uint256) private _erc20Released;
    uint64 private immutable _start;
    uint64 private immutable _duration;

    string private _tokenName;
    string private _tokenSymbol;
    uint256 private _tokenInitialSupply;

    constructor(
        address beneficiary,
        uint64 startTimestamp,
        uint64 durationSeconds,
        string memory tokenName,
        string memory tokenSymbol,
        uint256 tokenInitialSupply
    ) payable Ownable(beneficiary) {
        _start = startTimestamp;
        _duration = durationSeconds;
        _tokenName = tokenName;
        _tokenSymbol = tokenSymbol;
        _tokenInitialSupply = tokenInitialSupply;
    }

    receive() external payable virtual {}

    function start() public view virtual returns (uint256) {
        return _start;
    }

    function duration() public view virtual returns (uint256) {
        return _duration;
    }

    function end() public view virtual returns (uint256) {
        return start() + duration();
    }

    function released() public view virtual returns (uint256) {
        return _released;
    }

    function released(address token) public view virtual returns (uint256) {
        return _erc20Released[token];
    }

    function releasable() public view virtual returns (uint256) {
        return vestedAmount(uint64(block.timestamp)) - released();
    }

    function releasable(address token) public view virtual returns (uint256) {
        return vestedAmount(token, uint64(block.timestamp)) - released(token);
    }

    function release() public virtual {
        uint256 amount = releasable();
        _released += amount;
        emit EtherReleased(amount);
        Address.sendValue(payable(owner()), amount);
    }

    function release(address token) public virtual {
        uint256 amount = releasable(token);
        _erc20Released[token] += amount;
        emit ERC20Released(token, amount);
        IERC20(token).safeTransfer(owner(), amount);
    }

    function vestedAmount(uint64 timestamp) public view virtual returns (uint256) {
        return _vestingSchedule(address(this).balance + released(), timestamp);
    }

    function vestedAmount(address token, uint64 timestamp) public view virtual returns (uint256) {
        return _vestingSchedule(IERC20(token).balanceOf(address(this)) + released(token), timestamp);
    }

    function _vestingSchedule(uint256 totalAllocation, uint64 timestamp) internal view virtual returns (uint256) {
        if (timestamp < start()) {
            return 0;
        } else if (timestamp >= end()) {
            return totalAllocation;
        } else {
            return (totalAllocation * (timestamp - start())) / duration();
        }
    }

    function tokenName() public view returns (string memory) {
        return _tokenName;
    }

    function tokenSymbol() public view returns (string memory) {
        return _tokenSymbol;
    }

    function tokenInitialSupply() public view returns (uint256) {
        return _tokenInitialSupply;
    }
}
