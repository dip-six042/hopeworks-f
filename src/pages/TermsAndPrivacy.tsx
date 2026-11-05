import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Lock, Scale, ArrowLeft, HelpCircle, Calendar } from 'lucide-react';
import { PillButton } from '../components/PillButton';

/**
 * Legal details. Update these before launch:
 * - COMPANY_NAME: the registered legal entity (CAC-registered name)
 * - COMPANY_ADDRESS: registered office address
 * - CONTACT_EMAIL: a monitored inbox for legal / privacy requests
 *
 * NOTE: This is a starting template written for a Nigerian crowdfunding platform.
 * Have it reviewed by a Nigerian lawyer before accepting real donations.
 */
const COMPANY_NAME = 'HopeWorks';
const COMPANY_ADDRESS = 'Lagos, Nigeria';
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'support@hopeworks.app';
const LAST_UPDATED = 'November 5, 2026';

interface TermsAndPrivacyProps {
  initialTab?: 'terms' | 'privacy';
  onNavigate: (view: string) => void;
}

type Section = { title: string; body: React.ReactNode };

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">{children}</p>
);
const UL = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
    {items.map((item, i) => <li key={i}>{item}</li>)}
  </ul>
);

const TERMS: Section[] = [
  {
    title: '1. About these Terms',
    body: (
      <P>
        These Terms of Service ("Terms") govern your use of the HopeWorks website and services (the "Platform"), operated by {COMPANY_NAME}, {COMPANY_ADDRESS} ("HopeWorks", "we", "us"). By creating an account or making a donation you agree to these Terms. If you do not agree, do not use the Platform. You must be at least 18 years old to create an account.
      </P>
    ),
  },
  {
    title: '2. What HopeWorks does',
    body: (
      <>
        <P>
          HopeWorks is a crowdfunding platform for community projects aligned with the UN Sustainable Development Goals. Project owners ("Entrepreneurs") create campaigns divided into milestones. Donors contribute funds. Independent Project Managers review evidence that each milestone has been completed before the corresponding funds are released to the Entrepreneur.
        </P>
        <P>
          HopeWorks is not a bank, a deposit-taking institution or a charity. We do not guarantee that any project will succeed, and a donation is not an investment and gives you no ownership, equity or return.
        </P>
      </>
    ),
  },
  {
    title: '3. Accounts and roles',
    body: (
      <UL items={[
        'You must provide accurate information and keep your login details secure. You are responsible for activity on your account.',
        'Accounts may hold one or more roles: Donor, Volunteer, Entrepreneur, Project Manager or Admin. Some roles require identity verification.',
        'Entrepreneurs and Project Managers may be asked to upload a valid government-issued ID. We may refuse, suspend or close any account that fails verification or breaches these Terms.',
      ]} />
    ),
  },
  {
    title: '4. Donations and payments',
    body: (
      <UL items={[
        'Payments are processed by our payment partner, Korapay (Kora). Your card or bank details are entered on Kora\'s secure page and are never stored by HopeWorks.',
        'A donation is confirmed only once Kora confirms successful payment. You will see the amount, currency and project before you pay.',
        'A platform fee of 5% is deducted from each donation to cover operations, verification and payment costs. The fee is shown before you pay. Payment processor charges may also apply.',
        'Donations are held by HopeWorks and released to the Entrepreneur in stages as each milestone is verified by an assigned Project Manager.',
        'You may not donate to a campaign you own.',
      ]} />
    ),
  },
  {
    title: '5. Refunds',
    body: (
      <>
        <P>Donations are generally non-refundable once confirmed. However, funds that have not yet been released may be refunded (less any non-recoverable payment processing fees) where:</P>
        <UL items={[
          'a campaign is cancelled, removed or rejected by HopeWorks before its milestones are completed;',
          'we determine that a campaign was fraudulent or materially misrepresented; or',
          'a payment was made in error (for example, a duplicate charge) and you contact us within 14 days.',
        ]} />
        <P>Funds already released for verified milestones cannot be refunded. To request a refund, email {CONTACT_EMAIL} with your payment reference.</P>
      </>
    ),
  },
  {
    title: '6. Entrepreneur obligations',
    body: (
      <UL items={[
        'Campaign information, budgets, photos and milestone evidence must be true, accurate and your own (or used with permission).',
        'Funds released to you must be used only for the purpose described in the campaign and the relevant milestone.',
        'You are responsible for any taxes, permits and legal obligations connected with your project.',
        'Submitting false or manipulated evidence is a serious breach. We may withhold unreleased funds, refund donors, close your account and report the matter to the relevant authorities.',
      ]} />
    ),
  },
  {
    title: '7. Project Managers and volunteers',
    body: (
      <P>
        Project Managers must review evidence honestly and independently and disclose any conflict of interest. Volunteers participate at their own discretion; arrangements for any paid volunteer roles are between the volunteer and the Entrepreneur. HopeWorks is not the employer of volunteers or Project Managers unless agreed in writing.
      </P>
    ),
  },
  {
    title: '8. Prohibited use',
    body: (
      <UL items={[
        'Fraud, money laundering, terrorist financing or any unlawful activity.',
        'Campaigns for political parties, weapons, gambling, or anything illegal under Nigerian law.',
        'Harassment, hate speech, or content that infringes others\' rights.',
        'Attempting to access other users\' accounts or data, or interfering with the Platform\'s security.',
      ]} />
    ),
  },
  {
    title: '9. Content',
    body: (
      <P>
        You keep ownership of content you upload, but grant HopeWorks a non-exclusive, royalty-free licence to display it on the Platform and in promoting campaigns. We may remove content that breaches these Terms.
      </P>
    ),
  },
  {
    title: '10. Liability',
    body: (
      <P>
        The Platform is provided "as is". To the extent permitted by law, HopeWorks is not liable for the conduct of Entrepreneurs, volunteers or other users, or for any indirect or consequential loss. Our total liability to you in connection with any donation is limited to the amount of that donation. Nothing in these Terms limits liability that cannot be limited under Nigerian law, including under the Federal Competition and Consumer Protection Act 2018.
      </P>
    ),
  },
  {
    title: '11. Changes and termination',
    body: (
      <P>
        We may update these Terms from time to time. We will notify you of material changes by email or on the Platform. You may close your account at any time by contacting us. We may suspend or terminate accounts that breach these Terms.
      </P>
    ),
  },
  {
    title: '12. Governing law and disputes',
    body: (
      <P>
        These Terms are governed by the laws of the Federal Republic of Nigeria. Please contact us first so we can try to resolve any complaint. Disputes that cannot be resolved informally shall be submitted to the courts of Lagos State, Nigeria.
      </P>
    ),
  },
];

const PRIVACY: Section[] = [
  {
    title: '1. Who we are',
    body: (
      <P>
        {COMPANY_NAME} ({COMPANY_ADDRESS}) is the data controller for personal data processed through the Platform. This policy explains how we handle your data in line with the Nigeria Data Protection Act 2023 (NDPA) and related regulations. Contact us about privacy at {CONTACT_EMAIL}.
      </P>
    ),
  },
  {
    title: '2. Data we collect',
    body: (
      <UL items={[
        <><strong>Account data:</strong> name, email address, password (stored securely by our authentication provider), roles, and optional profile details such as bio, location, website, skills and interests.</>,
        <><strong>Identity documents:</strong> government-issued ID uploaded for verification by Entrepreneurs and Project Managers. These are stored privately and viewable only by you and authorised administrators.</>,
        <><strong>Donation data:</strong> amount, currency, project, payment reference, status and optional message. Card and bank details are collected by Kora, not by us.</>,
        <><strong>Campaign and volunteer data:</strong> campaign content, milestone evidence (photos, documents), volunteer applications and availability.</>,
        <><strong>Technical data:</strong> IP address, browser information and basic logs needed for security and to prevent abuse.</>,
      ]} />
    ),
  },
  {
    title: '3. Why we use it (lawful basis)',
    body: (
      <UL items={[
        'To create and run your account and process donations — performance of a contract.',
        'To verify identities, prevent fraud and keep audit records — legitimate interests and legal obligations (including anti-money-laundering requirements).',
        'To send service notifications about your donations, campaigns and milestones — performance of a contract.',
        'To send optional updates or marketing — only with your consent, which you can withdraw at any time.',
      ]} />
    ),
  },
  {
    title: '4. Who we share it with',
    body: (
      <>
        <P>We do not sell your personal data. We share it only with service providers who process it on our behalf under appropriate safeguards:</P>
        <UL items={[
          'Korapay (Kora) — payment processing.',
          'Supabase — authentication, database and file storage.',
          'Render and Vercel — application hosting.',
          'Law enforcement or regulators where required by law.',
        ]} />
        <P>
          Public campaign pages show the campaign owner's name and donor names for non-anonymous donations. Choose "donate anonymously" to hide your name.
        </P>
      </>
    ),
  },
  {
    title: '5. International transfers',
    body: (
      <P>
        Some of our service providers store data outside Nigeria. Where this happens, we rely on the transfer mechanisms permitted under the NDPA, such as contractual safeguards, to ensure your data receives an adequate level of protection.
      </P>
    ),
  },
  {
    title: '6. How long we keep it',
    body: (
      <UL items={[
        'Account data: while your account is active, and up to 12 months after closure.',
        'Identity documents: until verification is complete plus up to 12 months, unless needed for an ongoing investigation.',
        'Donation and financial records: at least 6 years, as required for tax and accounting purposes.',
      ]} />
    ),
  },
  {
    title: '7. Your rights',
    body: (
      <>
        <P>Under the NDPA you have the right to:</P>
        <UL items={[
          'access the personal data we hold about you;',
          'have inaccurate data corrected;',
          'have your data deleted, where we have no legal reason to keep it;',
          'object to or restrict certain processing;',
          'receive your data in a portable format;',
          'withdraw consent at any time.',
        ]} />
        <P>
          Email {CONTACT_EMAIL} to exercise these rights. We will respond within 30 days. If you are not satisfied, you may complain to the Nigeria Data Protection Commission (NDPC).
        </P>
      </>
    ),
  },
  {
    title: '8. Security',
    body: (
      <P>
        We use encryption in transit, access controls, private storage for identity documents and rate limiting to protect your data. No system is completely secure; we will notify you and the NDPC of any personal data breach as required by law.
      </P>
    ),
  },
  {
    title: '9. Cookies and local storage',
    body: (
      <P>
        We use essential browser storage to keep you signed in and remember your place in the app. We do not use advertising or third-party tracking cookies.
      </P>
    ),
  },
  {
    title: '10. Children',
    body: (
      <P>The Platform is not intended for anyone under 18, and we do not knowingly collect data from children.</P>
    ),
  },
  {
    title: '11. Changes',
    body: (
      <P>We may update this policy. The "Last updated" date shows when it last changed, and we will notify you of significant changes.</P>
    ),
  },
];

export function TermsAndPrivacy({ initialTab = 'terms', onNavigate }: TermsAndPrivacyProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);
  const sections = activeTab === 'terms' ? TERMS : PRIVACY;

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#B24724]/15 selection:text-slate-900">
      <div className="max-w-4xl mx-auto space-y-12">

        <div className="flex items-center justify-between gap-3">
          <PillButton
            variant="outline"
            caps={false}
            onClick={() => onNavigate('home')}
            className="py-2 px-4 text-xs font-mono"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </PillButton>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>Last updated: {LAST_UPDATED}</span>
          </div>
        </div>

        <div className="space-y-4 text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-serif font-normal text-slate-950 tracking-tight leading-none">
            Terms & Privacy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
            How HopeWorks works, what we expect from everyone using it, and how we protect your personal data.
          </p>
        </div>

        <div className="flex border-b border-slate-200">
          {([
            { id: 'terms', label: 'Terms of Service', Icon: Scale },
            { id: 'privacy', label: 'Privacy Policy', Icon: Lock },
          ] as const).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2.5 px-4 sm:px-6 py-4 border-b-2 text-xs sm:text-sm font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === id
                  ? 'border-[#B24724] text-[#B24724]'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 text-[#B24724]">
              <FileText className="h-4 w-4" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest">
                {activeTab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
              </span>
            </div>

            {sections.map((s, i) => (
              <React.Fragment key={s.title}>
                {i > 0 && <div className="h-px bg-slate-100" />}
                <section className="space-y-2">
                  <h3 className="text-lg font-serif font-semibold text-slate-950">{s.title}</h3>
                  {s.body}
                </section>
              </React.Fragment>
            ))}
          </motion.div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-slate-300" />
              <span>Questions about these terms or your data?</span>
            </div>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#B24724] font-bold hover:underline">
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
