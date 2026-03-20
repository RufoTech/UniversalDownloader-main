import Script from 'next/script';

interface Props {
  data: any;
}

export default function JsonLd({ data }: Props) {
  return (
    <Script
      id={`json-ld-${Math.random().toString(36).substring(7)}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      strategy="afterInteractive"
    />
  );
}
