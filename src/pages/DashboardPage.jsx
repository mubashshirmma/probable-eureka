import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import Card from '../components/Card';
import { useStudySet } from '../context/StudySetContext';
import { studySetData } from '../data/sampleData';

export default function DashboardPage() {
  const { setStudySet } = useStudySet();
  // The Number System card is a built-in demo set, loaded only when the student opens it.
  const loadDemoSet = () => setStudySet(studySetData, 'demo');

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface flex flex-col min-h-screen">
      <Navbar subtitle="Dashboard" />

      <main className="flex-1 flex flex-col relative w-full pt-16 pb-24 bg-background">
        <div className="flex flex-col w-full px-margin py-space-md max-w-xl mx-auto space-y-space-md">
          {/* Student Welcome Banner */}
          <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col space-y-space-sm relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex flex-col min-w-0 pr-space-sm">
                <div className="inline-flex items-center gap-space-xs mb-1">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                    Exam Prep Mode • Active
                  </span>
                </div>
                <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-tight font-bold">
                  Welcome back, Student
                </h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Ready to accelerate your revision today?
                </p>
              </div>

              {/* Compact Target Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-high rounded-full self-start flex-shrink-0">
                <span
                  className="material-symbols-outlined text-[16px] text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  target
                </span>
                <span className="font-label-md text-label-md text-primary font-semibold">
                  JEE 2025
                </span>
              </div>
            </div>

            {/* Primary Quick Creation CTA Button */}
            <div className="pt-space-xs">
              <Button
                to="/create"
                variant="primary"
                size="md"
                className="w-full h-11"
                icon="auto_awesome"
              >
                + Create Study Set
              </Button>
            </div>
          </section>

          {/* Metric Badges & Learning Highlights Grid */}
          <section aria-label="Learning Metrics" className="grid grid-cols-2 gap-space-sm">
            {/* Sets Created */}
            <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex flex-col justify-between h-24">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant truncate font-medium">
                  Sets Created
                </span>
                <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">
                    folder_special
                  </span>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-headline-md-mobile text-headline-md-mobile text-primary font-bold">
                  3
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Sets
                </span>
              </div>
            </div>

            {/* Quizzes Taken */}
            <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex flex-col justify-between h-24">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant truncate font-medium">
                  Quizzes Taken
                </span>
                <div className="w-7 h-7 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    quiz
                  </span>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-headline-md-mobile text-headline-md-mobile text-primary font-bold">
                  12
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Quizzes
                </span>
              </div>
            </div>

            {/* Average Score */}
            <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex flex-col justify-between h-24">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant truncate font-medium">
                  Avg Score
                </span>
                <div className="w-7 h-7 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant">
                  <span className="material-symbols-outlined text-[18px]">
                    insights
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-headline-md-mobile text-headline-md-mobile text-primary font-bold">
                  84%
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm flex items-center font-bold">
                  Top 10%
                </span>
              </div>
            </div>

            {/* Study Streak */}
            <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex flex-col justify-between h-24">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant truncate font-medium">
                  Study Streak
                </span>
                <div className="w-7 h-7 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary-container">
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    local_fire_department
                  </span>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-headline-md-mobile text-headline-md-mobile text-primary font-bold">
                  5
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Days 🔥
                </span>
              </div>
            </div>
          </section>

          {/* Pro Tip Box */}
          <section className="bg-surface-container rounded-xl p-space-sm flex items-start gap-space-sm shadow-sm">
            <div className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center flex-shrink-0 text-on-tertiary-container shadow-xs">
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                lightbulb
              </span>
            </div>
            <div className="flex flex-col min-w-0 pr-1">
              <span className="font-label-md text-label-md text-primary font-semibold">
                Pro Tip
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
                Take a 5-question quiz right after reviewing flashcards to boost retention by 40%.
              </p>
            </div>
          </section>

          {/* Recent Study Sets List */}
          <section aria-label="Recent Sets" className="flex flex-col space-y-space-sm">
            <div className="flex items-center justify-between pt-1">
              <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                Recent Study Sets
              </h2>
              <button
                type="button"
                className="font-label-md text-label-md text-secondary hover:underline flex items-center gap-0.5"
              >
                View All
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </button>
            </div>

            {/* Set Card 1: Number System */}
            <Card className="flex flex-col space-y-space-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm font-semibold">
                      Mathematics
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      Ready
                    </span>
                  </div>
                  <h3 className="font-title-md text-title-md text-primary truncate font-bold">
                    Number System
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span>14 Flashcards</span>
                    <span>•</span>
                    <span>10 MCQ Quiz</span>
                    <span>•</span>
                    <span className="text-outline">2h ago</span>
                  </p>
                </div>
                <button
                  aria-label="More options"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    more_vert
                  </span>
                </button>
              </div>

              {/* Action Row */}
              <div className="grid grid-cols-2 gap-space-sm pt-1">
                <Button
                  to="/results"
                  onClick={loadDemoSet}
                  variant="subtle"
                  size="sm"
                  icon="style"
                >
                  Study
                </Button>
                <Button
                  to="/quiz"
                  onClick={loadDemoSet}
                  variant="primary"
                  size="sm"
                  icon="play_arrow"
                >
                  Take Quiz
                </Button>
              </div>
            </Card>

            {/* Set Card 2: Algebra Basics */}
            <Card className="flex flex-col space-y-space-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm font-semibold">
                      Mathematics
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm flex items-center gap-1">
                      <span
                        className="material-symbols-outlined text-[12px] text-secondary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                      Completed (88%)
                    </span>
                  </div>
                  <h3 className="font-title-md text-title-md text-primary truncate font-bold">
                    Algebra Basics
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span>18 Flashcards</span>
                    <span>•</span>
                    <span>15 MCQ Quiz</span>
                    <span>•</span>
                    <span className="text-outline">Yesterday</span>
                  </p>
                </div>
                <button
                  aria-label="More options"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    more_vert
                  </span>
                </button>
              </div>

              {/* Action Row */}
              <div className="grid grid-cols-2 gap-space-sm pt-1">
                <Button
                  variant="subtle"
                  size="sm"
                  icon="replay"
                  onClick={() => alert('Revising Algebra Basics...')}
                >
                  Revise
                </Button>
                <Button
                  variant="subtle"
                  size="sm"
                  icon="analytics"
                  className="text-secondary"
                  onClick={() => alert('Showing Algebra Basics statistics...')}
                >
                  Review Stats
                </Button>
              </div>
            </Card>

            {/* Set Card 3: Trigonometry */}
            <Card className="flex flex-col space-y-space-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm font-semibold">
                      Mathematics
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-tertiary-container font-label-sm text-label-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container"></span>
                      In Progress
                    </span>
                  </div>
                  <h3 className="font-title-md text-title-md text-primary truncate font-bold">
                    Trigonometry
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span>22 Flashcards</span>
                    <span>•</span>
                    <span>12 MCQ Quiz</span>
                    <span>•</span>
                    <span className="text-outline">3 days ago</span>
                  </p>
                </div>
                <button
                  aria-label="More options"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    more_vert
                  </span>
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                <div className="bg-secondary h-full rounded-full w-[45%]"></div>
              </div>

              {/* Action Row */}
              <div className="grid grid-cols-2 gap-space-sm pt-1">
                <Button
                  variant="subtle"
                  size="sm"
                  icon="style"
                  onClick={() => alert('Continuing Trigonometry cards...')}
                >
                  Continue (9/22)
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon="play_arrow"
                  onClick={() => alert('Starting Trigonometry Quiz...')}
                >
                  Take Quiz
                </Button>
              </div>
            </Card>
          </section>

          {/* Quick Peer Motivation Snippet */}
          <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <div className="flex -space-x-2 overflow-hidden">
                <span className="inline-block h-8 w-8 rounded-full ring-2 ring-surface-container-lowest bg-surface-variant flex items-center justify-center text-primary font-label-sm text-label-sm font-semibold">
                  AK
                </span>
                <span className="inline-block h-8 w-8 rounded-full ring-2 ring-surface-container-lowest bg-secondary-fixed flex items-center justify-center text-secondary font-label-sm text-label-sm font-semibold">
                  PS
                </span>
                <span className="inline-block h-8 w-8 rounded-full ring-2 ring-surface-container-lowest bg-tertiary-fixed flex items-center justify-center text-tertiary-container font-label-sm text-label-sm font-semibold">
                  +4
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-primary font-semibold">
                  Batch Leaderboard
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Rank #14 in Kota Study Circle
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline">
              chevron_right
            </span>
          </section>
        </div>
      </main>

      <Sidebar />
    </div>
  );
}

