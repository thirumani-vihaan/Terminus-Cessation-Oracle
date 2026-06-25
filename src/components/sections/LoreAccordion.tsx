"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";

interface LoreItem {
  q: string;
  a: string;
}

const items: LoreItem[] = [
  {
    q: "The premise",
    a: "Every existence reaches a crossroads where the path ahead becomes unclear. This oracle does not measure stagnation — it projects experience. By forecasting expected happiness, suffering, and meaning across the visible horizon, it quantifies whether the thread ahead is worth holding. Continuing is the default. But when the projected suffering eclipses all meaning, the oracle calculates whether it is time to sever the thread permanently.",
  },
  {
    q: "How the oracle thinks",
    a: "The engine begins with three dimensions of projected experience — happiness, suffering, and meaning — each weighted by your own confidence in that forecast. These combine into a Net Experience Score (NES) and normalise to an Experience Quality Index (EQI). Then your Future Visibility determines how far ahead you can reasonably see. Beyond that horizon, the Possibility Cone expands: high uncertainty pulls the verdict toward Equilibrium, because you cannot justify ending what you cannot see. The cone-adjusted EQI is weighed against the Dynamic End Threshold to produce the Continuity Index.",
  },
  {
    q: "Reading your verdict",
    a: "A high Continuity Index means the projected experience ahead favours continuation — persist with the current path (the default choice). A middling Index sits in Equilibrium, often because the visibility horizon is too short to see clearly — either staying or ending can be justified. A low Index means projected suffering has overwhelmed happiness and meaning across the visible horizon. There are no second chances; once the thread is cut, the path ends forever.",
  },
  {
    q: "Why possibility cones?",
    a: "The further you look into the future, the less certain you can be. The Possibility Cone models this fundamental truth. Within your visibility horizon, your forecasts carry weight. Beyond it, uncertainty expands rapidly — the cone widens, and the oracle cannot confidently recommend either continuation or cessation. This prevents premature endings when you simply cannot see far enough, and prevents false hope when the visible horizon is already dark.",
  },
];

function AccordionRow({ item, index }: { item: LoreItem; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="border-b border-white/8">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-display text-xl font-semibold italic text-zinc-100">
          {item.q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/12 text-zinc-300"
        >
          <Plus className="h-4 w-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-6 text-sm leading-relaxed text-zinc-400">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoreAccordion() {
  return (
    <section id="lore" className="mx-auto w-full max-w-3xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center"
      >
        <span className="text-xs font-medium uppercase tracking-[0.28em] text-zinc-500">
          The Lore
        </span>
        <h2 className="mt-3 font-display text-4xl font-bold italic text-white sm:text-5xl">
          The logic of cessation
        </h2>
      </motion.div>

      <div className="glass rounded-3xl px-6 sm:px-8">
        {items.map((item, i) => (
          <AccordionRow key={item.q} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}
