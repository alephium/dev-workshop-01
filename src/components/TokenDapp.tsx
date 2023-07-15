import { FC, useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import { useAlephiumConnectContext } from '@alephium/web3-react'
import { node, web3 } from '@alephium/web3'
import { TokenFaucetConfig, tokenFaucetConfig } from '@/services/utils'
import { withdrawToken } from '@/services/token.service'
import { TokenFaucet } from 'artifacts/ts'
import { TxStatus } from './TxStatus'

export const TokenDapp: FC<{
  config: TokenFaucetConfig
}> = ({ config }) => {
  const context = useAlephiumConnectContext()
  const addressGroup = config.groupIndex
  const [balance, setBalance] = useState<string | undefined>(undefined)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [ongoingTxId, setOngoingTxId] = useState<string>()

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!!context.signerProvider) {
      const result = await withdrawToken(context.signerProvider, withdrawAmount, config.faucetTokenId)
      setOngoingTxId(result.txId)
    }
  }

  const txStatusCallback = (status: node.TxStatus, numberOfChecks: number): Promise<any> => {
    if (
      (status.type === 'Confirmed' && numberOfChecks > 2) ||
      (status.type === 'TxNotFound' && numberOfChecks > 3)
    ) {
      setOngoingTxId(undefined)
    }

    return Promise.resolve()
  }

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
  }, [context.signerProvider?.nodeProvider, tokenFaucetConfig.tokenFaucetAddress, ongoingTxId])

  return (
    <>
      {ongoingTxId && <TxStatus txId={ongoingTxId} txStatusCallback={txStatusCallback} />}

      <div className="columns">
        <form onSubmit={handleWithdrawSubmit}>
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
            <label htmlFor="withdraw-amount">Amount</label>
            <input
              type="number"
              id="transfer-amount"
              name="amount"
              max="2"
              min="1"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <br />
            <input type="submit" disabled={!!ongoingTxId} value="Send Me Token" />
          </>
        </form>
      </div>
    </>
  )
}
