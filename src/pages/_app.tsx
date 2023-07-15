import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { AlephiumConnectProvider } from '@alephium/web3-react'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AlephiumConnectProvider useTheme="web95" network={'devnet'} addressGroup={0}>
      <Component {...pageProps} />
    </AlephiumConnectProvider>
  )
}
