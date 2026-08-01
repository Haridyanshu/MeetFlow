import { Mail } from "lucide-react";
import Link from "next/link";

import { GithubIcon, LinkedinIcon, XIcon } from "@/components/landing/icons";
import { Logo } from "@/components/landing/logo";
import { siteConfig } from "@/components/landing/site";

type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

const columns: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Product", href: "#product" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help center", href: "#faq" },
      { label: "Documentation", href: "#product" },
      { label: "Booking links", href: "#product" },
      { label: "Team scheduling", href: "#product" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: siteConfig.contactUrl },
      { label: "GitHub", href: siteConfig.github },
    ],
  },
];

const socials = [
  { label: "GitHub", href: siteConfig.github, icon: GithubIcon },
  { label: "X (Twitter)", href: "#", icon: XIcon },
  { label: "LinkedIn", href: "#", icon: LinkedinIcon },
  { label: "Email", href: siteConfig.contactUrl, icon: Mail },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-block rounded-lg focus-visible:ring-2 focus-visible:ring-brand">
              <Logo />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Effortless scheduling for modern teams. Free forever, built for
              people who value their time.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    social.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="flex size-9 items-center justify-center rounded-lg border border-white/10 text-muted-foreground transition-colors hover:border-brand/30 hover:text-brand"
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-sm font-semibold text-foreground">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={
                        link.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MeetFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Terms
            </a>
            <a
              href={siteConfig.contactUrl}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
