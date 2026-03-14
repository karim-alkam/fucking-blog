import { Metadata } from 'next';
import { SITE_CONFIG, BASE_URL } from '../lib/constants';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: "CONTACT_UPLINK",
  description: "Get in touch with Karim Alkam. Open for project inquiries and tech discussions.",
  openGraph: {
    title: "CONTACT_UPLINK // KARIM",
    description: "Get in touch with Karim Alkam. Open for project inquiries and tech discussions.",
    url: `${BASE_URL}/contact`,
    siteName: SITE_CONFIG.title,
    images: [
      {
        url: '/A-logo-w-bg.png',
        width: 4096,
        height: 4096,
        alt: 'Karim Alkam - Contact',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "CONTACT_UPLINK // KARIM",
    description: "Get in touch with Karim Alkam. Open for project inquiries and tech discussions.",
    images: ['/A-logo-w-bg.png'],
    creator: SITE_CONFIG.twitterHandle,
  },
};

export default function ContactPage() {
  return <ContactForm />;
}
