pragma solidity >= 0.6.0 <0.8.0;

/// @dev Interface of the ERC1155 standard with only the functsions we need
///      https://eips.ethereum.org/EIPS/eip-1155

interface I_ERC1155 {
    function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _value, bytes calldata _data) external;
}