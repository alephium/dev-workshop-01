import { FC, useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import { useAlephiumConnectContext } from '@alephium/web3-react'
import { web3 } from '@alephium/web3'
import { TokenFaucetConfig, tokenFaucetConfig } from '@/services/utils'
import { TokenFaucet } from 'artifacts/ts'

export const TokenDapp: FC<{
  config: TokenFaucetConfig
}> = ({ config }) => {
  const context = useAlephiumConnectContext()
  const [balance, setBalance] = useState<string | undefined>(undefined)

  useEffect(() => {
    const handler = async () => {
      const nodeProvider = context.signerProvider?.nodeProvider
      if (nodeProvider) {
        web3.setCurrentNodeProvider(nodeProvider)
        const tokenFaucet = TokenFaucet.at(tokenFaucetConfig.tokenFaucetAddress)
        const balanceResult = await tokenFaucet.methods.getBalance()
        setBalance(balanceResult.returns.toString())
      }
    }

    handler()
  }, [context.signerProvider?.nodeProvider, tokenFaucetConfig.tokenFaucetAddress])

  const addressGroup = config.groupIndex
  return (
    <>
      <div className="columns">
        <form>
          <>
            <h2 className={styles.title}>Alephium Token Faucet on {config.network}</h2>
            <p>PublicKey: {context.account?.publicKey ?? '???'}</p>
            <p>Maximum 2 tokens can be withdrawn at a time.</p>
            <table>
              <thead>
                <tr>
                  <td>id</td>
                  <th>group</th>
                  <th>balance</th>
                </tr>
              </thead>
              <tbody>
                <tr key={addressGroup} style={{ background: 'red', color: 'white' }}>
                  <td>{config.faucetTokenId}</td>
                  <td>{addressGroup}</td>
                  <td>{balance ? balance : '??'}</td>
                </tr>
              </tbody>
            </table>
          </>
        </form>
      </div>
    </>
  )
}
