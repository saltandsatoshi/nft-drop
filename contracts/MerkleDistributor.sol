// SPDX-License-Identifier: UNLICENSED
pragma solidity >= 0.6.0 <0.8.0;

import "@openzeppelin/contracts/cryptography/MerkleProof.sol";
import "./I_MerkleDistributor.sol";
import "./I_ERC721.sol";

contract MerkleDistributor is I_MerkleDistributor {

    uint256 public nftId = 0;
    address public immutable override nft;
    bytes32 public immutable override merkleRoot;

    // This is a packed array of booleans.
    mapping(uint256 => uint256) private claimedBitMap;

    constructor(address _nft, bytes32 _merkleRoot) public {
        nft = _nft;
        merkleRoot = _merkleRoot;
    }

    function isClaimed(uint256 index) public view override returns (bool) {
        uint256 claimedWordIndex = index / 256;
        uint256 claimedBitIndex = index % 256;
        uint256 claimedWord = claimedBitMap[claimedWordIndex];
        uint256 mask = (1 << claimedBitIndex);
        return claimedWord & mask == mask;
    }

    function _setClaimed(uint256 index) private {
        uint256 claimedWordIndex = index / 256;
        uint256 claimedBitIndex = index % 256;
        claimedBitMap[claimedWordIndex] = claimedBitMap[claimedWordIndex] | (1 << claimedBitIndex);
    }

    function claim(uint256 index, address account, uint256 amount, bytes32[] calldata merkleProof) external override {
        require(msg.sender == account, 'claim: Only account may withdraw'); // self-request only
        require(!isClaimed(index), 'MerkleDistributor: Drop already claimed.');

        // Verify the merkle proof.
        bytes32 node = keccak256(abi.encodePacked(index, account, amount));
        require(MerkleProof.verify(merkleProof, merkleRoot, node), 'MerkleDistributor: Invalid proof.');

        // Send the NFT
        require(I_ERC721(nft)).transferFrom(address(this), account, ++nftId, 'MerkleDistributor: TransferFrom failed');

        // Mark address as claimed
        _setClaimed(index);
        
        emit Claimed(index, account, idCount);
    }
}
