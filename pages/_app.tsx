import type { AppProps } from 'next/app'
import { type ReactElement } from 'react'
import '../style.css';
import Script from 'next/script'

export default function App({ Component, pageProps }: AppProps): ReactElement {
  // useEffect(() => {
  //   document.documentElement.classList.add('dark')
  // }, []);

  return (<>
    {/* <Head>
    </Head > */}

    {/* Google tag (gtag.js)  */}
    <Script async src="https://www.googletagmanager.com/gtag/js?id=G-6TBDVG42YZ"></Script>
    <Script>
      {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-6TBDVG42YZ');
     `}
    </Script>

    <Component {...pageProps} />
  </>)
}
