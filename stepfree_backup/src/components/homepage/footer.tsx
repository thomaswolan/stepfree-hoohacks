/* eslint-disable @typescript-eslint/no-unused-vars */
// React and Next.js imports
import Image from "next/image";
import Link from "next/link";

// Third-party library imports
import Balancer from "react-wrap-balancer";

// Local component imports
import { Section, Container } from "../craft";

// Asset imports
import Logo from "@/assets/stepfree-white-transparent.png";

export default function Footer() {
  return (
    <footer>
      <Section className="-mt-8">
        <Container className="grid gap-12 md:grid-cols-[1.5fr_0.5fr_0.5fr]">
          <div className="grid gap-6">
            <Link href="/">
              <h3 className="sr-only">brijr/components</h3>
              <Image
                src={Logo}
                alt="Logo"
                width={405}
                height={40}
                className="transition-all hover:opacity-75 dark:invert"
              ></Image>
            </Link>
            <p className="text-muted-foreground">
              ©StepFree, Hoohacks 2025 Project. All rights reserved.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h5>Website</h5>
            <Link href="/">Blog</Link>
            <Link href="/">Authors</Link>
            <Link href="/">Categories</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h5>Legal</h5>
            <Link href="/">Privacy Policy</Link>
            <Link href="/">Terms of Service</Link>
            <Link href="/">Cookie Policy</Link>
          </div>
        </Container>
      </Section>
    </footer>
  );
}