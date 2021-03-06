pragma solidity ^0.6.0;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';

// NOTE: based on https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/mocks/ERC1155Mock.sol
contract TestERC1155 is ERC1155 {
    
    constructor (string memory uri) ERC1155(uri) public {
        // solhint-disable-previous-line no-empty-blocks
    }

    function setURI(string memory newuri) public {
        _setURI(newuri);
    }

    function mint(address to, uint256 id, uint256 value, bytes memory data) public {
        _mint(to, id, value, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory values, bytes memory data) public {
        _mintBatch(to, ids, values, data);
    }

    function burn(address owner, uint256 id, uint256 value) public {
        _burn(owner, id, value);
    }

    function burnBatch(address owner, uint256[] memory ids, uint256[] memory values) public {
        _burnBatch(owner, ids, values);
    }
}