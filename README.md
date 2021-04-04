## $SALTY Merkle Drop

This repo contains scripts + data used to merkle drop the saltandsatoshi NFT for sending 69 $SALTY to a friend, and users that purchased the BTC hoodie.

### Todo
* [x] Decide if we include ETH hoodie buyers in the drop
    * [x] Export addresses who purchased ETH hoodies
* [x] Fetch addresses involved in BTC hoodie purchases
    * [x] Export addresses who purchased BTC hoodies
* [x] Compile BTC hoodie addresses w/ 69 $SALTY senders
* [ ] Add `TestERC1155.json`
* [ ] Figure out if `..._flat.sol` file is needed
* [ ] Update front end to send ERC115s instead of ERC20s
    * [ ] Test
* [ ] Deployment
    * [ ] Deploy claims contract
    * [ ] setApprovalForAll() from SaltDAO address to claims contract
* [ ] Display NFT in front end
* [ ] Update `frontend/src/data/constants.js`
* [ ] Update `frontend/src/components/airdrop/index.js`
* [ ] Update `frontend/src/components/footer/medias.js`
* [ ] Update sources on `frontend/src/components/footer/Footer.js`
* [ ] Update sources on `frontend/src/services/airdrop_contract.ts`
* [ ] Add relevant sources to `frontend/src/components/footer/medias.js`
* [ ] Update imports using dotenv & .env
* [ ] Draft (Medium?) announcement of NFT drop