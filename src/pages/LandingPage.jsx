import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import Card from '../components/Card';

export default function LandingPage() {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface flex flex-col min-h-screen">
      <Navbar subtitle="Home" />

      <main className="flex-1 flex flex-col relative w-full pt-16 pb-24 bg-background">
        <div className="flex flex-col w-full px-margin py-space-md max-w-xl mx-auto space-y-space-lg">
          {/* Hero Section */}
          <section className="flex flex-col items-start pt-space-xs">
            {/* Amber Badge */}
            <div className="inline-flex items-center gap-space-xs px-3 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed shadow-sm">
              <span
                className="material-symbols-outlined text-[16px] text-on-tertiary-container"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                auto_awesome
              </span>
              <span className="font-label-sm text-label-sm tracking-wide">
                AI-Powered Study Assistant for Indian Students
              </span>
            </div>

            {/* Hero Heading & Subtitle */}
            <h1 className="mt-space-md font-display-mobile text-display-mobile text-primary tracking-tight font-extrabold">
              Study Smarter, Not Harder
            </h1>
            <p className="mt-space-sm font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Turn messy class notes into concise AI summaries, interactive flashcards, and exam-ready multiple-choice quizzes in seconds.
            </p>

            {/* CTAs */}
            <div className="mt-space-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm w-full">
              <Button
                to="/dashboard"
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                iconRight="arrow_forward"
              >
                Start Learning
              </Button>
              <Button
                to="#features"
                variant="secondary"
                size="md"
                className="w-full sm:w-auto py-3.5"
              >
                Explore Features
              </Button>
            </div>

            {/* Social Proof Badge */}
            <div className="mt-space-md flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                bolt
              </span>
              <span>
                Built for Hackathons & University Exams • 100% Free for Students
              </span>
            </div>
          </section>

          {/* Visual Hero Banner */}
          <div className="relative w-full rounded-xl overflow-hidden shadow-sm bg-surface-container-high aspect-[16/9] flex items-center justify-center">
            <img
              className="w-full h-full object-cover"
              alt="Indian student studying with tablet"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxRGiv7Tvi9O3kpWuvNQciMqztIVgxWyZCXzyboW7Ysrh_Zk8cEVFE_DgEHzbtCvPSG6rZeUv7brKdk569MM0M4l3NIb8xB4CKphd_y8iJfQHrr-rbDHRt_i00vPU_s2zr-SIJ4TAhJYTGjBlDfD9uJGRrOyh-87YqWwteE7nt2Cvxmp5bYViadgEdDyoWBkUdti5iOcgv4macIIG6IhNiHyhi1eiqVVTRBHMFL8_R"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent flex items-end p-space-md">
              <div className="flex items-center gap-space-sm bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                <span className="font-label-sm text-label-sm text-primary font-medium">
                  Over 12,000+ notes distilled this week
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Sample Topic Preview */}
          <section className="flex flex-col space-y-space-sm">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-primary font-bold">
                Live Concept Preview
              </span>
              <span className="font-label-sm text-label-sm text-secondary bg-surface-container px-2.5 py-1 rounded-full font-medium">
                Interactive Demo
              </span>
            </div>

            <Card className="space-y-space-md">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    CBSE Class 9 & 10 • Mathematics
                  </span>
                  <h3 className="font-title-md text-title-md text-primary mt-0.5 font-bold">
                    Real Numbers & Number Systems
                  </h3>
                </div>
                <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">
                    calculate
                  </span>
                </div>
              </div>

              {/* Pill Chips for subtopics */}
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm">
                  Natural Numbers
                </span>
                <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm">
                  Integers
                </span>
                <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm">
                  Rational Numbers
                </span>
                <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm">
                  Euclid's Lemma
                </span>
              </div>

              {/* Interactive Micro-Flashcard preview */}
              <div
                className="bg-surface-container-low rounded-xl p-space-md cursor-pointer transition-transform active:scale-[0.99] shadow-sm select-none border border-outline/10 hover:border-secondary/30"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm mb-1.5">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      style
                    </span>
                    <span>Tap to Reveal Concept</span>
                  </span>
                  <span className="text-secondary font-label-sm font-semibold">
                    {isFlipped ? 'Show Question ↺' : 'Flip Card ↻'}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-primary font-medium min-h-[44px]">
                  {isFlipped
                    ? 'Ans: An irrational number has a non-terminating and non-repeating decimal expansion (e.g., √2, π).'
                    : 'Q: What defines an irrational number in decimal expansion?'}
                </p>
              </div>
            </Card>
          </section>

          {/* 3 Core Feature Cards */}
          <section id="features" className="flex flex-col space-y-space-md">
            <div className="flex flex-col">
              <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                Designed for Deep Focus
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Everything an aspirant needs to master high-yield topics without friction.
              </p>
            </div>

            {/* Feature 1: Smart Summaries */}
            <Card hover className="space-y-space-sm">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[26px]">
                  summarize
                </span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                  Smart Summaries
                </h3>
                <p className="mt-1 font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  AI extracts key formulas, theorems, and definitions into bulleted, bite-sized revision points.
                </p>
              </div>
              <div className="pt-space-xs flex items-center gap-space-xs text-secondary font-label-md text-label-md font-semibold">
                <span>Instant PDF & Image scan</span>
                <span className="material-symbols-outlined text-[16px]">
                  chevron_right
                </span>
              </div>
            </Card>

            {/* Feature 2: Flashcards */}
            <Card hover className="space-y-space-sm">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[26px]">
                  flip
                </span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                  Flashcards
                </h3>
                <p className="mt-1 font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Active recall memory cards with tap-to-flip answers to master complex terminology quickly.
                </p>
              </div>
              <div className="pt-space-xs flex items-center gap-space-xs text-secondary font-label-md text-label-md font-semibold">
                <span>Spaced repetition scheduling</span>
                <span className="material-symbols-outlined text-[16px]">
                  chevron_right
                </span>
              </div>
            </Card>

            {/* Feature 3: Practice Quizzes */}
            <Card hover className="space-y-space-sm">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[26px]">
                  quiz
                </span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                  Practice Quizzes
                </h3>
                <p className="mt-1 font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Instant MCQs with instant feedback, time tracking, and detailed explanations to test comprehension.
                </p>
              </div>
              <div className="pt-space-xs flex items-center gap-space-xs text-secondary font-label-md text-label-md font-semibold">
                <span>Timed mock exam modes</span>
                <span className="material-symbols-outlined text-[16px]">
                  chevron_right
                </span>
              </div>
            </Card>
          </section>

          {/* Secondary Motivational Callout */}
          <section className="bg-primary text-on-primary rounded-xl p-6 shadow-md flex flex-col space-y-space-sm">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-secondary-fixed text-[20px]">
                workspace_premium
              </span>
              <span className="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-wider font-semibold">
                Aspirant Friendly
              </span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-primary font-bold">
              Ready to accelerate your syllabus?
            </h3>
            <p className="font-body-sm text-body-sm text-surface-variant leading-relaxed">
              Upload your first syllabus chapter or lecture slides and generate comprehensive study modules in under 15 seconds.
            </p>
            <div className="pt-space-xs">
              <Button
                to="/dashboard"
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                iconRight="arrow_forward"
              >
                Start Learning
              </Button>
            </div>
          </section>

          {/* Footer */}
          <footer className="pt-space-md pb-space-lg flex flex-col items-center justify-center text-center space-y-space-xs">
            <div className="flex items-center justify-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
              <span className="font-bold text-primary">StudySaathi AI</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                Built with{' '}
                <span
                  className="material-symbols-outlined text-[14px] text-error"
                  style={{ fontVariationSettings: '"FILL" 1' }}
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

