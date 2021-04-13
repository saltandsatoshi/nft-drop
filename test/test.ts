import chai, { expect } from 'chai'
import { solidity, MockProvider, deployContract } from 'ethereum-waffle'
import { Contract, BigNumber, constants } from 'ethers'
import BalanceTree from '../src/balance-tree'

import Distributor from '../build/MerkleDistributor.json'
// TODO: import
import TestERC1155 from '../build/TestERC1155.json'
import { parseBalanceMap } from '../src/parse-balance-map'

chai.use(solidity)

const overrides = {
  gasLimit: 9999999,
  gasPrice: 100
}

const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000'
const URI_CONSTRUCTOR = 'Constructor URI string'
const URI_NEW = 'New URI string'

describe('MerkleDistributor', () => {
  const provider = new MockProvider({
    ganacheOptions: {
      hardfork: 'istanbul',
      mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
      gasLimit: 9999999,
    },
  })

  const wallets = provider.getWallets()
  const [wallet0, wallet1, wallet2] = wallets

  let token: Contract
  beforeEach('deploy token', async () => {
    
    token = await deployContract(wallet0, TestERC1155, [URI_CONSTRUCTOR], overrides)
  })

  describe('#merkleRoot', () => {
    it('returns the zero merkle root', async () => {
      const distributor = await deployContract(wallet0, Distributor, [token.address, ZERO_BYTES32], overrides)
      expect(await distributor.merkleRoot()).to.eq(ZERO_BYTES32)
    })
  })

  describe('#claim', () => {
    it('fails for empty proof', async () => {
      const distributor = await deployContract(wallet0, Distributor, [token.address, ZERO_BYTES32], overrides)
      await expect(distributor.claim(0, wallet1.address, 10, [])).to.be.revertedWith(
        'MerkleDistributor: Invalid proof.'
      )
    })

    it('fails for invalid index', async () => {
      const distributor = await deployContract(wallet0, Distributor, [token.address, ZERO_BYTES32], overrides)
      await expect(distributor.claim(0, wallet1.address, 10, [])).to.be.revertedWith(
        'MerkleDistributor: Invalid proof.'
      )
    })

    describe('two account tree', () => {
      let distributor: Contract
      let tree: BalanceTree
      beforeEach('deploy', async () => {
        tree = new BalanceTree([
          { account: wallet1.address, amount: BigNumber.from(1) },
          { account: wallet2.address, amount: BigNumber.from(1) },
        ])
        distributor = await deployContract(wallet0, Distributor, [token.address, tree.getHexRoot()], overrides)
        // Mint batch of tokens - NOTE: See TEST_ERC1155.sol for argument information
        await token.mintBatch(wallet0.address, [1,2], [BigNumber.from(1),BigNumber.from(1)], "0x00", overrides)
        // Approve distributor to send the erc1155 tokens to claimers
        // await token.setApprovalForAll(wallet0.address, true, overrides)
        await token.setApprovalForAll(distributor.address, true, overrides)
        // await token.setApprovalForAll("0x17ec8597ff92C3F44523bDc65BF0f1bE632917ff", true, overrides)
      })

      it('successful claim', async () => {
        const proof0 = tree.getProof(0, wallet1.address, BigNumber.from(1))
        await expect(distributor.claim(0, wallet1.address, BigNumber.from(1), proof0, overrides))
          .to.emit(distributor, 'Claimed')
          .withArgs(0, wallet1.address, 1)
        const proof1 = tree.getProof(1, wallet2.address, BigNumber.from(1))
        await expect(distributor.claim(1, wallet2.address, BigNumber.from(1), proof1, overrides))
          .to.emit(distributor, 'Claimed')
          .withArgs(1, wallet2.address, 2)
      })

      it('transfers the token', async () => {
        const proof0 = tree.getProof(0, wallet1.address, BigNumber.from(1))
        expect(await token.balanceOf(wallet1.address, 1)).to.eq(0)
        await distributor.claim(0, wallet1.address, 1, proof0, overrides)
        expect(await token.balanceOf(wallet1.address, 1)).to.eq(1)
      })

      it('must have enough to transfer', async () => {
        const proof0 = tree.getProof(0, wallet1.address, BigNumber.from(1))
        await token.burnBatch(wallet0.address, [1,2], [1,1], overrides);
        // await token.setBalance(distributor.address, 99)
        await expect(distributor.claim(0, wallet1.address, 1, proof0, overrides)).to.be.revertedWith(
          'ERC1155: transfer amount exceeds balance'
        )
      })

      it('sets #isClaimed', async () => {
        const proof0 = tree.getProof(0, wallet1.address, BigNumber.from(1))
        expect(await distributor.isClaimed(0)).to.eq(false)
        expect(await distributor.isClaimed(1)).to.eq(false)
        await distributor.claim(0, wallet1.address, 100, proof0, overrides)
        expect(await distributor.isClaimed(0)).to.eq(true)
        expect(await distributor.isClaimed(1)).to.eq(false)
      })

      it('cannot allow two claims', async () => {
        const proof0 = tree.getProof(0, wallet1.address, BigNumber.from(1))
        await distributor.claim(0, wallet1.address, 1, proof0, overrides)
        await expect(distributor.claim(0, wallet1.address, 1, proof0)).to.be.revertedWith(
          'MerkleDistributor: Drop already claimed.'
        )
      })

      it('cannot claim more than once: 0 and then 1', async () => {
        await distributor.claim(0, wallet1.address, 1, tree.getProof(0, wallet1.address, BigNumber.from(1)), overrides)
        await distributor.claim(1, wallet2.address, 1, tree.getProof(1, wallet2.address, BigNumber.from(1)), overrides)

        await expect(
          distributor.claim(0, wallet1.address, 1, tree.getProof(0, wallet1.address, BigNumber.from(1)), overrides)
        ).to.be.revertedWith('MerkleDistributor: Drop already claimed.')
      })

      it('cannot claim more than once: 1 and then 0', async () => {
        await distributor.claim(
          1,
          wallet2.address,
          1,
          tree.getProof(1, wallet2.address, BigNumber.from(1)),
          overrides
        )
        await distributor.claim(0, wallet1.address, 1, tree.getProof(0, wallet1.address, BigNumber.from(1)), overrides)

        await expect(
          distributor.claim(1, wallet2.address, 1, tree.getProof(1, wallet2.address, BigNumber.from(1)), overrides)
        ).to.be.revertedWith('MerkleDistributor: Drop already claimed.')
      })

      it('cannot claim for address other than proof', async () => {
        const proof0 = tree.getProof(0, wallet1.address, BigNumber.from(1))
        await expect(distributor.claim(1, wallet2.address, 1, proof0, overrides)).to.be.revertedWith(
          'MerkleDistributor: Invalid proof.'
        )
      })

      it('cannot claim more than proof', async () => {
        const proof0 = tree.getProof(0, wallet1.address, BigNumber.from(1))
        await expect(distributor.claim(0, wallet1.address, 2, proof0, overrides)).to.be.revertedWith(
          'MerkleDistributor: Invalid proof.'
        )
      })
    })
    describe('larger tree', () => {
      let distributor: Contract
      let tree: BalanceTree
      beforeEach('deploy', async () => {
        tree = new BalanceTree(
          wallets.map((wallet, ix) => {
            return { account: wallet.address, amount: BigNumber.from(1) }
          })
        )
        distributor = await deployContract(wallet0, Distributor, [token.address, tree.getHexRoot()], overrides)

        await token.mintBatch(wallet0.address, [1,2,3,4,5,6,7,8,9,10], [1,1,1,1,1,1,1,1,1,1], '0x00', overrides)
        await token.setApprovalForAll(wallet0.address, true, overrides)
        await token.setApprovalForAll(distributor.address, true, overrides)
      })

      it('claim index 4', async () => {
        const proof = tree.getProof(4, wallets[4].address, BigNumber.from(1))
        await expect(distributor.claim(4, wallets[4].address, 1, proof, overrides))
          .to.emit(distributor, 'Claimed')
          .withArgs(4, wallets[4].address, 1)
      })

      it('claim index 9', async () => {
        const proof = tree.getProof(9, wallets[9].address, BigNumber.from(1))
        await expect(distributor.claim(9, wallets[9].address, 1, proof, overrides))
          .to.emit(distributor, 'Claimed')
          .withArgs(9, wallets[9].address, 2)
      })
    })

    describe('realistic size tree', () => {
      let distributor: Contract
      let tree: BalanceTree
      const NUM_LEAVES = 100_000
      const NUM_SAMPLES = 25
      const elements: { account: string; amount: BigNumber }[] = []
      for (let i = 0; i < NUM_LEAVES; i++) {
        const node = { account: wallet0.address, amount: BigNumber.from(1) }
        elements.push(node)
      }
      tree = new BalanceTree(elements)

      it('proof verification works', () => {
        const root = Buffer.from(tree.getHexRoot().slice(2), 'hex')
        for (let i = 0; i < NUM_LEAVES; i += NUM_LEAVES / NUM_SAMPLES) {
          const proof = tree
            .getProof(i, wallet0.address, BigNumber.from(1))
            .map((el) => Buffer.from(el.slice(2), 'hex'))
          const validProof = BalanceTree.verifyProof(i, wallet0.address, BigNumber.from(1), proof, root)
          expect(validProof).to.be.true
        }
      })

      beforeEach('deploy', async () => {
        distributor = await deployContract(wallet0, Distributor, [token.address, tree.getHexRoot()], overrides)
        await token.mintBatch(wallet0.address, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], '0x00', overrides)
        await token.setApprovalForAll(distributor.address, true, overrides)
        await token.setApprovalForAll(wallet0.address, true, overrides)
      })
      it('no double claims in random distribution', async () => {
        for (let i = 0; i < 10; i += Math.floor(Math.random() * (NUM_LEAVES / NUM_SAMPLES))) {
          const proof = tree.getProof(i, wallet0.address, BigNumber.from(1))
          await distributor.claim(i, wallet0.address, 1, proof, overrides)
          await expect(distributor.claim(i, wallet0.address, 1, proof)).to.be.revertedWith(
            'MerkleDistributor: Drop already claimed.'
          )
        }
      })
    })
  })

  describe('parseBalanceMap', () => {
    let distributor: Contract
    let claims: {
      [account: string]: {
        index: number
        amount: string
        proof: string[]
      }
    }
    beforeEach('deploy', async () => {
      const { claims: innerClaims, merkleRoot, tokenTotal } = parseBalanceMap({
        [wallet0.address]: 1,
        [wallet1.address]: 1,
        [wallets[2].address]: 1,
      })
      expect(tokenTotal).to.eq('0x03') // 3
      claims = innerClaims
      distributor = await deployContract(wallet0, Distributor, [token.address, merkleRoot], overrides)
      // await token.setBalance(distributor.address, tokenTotal)
      await token.mintBatch(wallet0.address, [1,2,3], [1,1,1], '0x00', overrides);
      await token.setApprovalForAll(wallet0.address, true, overrides)
      await token.setApprovalForAll(distributor.address, true, overrides)
    })

    // TODO: validate proofs
    it('check the proofs is as expected', () => {
      expect(claims).to.deep.eq({
        [wallet0.address]: {
          index: 0,
          amount: '0x01',
          proof: ['0x1c1de3d8934bf14f7f3cd1f0bc5e29e4d3e897931acb98408369b9ea82f119a3'],
        },
        [wallet1.address]: {
          index: 1,
          amount: '0x01',
          proof: [
            '0x60c8a8ae68b05c4d47e80a80c5fa77ca19925f1d62b6f573d3ff3b2f396ec424',
            '0xe856977c80afb96a13660fbc56b632fe7ace5a15c7ed11d51e48ede138c0908e',
          ],
        },
        [wallets[2].address]: {
          index: 2,
          amount: '0x01',
          proof: [
            '0x85e6a399a5e8296a055e7723d96926edc336fb19a661b6ecfae820ef109d1709',
            '0xe856977c80afb96a13660fbc56b632fe7ace5a15c7ed11d51e48ede138c0908e',
          ],
        },
      })
    })
    it('all claims work exactly once', async () => {
      for (let account in claims) {
        const claim = claims[account]
        await expect(distributor.claim(claim.index, account, claim.amount, claim.proof, overrides))
          .to.emit(distributor, 'Claimed')
          .withArgs(claim.index, account, claim.amount)
        await expect(distributor.claim(claim.index, account, claim.amount, claim.proof, overrides)).to.be.revertedWith(
          'MerkleDistributor: Drop already claimed.'
        )
      }
      // TODO: doublecheck this
      expect(await token.balanceOf(distributor.address)).to.eq(0)
    })
  })
})
