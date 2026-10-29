import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import Card from '../components/Card';

export default function LandingPage() {
  const [isFlipped, setIsFlipped] = useState(false);

  const features = [
    {
      icon: 'summarize',
      title: 'Smart Summaries',
      text: 'AI extracts key formulas, theorems, and definitions into bulleted, bite-sized revision points.',
      note: 'Instant PDF & Image scan',
    },
    {
      icon: 'flip',
      title: 'Flashcards',
      text: 'Active recall memory cards with tap-to-flip answers to master complex terminology quickly.',
      note: 'Spaced repetition scheduling',
    },
    {
      icon: 'quiz',
      title: 'Practice Quizzes',
      text: 'Instant MCQs with instant feedback, time tracking, and detailed explanations to test comprehension.',
      note: 'Timed mock exam modes',
    },
  ];

  return (
    <div className="font-body-md text-body-md text-on-surface flex flex-col min-h-screen">
      <Navbar subtitle="Home" />

      <main className="flex-1 flex flex-col relative w-full pt-24 sm:pt-28 pb-32 md:pb-16">
        <div className="flex flex-col w-full px-4 sm:px-6 max-w-xl md:max-w-3xl lg:max-w-6xl mx-auto gap-10 lg:gap-16">
          {/* Hero */}
          <section className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="flex flex-col items-start rise">
              <div className="pill pill--gold px-3 py-1.5">
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                  aria-hidden="true"
                >
                  auto_awesome
                </span>
                <span className="font-label-sm text-label-sm tracking-wide">
                  AI-Powered Study Assistant for Indian Students
                </span>
              </div>

              <h1 className="mt-5 font-display-mobile text-display-mobile lg:font-display lg:text-display text-primary tracking-tight font-extrabold [text-wrap:balance]">
                Study Smarter,{' '}
                <span className="bg-gradient-to-r from-[#4126a8] to-[#7a62d6] bg-clip-text text-transparent">
                  Not Harder
                </span>
              </h1>
              <p className="mt-4 font-body-lg text-body-lg text-on-surface-variant leading-relaxed max-w-xl">
                Turn messy class notes into concise AI summaries, interactive flashcards, and exam-ready multiple-choice quizzes in seconds.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full">
                <Button to="/dashboard" variant="primary" size="lg" className="w-full sm:w-auto" iconRight="arrow_forward">
                  Start Learning
                </Button>
                <Button href="#features" variant="secondary" size="lg" className="w-full sm:w-auto">
                  Explore Features
                </Button>
              </div>

              <div className="mt-5 flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
                <span className="material-symbols-outlined text-[18px] text-secondary" aria-hidden="true">
                  bolt
                </span>
                <span>Built for Hackathons & University Exams • 100% Free for Students</span>
              </div>
            </div>

            {/* Visual hero banner in a glass frame */}
            <div className="relative rise" style={{ '--i': 2 }}>
              <div className="glass p-2.5 !rounded-[28px]">
                <div className="relative w-full overflow-hidden rounded-[20px] aspect-[16/10] bg-surface-container-high">
                  <img
                    className="w-full h-full object-cover"
                    alt="Indian student studying with tablet"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxRGiv7Tvi9O3kpWuvNQciMqztIVgxWyZCXzyboW7Ysrh_Zk8cEVFE_DgEHzbtCvPSG6rZeUv7brKdk569MM0M4l3NIb8xB4CKphd_y8iJfQHrr-rbDHRt_i00vPU_s2zr-SIJ4TAhJYTGjBlDfD9uJGRrOyh-87YqWwteE7nt2Cvxmp5bYViadgEdDyoWBkUdti5iOcgv4macIIG6IhNiHyhi1eiqVVTRBHMFL8_R"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#16143a]/55 via-transparent to-transparent" />
                </div>
              </div>
              <div className="glass glass--strong absolute left-5 bottom-5 sm:left-7 sm:bottom-7 max-w-[calc(100%-2.5rem)] flex items-center gap-space-sm px-3.5 py-2 !rounded-full">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="font-label-md text-label-md text-primary font-semibold">
                  Over 12,000+ notes distilled this week
                </span>
              </div>
            </div>
          </section>

          {/* Interactive concept preview */}
          <section className="grid lg:grid-cols-[1fr_1.2fr] gap-6 items-start">
            <div className="flex flex-col gap-3 rise" style={{ '--i': 1 }}>
              <span className="pill pill--accent w-fit px-2.5 py-1 font-label-sm text-label-sm font-semibold">
                Interactive Demo
              </span>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile lg:font-headline-lg lg:text-headline-lg text-primary font-bold">
                Live Concept Preview
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                Try the study loop right here: read the question, say the answer out loud, then flip the card.
              </p>
            </div>

            <Card className="space-y-space-md rise" style={{ '--i': 2 }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    CBSE Class 9 & 10 • Mathematics
                  </span>
                  <h3 className="font-title-md text-title-md text-primary mt-0.5 font-bold">
                    Real Numbers & Number Systems
                  </h3>
                </div>
                <span className="neu-icon">
                  <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                    calculate
                  </span>
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {['Natural Numbers', 'Integers', 'Rational Numbers'].map((t) => (
                  <span key={t} className="pill px-3 py-1 text-primary font-label-sm text-label-sm">
                    {t}
                  </span>
                ))}
                <span className="pill pill--accent px-3 py-1 font-label-sm text-label-sm">Euclid's Lemma</span>
              </div>

              <button
                type="button"
                aria-pressed={isFlipped}
                className="neu-inset w-full text-left p-space-md cursor-pointer select-none transition-transform active:scale-[0.99]"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <span className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm mb-1.5">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-secondary" aria-hidden="true">
                      style
                    </span>
                    <span>Tap to Reveal Concept</span>
                  </span>
                  <span className="text-secondary font-label-sm font-semibold">
                    {isFlipped ? 'Show Question ↺' : 'Flip Card ↻'}
                  </span>
                </span>
                <span className="block font-body-md text-body-md text-primary font-medium min-h-[48px]">
                  {isFlipped
                    ? 'Ans: An irrational number has a non-terminating and non-repeating decimal expansion (e.g., √2, π).'
                    : 'Q: What defines an irrational number in decimal expansion?'}
                </span>
              </button>
            </Card>
          </section>

          {/* Core features */}
          <section id="features" className="flex flex-col gap-6 scroll-mt-24">
            <div className="flex flex-col gap-1 text-center md:text-left">
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile lg:font-headline-lg lg:text-headline-lg text-primary font-bold">
                Designed for Deep Focus
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Everything an aspirant needs to master high-yield topics without friction.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {features.map((f, i) => (
                <Card key={f.title} hover className="space-y-space-sm rise" style={{ '--i': i }}>
                  <span className="neu-icon neu-icon--lg">
                    <span className="material-symbols-outlined text-[26px]" aria-hidden="true">
                      {f.icon}
                    </span>
                  </span>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-primary font-bold">{f.title}</h3>
                    <p className="mt-1 font-body-md text-body-md text-on-surface-variant leading-relaxed">{f.text}</p>
                  </div>
                  <div className="pt-space-xs flex items-center gap-space-xs text-secondary font-label-md text-label-md font-semibold">
                    <span>{f.note}</span>
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                      chevron_right
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Closing call to action */}
          <section className="glass glass--accent p-6 sm:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="relative z-10 flex flex-col gap-space-sm max-w-xl">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[20px] text-[#d9d2f5]" aria-hidden="true">
                  workspace_premium
                </span>
                <span className="font-label-sm text-label-sm text-[#d9d2f5] uppercase tracking-wider font-semibold">
                  Aspirant Friendly
                </span>
              </div>
              <h3 className="font-headline-md-mobile text-headline-md-mobile lg:font-headline-md lg:text-headline-md text-white font-bold">
                Ready to accelerate your syllabus?
              </h3>
              <p className="font-body-md text-body-md text-[#ebe7fa] leading-relaxed">
                Upload your first syllabus chapter or lecture slides and generate comprehensive study modules in under 15 seconds.
              </p>
            </div>
            <div className="relative z-10">
              <Link
                to="/dashboard"
                className="neu-btn inline-flex items-center justify-center gap-2.5 px-6 py-3.5 min-h-[52px] rounded-xl text-title-md w-full md:w-auto !bg-white !text-[#321a85]"
              >
                Start Learning
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                  arrow_forward
                </span>
              </Link>
            </div>
          </section>

          {/* Footer */}
          <footer className="flex flex-col items-center justify-center text-center gap-space-xs">
            <div className="flex flex-wrap items-center justify-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
              <span className="font-bold text-primary">StudySaathi AI</span>
              <span aria-hidden="true">•</span>
              <span className="flex items-center gap-1">
                Built with{' '}
                <span
                  className="material-symbols-outlined text-[14px] text-error"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                  aria-label="love"
                >
                  favorite
                </span>{' '}
                for student success
              </span>
            </div>
            <p className="font-label-sm text-label-sm text-outline">
              Designed for Indian Curriculums (CBSE, ICSE, JEE, NEET, State Boards)
            </p>
          </footer>
        </div>
      </main>

      <Sidebar />
    </div>
  );
}
