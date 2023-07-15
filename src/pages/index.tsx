import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import { TokenDapp } from '@/components/TokenDapp'
import { AlephiumConnectButton, useAccount } from '@alephium/web3-react'

export default function Home() {
  const { account } = useAccount()

  return (
    <>
      <div className={styles.container}>
        <AlephiumConnectButton />
        <Head>
          <title>Welcome to the Dev Workshop!</title>
          <meta name="description" content="Demo app for the Alephium dev workshop" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        {!!account && (
          <div>{account.address}</div>
        )}
        <TokenDapp />
      </div>
    </>
  )
}
