// @ts-nocheck
import React from "react";
import type { Metadata } from 'next';
import "@/index.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: 'Carspian Seller - Auto Parts Marketplace',
  description: 'Sell your auto parts on our marketplace. Join thousands of sellers who trust Carspian Seller.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="/env-config.js" />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var b=document.body,c=document.documentElement; if(b){b.removeAttribute('data-new-gr-c-s-check-loaded');b.removeAttribute('data-gr-ext-installed');} if(c){c.removeAttribute('data-new-gr-c-s-check-loaded');c.removeAttribute('data-gr-ext-installed');}}catch(e){} })();` }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
