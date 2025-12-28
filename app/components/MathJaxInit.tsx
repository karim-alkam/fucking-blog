'use client';

import Script from 'next/script';

export default function MathJaxInit() {
    return (
        <>
            <Script
                id="MathJax-config"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            window.MathJax = {
              tex: {
                inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
                displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
              },
              svg: {
                fontCache: 'global'
              }
            };
          `,
                }}
            />
            <Script
                id="MathJax-script"
                src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
                strategy="afterInteractive"
            />
        </>
    );
}
