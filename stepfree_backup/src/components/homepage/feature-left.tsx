/* eslint-disable @typescript-eslint/no-unused-vars */
// React and Next.js imports
import Link from "next/link";

// Third-party library imports
import Balancer from "react-wrap-balancer";

// UI component imports
import { Section, Container } from "@/components/craft";

// Icon imports
import { Coins, ArrowRight } from "lucide-react";
import Logo from "@/assets/stepfree-logo.svg";


type FeatureText = {
  title: string;
  description: string;
  href?: string;
  cta?: string;
};

const featureText: FeatureText[] = [
  {
    title: "Seamless, Step-Free Navigation",
    href: "/",
    description:
      "Plan wheelchair-accessible routes with ease. Avoid stairs, steep slopes, and other obstacles for a smoother travel experience.",
    cta: "Learn More",
  },
  {
    title: "Community-Sourced Insights",
    href: "/",
    description:
      "Get real-time updates from users on newly accessible spots, blocked ramps, or detours—empowering everyone to travel with confidence.",
    cta: "Learn More",
  },
  {
    title: "Personalized Route Suggestions",
    href: "/",
    description:
      "Save your favorite locations, tailor route preferences, and receive recommendations that fit your unique mobility needs.",
    cta: "Learn More",
  },
  {
    title: "Built-In Accessibility Tools",
    href: "/",
    description:
      "From hazard reporting to push notifications on route changes, our app keeps you informed and on track, every step (or roll) of the way.",
    cta: "Learn More",
  },
];

const Feature = () => {
  return (
    <Section className="border-b">
      <Container className="not-prose">
        <div className="flex flex-col gap-7">
          <h3 className="text-4xl">
            <Balancer>
                Explore the unique capabilities designed to enhance your experience.
            </Balancer>
          </h3>
          <h4 className="text-2xl font-light opacity-70">
            <Balancer>
              New to our accessibility platform? Look below to see the game-changing features waiting for you!
            </Balancer>
          </h4>

          <div className="mt-6 grid gap-6 md:mt-2 md:grid-cols-4">
            {featureText.map(
              ({ title, description, href, cta }, index) => (
                <Link
                  href={`${href}`}
                  className="flex flex-col justify-between gap-6 rounded-lg border p-6 transition-all hover:-mt-2 hover:mb-2"
                  key={index}
                >
                  <div className="grid gap-4">
                    <h4 className="text-2xl text-primary">{title}</h4>
                    <p className="text-sm text-base opacity-75">{description}</p>
                  </div>
                  {cta && (
                    <div className="flex h-fit items-center text-sm font-semibold">
                      <p>{cta}</p> <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  )}
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
