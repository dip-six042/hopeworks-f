import React from 'react';
import { VerifiedStamp } from '../components/marks/VerifiedStamp';
import { EscrowMark } from '../components/marks/EscrowMark';
import { EvidenceDoc } from '../components/marks/EvidenceDoc';
import { DonationReceipt } from '../components/marks/DonationReceipt';
import { MilestoneRail } from '../components/marks/MilestoneRail';
import { PillButton } from '../components/PillButton';
import { ArrowRight, ShieldCheck, HelpCircle, Users, CheckSquare, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { Reveal } from '../components/motion/Reveal';
import { StaggerChildren } from '../components/motion/StaggerChildren';
import { defaultViewport, springBouncy, slideFromLeft, slideFromRight } from '../lib/motion';

interface HowItWorksProps {
  onNavigate: (view: string, id?: string) => void;
}

export function HowItWorks({ onNavigate }: HowItWorksProps) {
  const steps = [
    {
      mark: <DonationReceipt size={56} />,
      badge: "Step 01",
      title: "1. You donate",
      desc: "Pick a campaign and donate. We keep a 5% platform fee, shown before you pay. The rest is held by HopeWorks, not sent straight to the project."
    },
    {
      mark: <MilestoneRail steps={[
        { title: 'Fundraising', status: 'completed' },
        { title: 'Locked', status: 'completed' },
        { title: 'Active', status: 'completed' },
        { title: 'Approved', status: 'pending' }
      ]} className="max-w-[400px] mt-2" />,
      badge: "Step 02",
      title: "2. Work happens in stages",
      desc: "Every campaign is split into milestones. The project owner works through them in order and can't start the next one until the current one is approved."
    },
    {
      mark: <EvidenceDoc size={56} />,
      badge: "Step 03",
      title: "3. The owner uploads proof",
      desc: "When a milestone is done, the owner uploads photos, receipts or other documents. The evidence can't be edited while it's being reviewed."
    },
    {
      mark: <VerifiedStamp size={56} />,
      badge: "Step 04",
      title: "4. A Project Manager checks it",
      desc: "An independent Project Manager reviews the proof against what the campaign promised. If it checks out, they approve the milestone and that part of the money is released. If not, they ask for changes."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16 select-none">
      <Reveal direction="bouncy" className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-[10px] bg-[#B24724]/10 text-[#B24724] px-3.5 py-1.5 rounded-full font-mono font-black uppercase tracking-widest">
          SYSTEM OPERATIONS HANDBOOK
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-slate-900 tracking-tight leading-[1.15] px-1">
          How HopeWorks works
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed max-w-2xl mx-auto">
          On HopeWorks, money follows the work. Projects get paid in stages, and only after someone independent has checked each stage.
        </p>
      </Reveal>

      <div className="space-y-6">
        {steps.map((st, idx) => (
          <motion.div
            key={idx}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={idx % 2 === 0 ? slideFromLeft : slideFromRight}
            className="border border-slate-200 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-10 flex flex-col md:flex-row gap-5 sm:gap-8 items-start md:items-center justify-between hover:border-slate-300 transition-all shadow-xs"
          >
            <div className="md:w-1/4 flex flex-col gap-4">
              <span className="text-xs font-mono font-extrabold text-[#B24724] bg-[#B24724]/5 py-1 px-3 rounded-full w-fit">
                {st.badge}
              </span>
              <motion.div
                initial={{ opacity: 0, rotate: -8, scale: 0.9 }}
                whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
                viewport={defaultViewport}
                transition={springBouncy}
                className="bg-slate-50 p-4 rounded-xl border border-slate-100/50 w-fit"
              >
                {st.mark}
              </motion.div>
            </div>

            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-serif font-normal text-slate-800">{st.title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{st.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <StaggerChildren className="grid md:grid-cols-2 gap-8 items-stretch pt-6" stagger={0.12}>
        <div className="border border-slate-200/50 bg-[#FAF9F6]/50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="p-3 bg-[#B24724]/10 rounded-xl w-fit text-[#B24724]">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-serif text-slate-800 tracking-tight">The five roles</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              There are five roles: Project Owner, Donor, Volunteer, Project Manager and Admin. You pick one when you sign up. Admins are appointed by the HopeWorks team, and admins assign Project Managers to campaigns.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-slate-500">
            <div>
              <span className="block font-bold text-slate-700">Entrepreneur</span>
              <span>Owners: run campaigns and upload proof</span>
            </div>
            <div>
              <span className="block font-bold text-slate-700">Volunteer</span>
              <span>Volunteers: offer time and skills</span>
            </div>
            <div>
              <span className="block font-bold text-slate-700">Project Manager</span>
              <span>Project Managers: review proof</span>
            </div>
            <div>
              <span className="block font-bold text-slate-700">Donor</span>
              <span>Donors: fund the work</span>
            </div>
          </div>
        </div>

        <div className="border border-slate-200 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="p-3 bg-[#B24724]/10 rounded-xl w-fit text-[#B24724]">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-serif text-slate-800 tracking-tight">Linked to the UN goals</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every campaign is tagged with at least one of the 17 UN Sustainable Development Goals, so you can find the causes you care about.
            </p>
          </div>
          <PillButton
            onClick={() => onNavigate('explore')}
            className="w-full py-2.5 px-5 text-xs font-sans text-center font-bold"
            textColor="#ffffff"
            pillColor="#B24724"
            baseColor="#000000"
            hoveredTextColor="#ffffff"
          >
            Browse campaigns
            <ArrowRight className="h-4 w-4" />
          </PillButton>
        </div>
      </StaggerChildren>
    </div>
  );
}
