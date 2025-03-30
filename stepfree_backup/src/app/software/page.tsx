// Layout
import { Section, Container } from "@/components/craft";
import Balancer from "react-wrap-balancer";
import Link from "next/link";

// Icons
import { Coins, ArrowRight } from "lucide-react";

type FeatureText = {
  title: string;
  description: string;
  href?: string;
};

const featureText: FeatureText[] = [
  {
    title: "Frontend",
    href: "/",
    description:
      "Technologies: Next.js, TypeScript, Shadcn UI, Framer Motion, components.work by brijr.\n\n Our front end is powered by Next.js and TypeScript for fast, type-safe development. We use Shadcn UI and components.work by brijr to quickly style and build accessible, consistent interfaces. Animations and transitions are handled by Framer Motion, making the user experience more dynamic and engaging.",
  },
  {
    title: "Backend",
    href: "/",
    description:
      "Technologies: Mapbox, OpenStreetMap, Google Maps. We combine multiple mapping and routing services for an optimal user experience. Mapbox handles the interactive map rendering, while OpenStreetMap provides community-driven location data—like accessible points of interest. For more precise routing needs, we also integrate Google Maps to ensure users get the most accurate routes possible.",
  },
];

const singleFeatureText: FeatureText[] = [
  {
    title: "Database/Authentication",
    href: "/",
    description:
      "Technology: Supabase. We use Supabase for both our database and user authentication needs. It provides a secure, Postgres-backed environment to store user data and route histories, while also handling sign-ups, logins, and session management. This keeps our data layer robust, reliable, and easy to scale as StepFree grows."


  },
];

const Feature = () => {
  return (
    <Section>
      <Container className="not-prose md:mt-11">
        <div className="flex flex-col gap-6 text-center">
          <h3 className="text-4xl">
            <Balancer>
                Explore the Full Stack Behind StepFree
            </Balancer>
          </h3>
          <h4 className="text-2xl font-light opacity-70">
            <Balancer>
            We’ve built StepFree using cutting-edge tools at every layer of the stack—from a dynamic front end and robust map integrations to secure authentication and data management.
            </Balancer>
          </h4>

          <div className="mt-6 grid gap-6 md:mt-3 md:grid-cols-2 text-left">
            {featureText.map(
              ({ title, description, href, }, index) => (
                <Link
                  href={`${href}`}
                  className="flex flex-col justify-between gap-6 rounded-lg border p-6 transition-all hover:-mt-2 hover:mb-2"
                  key={index}
                >
                  <div className="grid gap-4">
                    <h4 className="text-xl text-primary">{title}</h4>
                    <p className="text-base opacity-75">{description}</p>
                  </div>
                </Link>
              ),
            )}
          </div>
          <div>
            {singleFeatureText.map(
              ({ title, description, href, }, index) => (
                <Link
                  href={`${href}`}
                  className="flex flex-col justify-between gap-6 rounded-lg border bg-muted/25 p-6 transition-all hover:-mt-2 hover:mb-2"
                  key={index}
                >
                  <div className="grid gap-4">
                    <h4 className="text-xl text-primary">{title}</h4>
                    <p className="text-base opacity-75">{description}</p>
                  </div>
                  
                </Link>
              ),
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default Feature;
