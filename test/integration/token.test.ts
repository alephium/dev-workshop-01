import { web3, Project, stringToHex, ONE_ALPH, DUST_AMOUNT } from '@alephium/web3'
import { testNodeWallet } from '@alephium/web3-test'
import { TokenFaucet, Withdraw } from '../../artifacts/ts'

describe('integration tests', () => {
  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
    await Project.build()
  })

  it('should test TokenFaucet', async () => {
    const signer = await testNodeWallet()
    const totalSupply = 100n
    const deployResult = await TokenFaucet.deploy(
      signer,
      {
        issueTokenAmount: totalSupply,
        initialFields: {
          symbol: stringToHex('TF'),
          name: stringToHex('TokenFaucet'),
          decimals: 0n,
          supply: totalSupply,
          balance: totalSupply
        }
      }
    )

    const tokenFaucet = deployResult.contractInstance
    // Method calls
    const getDecimalResult = await tokenFaucet.methods.getDecimals()
    expect(getDecimalResult.returns).toEqual(0n)

    const getTotalSupplyResult = await tokenFaucet.methods.getTotalSupply()
    expect(getTotalSupplyResult.returns).toEqual(100n)

    const multicallResult = await tokenFaucet.multicall({
      getTotalSupply: {},
      getSymbol: {},
      getName: {},
      getDecimals: {},
      getBalance: {}
    })
    expect(multicallResult.getDecimals.returns).toEqual(0n)
    expect(multicallResult.getTotalSupply.returns).toEqual(totalSupply)
    expect(multicallResult.getSymbol.returns).toEqual(stringToHex('TF'))
    expect(multicallResult.getName.returns).toEqual(stringToHex('TokenFaucet'))
    expect(multicallResult.getBalance.returns).toEqual(totalSupply)

    // States
    const tokenFaucetStates = await tokenFaucet.fetchState()
    expect(tokenFaucetStates.fields.decimals).toEqual(0n)
    expect(tokenFaucetStates.fields.supply).toEqual(totalSupply)
    expect(tokenFaucetStates.fields.balance).toEqual(totalSupply)
    expect(tokenFaucetStates.fields.symbol).toEqual(stringToHex('TF'))
    expect(tokenFaucetStates.fields.name).toEqual(stringToHex('TokenFaucet'))


    // Balance
    const balanceResult = await signer.nodeProvider.addresses.getAddressesAddressBalance(tokenFaucet.address)
    expect(balanceResult.tokenBalances).toEqual([{ id: tokenFaucet.contractId, amount: '100' }])
    expect(BigInt(balanceResult.balance)).toEqual(ONE_ALPH)

    const initialBalance = tokenFaucetStates.fields.balance
    // Call `withdraw` function 10 times
    for (let i = 0; i < 10; i++) {
      await Withdraw.execute(signer, {
        initialFields: { token: tokenFaucet.contractId, amount: 1n },
        attoAlphAmount: DUST_AMOUNT
      })

      const newState = await tokenFaucet.fetchState()
      const newBalance = newState.fields.balance
      expect(newBalance).toEqual(initialBalance - BigInt(i) - 1n)
    }
  })
})
