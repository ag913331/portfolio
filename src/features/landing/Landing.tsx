import Link from "next/link";
import { Button } from "@/components/Button/Button";
import surface from "@/styles/surface.module.css";

export function Landing({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  return (
    <section className={surface.card} aria-label="Welcome">
      <div className={surface.inner}>
        <p className={surface.kicker}>Hello, my name is Alexandro.</p>
        <h1 className={surface.title}>Welcome to my terminal portfolio.</h1>
        <p className={surface.subtitle}>Explore my work and experience through a Linux-style command line interface.</p>

        <div className={surface.actions}>
          <Button variant="unstyled" className={surface.btn} onClick={onOpenTerminal}>
            $: Open terminal
          </Button>

          <Link className={surface.btn} href="/cv.pdf" download>
            $: Download CV
          </Link>
        </div>
      </div>
    </section>
  );
}
