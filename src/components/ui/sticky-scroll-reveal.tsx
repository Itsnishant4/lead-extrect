"use client";
import React, { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode | any;
  }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const ref = useRef<any>(null);
  const { scrollYProgress } = useScroll({
    // uncomment line 22 and comment line 23 if you DONT want the scroll margins
    container: ref,
    // target: ref,
    // offset: ["start start", "end start"],
  });
  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0
    );
    setActiveCard(closestBreakpointIndex);
  });

  const backgroundColors = [
    "#f8fafc",
    "#f1f5f9",
    "#f8fafc",
    "#f1f5f9",
    "#f8fafc",
    "#f1f5f9",
  ];
  const linearGradients = [
    "linear-gradient(to bottom right, var(--cyan-500, #06b6d4), var(--emerald-500, #10b981))",
    "linear-gradient(to bottom right, var(--pink-500, #ec4899), var(--indigo-500, #6366f1))",
    "linear-gradient(to bottom right, var(--orange-500, #f97316), var(--yellow-500, #eab308))",
    "linear-gradient(to bottom right, var(--blue-500, #3b82f6), var(--purple-500, #a855f7))",
    "linear-gradient(to bottom right, var(--rose-500, #f43f5e), var(--fuchsia-500, #d946ef))",
    "linear-gradient(to bottom right, var(--teal-500, #14b8a6), var(--blue-500, #3b82f6))",
  ];

  const [backgroundGradient, setBackgroundGradient] = useState(
    linearGradients[0]
  );

  useEffect(() => {
    setBackgroundGradient(linearGradients[activeCard % linearGradients.length]);
  }, [activeCard]);

  return (
    <motion.div
      animate={{
        backgroundColor: backgroundColors[activeCard % backgroundColors.length],
      }}
      className="h-[45rem] overflow-y-auto flex justify-center relative space-x-10 rounded-[2rem] p-10 scrollbar-hide border border-gray-100 shadow-sm"
      ref={ref}
    >
      <div className="div relative flex items-start px-4 w-full md:w-1/2">
        <div className="max-w-2xl">
          {content.map((item, index) => (
            <div key={item.title + index} className="my-20">
              <motion.h2
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.3,
                }}
                className="text-3xl font-extrabold text-gray-900"
              >
                {item.title}
              </motion.h2>
              <motion.p
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.3,
                }}
                className="text-xl text-gray-500 max-w-sm mt-6 leading-relaxed"
              >
                {item.description}
              </motion.p>
            </div>
          ))}
          <div className="h-40" />
        </div>
      </div>
      <div
        style={{ background: backgroundGradient }}
        className={cn(
          "hidden md:flex h-80 w-80 rounded-[2rem] sticky top-20 overflow-hidden items-center justify-center text-white shadow-xl shadow-indigo-500/10",
          contentClassName
        )}
      >
        {content[activeCard].content ?? null}
      </div>
    </motion.div>
  );
};
