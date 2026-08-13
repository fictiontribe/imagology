const NAV = [
  { label: 'Imagology', href: null },
  { label: 'ShotVault', href: 'https://shotvault.fictiontribe.com' },
  { label: 'Shotcaller', href: 'https://shotcaller.fictiontribe.com' },
  { label: 'StitchBox', href: 'https://stitchbox.fictiontribe.com' },
  { label: 'Glyphforge', href: 'https://glyphforge.fictiontribe.com' },
]

export function Footer() {
  return (
    <footer className="mt-4 bg-[#0F172A] px-6 py-12 text-white lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div>
          <p className="font-mono text-[13px] uppercase tracking-[0.15em]">
            イマゴロジー — Imagology
          </p>
          <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-white/70">
            Built to show what brand-controlled image generation looks like. Dial in a look,
            compose the prompt — the taste is in the guardrails.
          </p>
        </div>
        <div className="flex flex-col items-end gap-3.5">
          <span className="select-none font-mono text-[11px] uppercase tracking-[0.15em] text-white/55">
            Running on Gemini 3.6 Flash
          </span>
          <a
            href="https://fictiontribe.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="A product of Fiction Tribe"
            className="group flex items-center gap-3 text-white/75 transition-colors duration-[250ms] ease-ft hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ft-purple/40 rounded"
          >
            <span className="select-none font-mono text-[11px] uppercase tracking-[0.18em]">A product of</span>
            <svg
          className="h-3.5 w-auto"
          viewBox="0 0 227 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Fiction Tribe"
        >
          <g clipPath="url(#ftm_clip)">
            <path d="M6.33063 5.6011V7.40413H18.0284V12.693H6.33063V17.1422H0V0.310516H18.0165V5.6011H6.33063Z" fill="currentColor" />
            <path d="M27.9832 17.0704H21.6543V0.240402H27.9832V17.0704Z" fill="currentColor" />
            <path d="M41.6131 0.00500488C48.4289 0.00500488 51.9839 2.36064 52.2527 7.67459H45.7767C45.5315 6.08692 44.2908 5.29391 41.6131 5.29391C37.8655 5.29391 37.2316 6.85655 37.2316 8.63287C37.2316 10.4092 37.8891 12.0236 41.6131 12.0236C44.2908 12.0236 45.5315 11.2055 45.7767 9.59449H52.2527C51.9839 14.9368 48.4543 17.3125 41.6131 17.3125C34.1144 17.3125 30.9009 14.4994 30.9009 8.6312C30.9009 2.76298 34.1144 0.00500488 41.6131 0.00500488Z" fill="currentColor" />
            <path d="M75.8611 5.52931H68.5568V17.0704H62.2278V5.52931H54.9235V0.240402H75.8611V5.52931Z" fill="currentColor" />
            <path d="M85.3477 17.0704H79.0188V0.240402H85.3477V17.0704Z" fill="currentColor" />
            <path d="M88.2637 8.63121C88.2637 2.78803 91.4755 0 98.9759 0C106.476 0 109.688 2.81307 109.688 8.63121C109.688 14.4493 106.449 17.3125 98.9759 17.3125C91.5025 17.3125 88.2637 14.4978 88.2637 8.63121ZM103.359 8.63121C103.359 6.87659 102.725 5.29225 98.9759 5.29225C95.2265 5.29225 94.5943 6.85488 94.5943 8.63121C94.5943 10.4075 95.2519 12.0219 98.9759 12.0219C102.7 12.0219 103.359 10.4109 103.359 8.63121Z" fill="currentColor" />
            <path d="M134.804 0.240402L134.875 6.33734L123.438 13.4126L119.176 7.14036V17.0337L116.845 17.0754H112.846V0.240402H121.129L128.482 10.1705V0.240402H134.804Z" fill="currentColor" />
            <path d="M148.732 15.8985H141.429V27.4396H135.1V15.8985H127.399L136.01 10.6079H148.73V15.8985H148.732Z" fill="currentColor" />
            <path d="M168.784 22.6064L171.803 27.4396H164.304L161.937 23.4963H158.218V27.4396H151.888V10.6079H165.278C169.149 10.6079 171.803 13.3007 171.803 17.0521C171.803 19.5045 170.658 21.5246 168.784 22.6064ZM158.218 18.2073H164.061C164.694 18.2073 165.472 18.2073 165.472 17.0521C165.472 15.8968 164.694 15.8985 164.061 15.8985H158.218V18.2073Z" fill="currentColor" />
            <path d="M181.289 27.4396H174.96V10.6079H181.289V27.4396Z" fill="currentColor" />
            <path d="M205.834 22.4628C205.834 25.2275 204.154 27.4396 200.283 27.4396H184.702V10.6079H199.554C203.424 10.6079 204.626 12.3408 204.626 14.8884C204.626 15.9702 204.118 17.0771 203.287 18.0387C204.754 19.0955 205.834 20.6348 205.834 22.4628ZM191.023 16.5329H196.875C197.509 16.5329 198.286 16.5329 198.286 15.618C198.286 14.7031 197.509 14.7048 196.875 14.7048H191.031L191.023 16.5329ZM199.497 21.9904C199.497 21.1005 198.718 21.1005 198.084 21.1005H191.023V22.8769H198.084C198.718 22.8769 199.497 22.8769 199.497 21.982V21.9904Z" fill="currentColor" />
            <path d="M215.314 15.4176V16.9803H227V21.0672H215.314V22.6315H227V27.4396H208.984V10.6079H227V15.4176H215.314Z" fill="currentColor" />
          </g>
          <defs>
            <clipPath id="ftm_clip">
              <rect width="227" height="27.4396" fill="currentColor" />
            </clipPath>
          </defs>
        </svg>
          </a>
        </div>
      </div>
      <nav
        aria-label="Fiction Tribe tools"
        className="mt-9 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/15 pt-5 font-mono text-[11px] uppercase tracking-[0.15em]"
      >
        {NAV.map((item) =>
          item.href ? (
            <a
              key={item.label}
              href={item.href}
              className="text-white/75 underline underline-offset-[3px] transition-colors duration-[250ms] ease-ft hover:text-white"
            >
              {item.label}
            </a>
          ) : (
            <span key={item.label} aria-current="page" className="text-white/45">
              {item.label}
            </span>
          ),
        )}
      </nav>
    </footer>
  )
}
