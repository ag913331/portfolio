"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./Carousel.module.css";

type Slide = {
  title: string;
  description: string;
  image: string;
};

export function Carousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);

  const prev = () =>
    setIndex((i) => (i === 0 ? slides.length - 1 : i - 1));
  const next = () =>
    setIndex((i) => (i === slides.length - 1 ? 0 : i + 1));

  const slide = slides[index];

  return (
    <div className={styles.carousel}>
      {/* Text above image */}
      <div className={styles.text}>
        <h2 className={styles.slideTitle}>{slide.title}</h2>
        <p className={styles.slideDescription}>{slide.description}</p>
      </div>

      {/* Image */}
      <div className={styles.imageWrap}>
        <Image
          src={slide.image}
          alt={slide.title}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className={styles.image}
          priority
        />
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button onClick={prev} aria-label="Previous slide">
          ←
        </button>

        <span className={styles.counter}>
          {index + 1} / {slides.length}
        </span>

        <button onClick={next} aria-label="Next slide">
          →
        </button>
      </div>
    </div>
  );
}
