import React from 'react';
import { ShieldCheck, Percent, Layers, Landmark } from 'lucide-react';
import { motion } from 'motion/react';
import { Reveal } from '../motion/Reveal';
import { StaggerChildren } from '../motion/StaggerChildren';
import { springBouncy } from '../../lib/motion';

interface TrustMarkProps {
  onNavigate?: (view: string) => void;
}

export function TrustMark({ onNavigate: _onNavigate }: TrustMarkProps = {}) {
  const principles = [
    {
      icon: <Percent className="h-5 w-5 text-[#B24724]" />,
      title: "5% platform fee",
      desc: "We keep 5% of each donation to cover payment fees, reviews and running the site. You see it before you pay."
    },
    {
      icon: <Landmark className="h-5 w-5 text-[#B24724]" />,
      title: "Paid in stages",
      desc: "Projects don't get everything upfront. Money is released only when each milestone has been checked."
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-[#B24724]" />,
      title: "Independent checks",
      desc: "A Project Manager with no link to the project reviews the proof for every milestone."
    },
    {
      icon: <Layers className="h-5 w-5 text-[#B24724]" />,
      title: "Linked to the UN goals",
      desc: "Every campaign is tagged with the UN Sustainable Development Goals it works towards, so you can find causes you care about."
    }
  ];

  return (
    <div className="border border-[#B24724]/20 bg-[#FAF9F6] rounded-3xl p-6 sm:p-10 space-y-8">
      <Reveal direction="bouncy" className="max-w-2xl">
        <span className="text-[10px] bg-[#B24724]/10 text-[#B24724] px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider mb-3 inline-block">
          Why it's safe
        </span>
        <h3 className="text-2xl sm:text-3xl font-serif text-slate-800 tracking-tight leading-snug">
          How we protect your donation.
        </h3>
      </Reveal>

      <StaggerChildren className="grid sm:grid-cols-2 gap-6 sm:gap-8" stagger={0.08}>
        {principles.map((p, idx) => (
          <motion.div
            key={idx}
            whileHover={{ x: 4 }}
            transition={springBouncy}
            className="group flex gap-4 rounded-2xl p-3 -m-3 transition-colors duration-200 hover:bg-white/70"
          >
            <motion.div
              whileHover={{ rotate: [0, -5, 5, 0], scale: 1.08 }}
              transition={{ duration: 0.35 }}
              className="shrink-0 p-3 bg-white border border-slate-100 rounded-xl h-fit shadow-xs transition-colors duration-200 group-hover:bg-emerald-50 group-hover:border-emerald-200/80"
            >
              {p.icon}
            </motion.div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold text-slate-900 font-serif">{p.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">{p.desc}</p>
            </div>
          </motion.div>
        ))}
      </StaggerChildren>
    </div>
  );
}
