// React and Next.js imports
import Link from "next/link";
import Image from "next/image";

// Third-party library imports
import Balancer from "react-wrap-balancer";

// UI component imports
import { Section, Container } from "@/components/craft";
import { Button } from "@/components/ui/button";

// Asset imports
import Placeholder from "@/assets/placeholder.webp";

const Feature = () => {
  return (
    <Section>
      <Container className="grid items-stretch">
        <div className="not-prose relative flex h-96 overflow-hidden rounded-lg border">
          <Image
            src={Placeholder}
            alt="placeholder"
            className="fill object-cover"
          />
        </div>
        <h3 className="mt-6 text-4xl">
            <Balancer>
                Navigate your world, barrier free.
            </Balancer>
          </h3>
        <p className="text-xl mt-4 text-muted-foreground">
          <Balancer>
            Plan accessible routes, avoid obstacles, and travel with confidence—wherever you need to go.
          </Balancer>
        </p>
        <div className="not-prose mt-5 flex items-center gap-2">
          <Button className="w-fit" asChild>
            <Link href="/map">Get Started</Link>
          </Button>
          <Button className="w-fit" variant="link" asChild>
            <Link href="#">Learn More {"->"}</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
};

export default Feature;
