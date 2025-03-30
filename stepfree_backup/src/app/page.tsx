import { Container, Main, Section } from "@/components/craft";
import FeatureLeft from "@/components/homepage/feature-left";
import Footer from "@/components/homepage/footer";
import Hero from "@/components/homepage/hero";

export default function Home() {
  return (
    <Main>
      <Section>
        <Container>
         <Hero />
         <FeatureLeft />
         <Footer />
        </Container>
      </Section>
    </Main>
  );
}