import Link from "next/link";

const FOOTER = [
  {
    heading: "PRODUCT",
    links: [
      { label: "Features", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Explore", href: "/search" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    heading: "COMPANY",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    heading: "LEGAL",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Security", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-border px-6 py-10 text-sm text-muted-foreground">
      <div className="mx-auto max-w-[1120px]">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-md border-[1.5px] border-foreground">
                <span className="size-2 rounded-[2px] bg-foreground" />
              </span>
              <span className="font-bold tracking-tight text-foreground">
                Drop<span className="text-primary">ItX</span>
              </span>
            </div>
            <p className="meta mt-3 max-w-[240px]">
              Secure document links with view tracking. Built for teams who care who reads what.
            </p>
          </div>
          {FOOTER.map((col) => (
            <div key={col.heading}>
              <p className="meta mb-2">{col.heading}</p>
              <div className="flex flex-col gap-1">
                {col.links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="meta mt-8 border-t border-border pt-5">
          © {new Date().getFullYear()} DropItX Inc. · v1.4.1
        </div>
      </div>
    </footer>
  );
}

