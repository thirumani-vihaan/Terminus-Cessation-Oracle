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
    a: "Every life replica run faces periods of grinding stagnation. This oracle assesses whether your current player's projected decay outweighs the finality of ending the playthrough forever. The longer you continue, the more unique moments you can experience — so your remaining runway matters as much as the immediate hardships.",
  },
  {
    q: "How the oracle thinks",
    a: "We start from your remaining turns R = 82 − Level (or age) and a neutral prior T = R / 2. Your projected stagnation S is dampened by an uncertainty-decay factor and weighted by your confidence to produce the Effective Stagnation Weight (ESW). Choosing to end forever invokes an End Premium (EP) representing release, shifting the Dynamic End Threshold (DRT). The gap becomes your Continuity Index.",
  },
  {
    q: "Reading your verdict",
    a: "A high Continuity Index means you should persist — Continue with the current player (the default choice). A middling Index sits in Equilibrium, where either staying or ending is valid. A low Index suggests that ending the run is the logical choice. There are no save states or second chances; once you end it, the character is gone forever.",
  },
  {
    q: "Why an end premium?",
    a: "Choosing to end a run is a heavy, permanent decision. The End Premium reflects the release from stagnation and scales with your remaining turns. When the remaining runway is long, the premium is higher, reflecting the weight of cutting off a long life path versus lingering in a decaying loop.",
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
