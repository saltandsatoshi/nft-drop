pragma solidity >= 0.6.0 <0.8.0;

/// @dev Interface of the ERC721 standard with only the funcions we need
interface I_ERC1155 {
    function transferFrom(address _from, address _to, uint256 _tokenId) external payable;
}