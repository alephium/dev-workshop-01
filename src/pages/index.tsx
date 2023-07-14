import Head from 'next/head'
import Image from 'next/image'
import { TokenDapp } from '@/components/TokenDapp'

export default function Home() {
  return (
    <>
      <Head>
        <title>Welcome to the Dev Workshop!</title>
        <meta name="description" content="Demo app for the Alephium dev workshop" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TokenDapp />
    </>
  )
}
