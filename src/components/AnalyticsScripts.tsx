import Script from 'next/script';
import type { OfficeSettings } from '@prisma/client';

type AnalyticsProps = {
  // Pass only the required properties from the settings object
  settings: Pick<
    OfficeSettings,
    | 'gtmEnabled'
    | 'gtmContainerId'
    | 'ga4Enabled'
    | 'ga4MeasurementId'
    | 'facebookPixelEnabled'
    | 'facebookPixelId'
    | 'googleAdsEnabled'
    | 'googleAdsId'
  >;
};

const AnalyticsScripts = ({ settings }: AnalyticsProps) => {
  const {
    gtmEnabled,
    gtmContainerId,
    ga4Enabled,
    ga4MeasurementId,
    facebookPixelEnabled,
    facebookPixelId,
    googleAdsEnabled,
    googleAdsId,
  } = settings;

  return (
    <>
      {/* Google Tag Manager */}
      {gtmEnabled && gtmContainerId && (
        <>
          <Script
            id="gtm-script"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmContainerId}');
              `,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmContainerId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}

      {/* 
        Google Analytics 4 (Direct). 
        WARNING: If Google Tag Manager (GTM) is also enabled and configured to send GA4 data,
        this direct implementation might lead to double-counting.
        It's generally recommended to configure GA4 through GTM if GTM is in use.
      */}
      {ga4Enabled && ga4MeasurementId && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}`}
          />
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${ga4MeasurementId}');
              `,
            }}
          />
        </>
      )}

      {/* Facebook Pixel */}
      {facebookPixelEnabled && facebookPixelId && (
        <>
          <Script
            id="fb-pixel-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${facebookPixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${facebookPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* Google Ads */}
      {googleAdsEnabled && googleAdsId && (
        <>
          <Script
            strategy="beforeInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
          />
          <Script
            id="google-ads-init"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAdsId}');
              `,
            }}
          />
        </>
      )}
    </>
  );
};

export default AnalyticsScripts;


        