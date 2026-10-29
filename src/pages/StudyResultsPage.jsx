import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import Card from '../components/Card';
import { useStudySet } from '../context/StudySetContext';
import { useQuiz } from '../context/QuizContext';

export default function StudyResultsPage() {
  const [activeTab, setActiveTab] = useState('summary');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const { studySet } = useStudySet();
  const { startQuiz } = useQuiz();

  if (!studySet) {
    return (
      <div className="font-body-md text-body-md text-on-surface flex flex-col min-h-screen">
        <Navbar subtitle="Study" />
        <main className="flex-1 flex flex-col w-full pt-24 sm:pt-28 pb-32 md:pb-16">
          <div className="flex flex-col w-full px-4 sm:px-6 py-6 max-w-xl md:max-w-3xl mx-auto">
            <Card className="flex flex-col items-center text-center gap-space-sm">
              <span className="neu-icon neu-icon--lg !w-16 !h-16 !rounded-3xl"><span className="material-symbols-outlined text-[34px]" aria-hidden="true">menu_book</span></span>
              <h1 className="font-headline-sm text-headline-sm text-primary font-bold">
                No study set yet
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Add your notes, a PDF or a photo and Saathi will build a summary, flashcards and a quiz for you.
              </p>
              <Button to="/create" variant="primary" size="md" icon="auto_awesome">
                Create a study set
              </Button>
            </Card>
          </div>
        </main>
        <Sidebar />
      </div>
    );
  }

  const { summary, flashcards, quiz, topicTitle, gradeSubject, curriculumBadge, subtitle } = studySet;

  const currentFlashcard = flashcards[currentCardIndex];

  const handleNextCard = () => {
    setIsCardFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevCard = () => {
    setIsCardFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  return (
    <div className="font-body-md text-body-md text-on-surface flex flex-col min-h-screen">
      <Navbar subtitle="Study" />

      <main className="flex-1 flex flex-col relative w-full pt-24 sm:pt-28 pb-32 md:pb-16">
        <div className="flex flex-col w-full px-4 sm:px-6 max-w-xl md:max-w-3xl lg:max-w-6xl mx-auto">
          {/* Topic Header Area */}
          <header className="pb-space-sm flex flex-col gap-space-xs rise">
            <div className="flex items-center justify-between gap-space-sm">
              <span className="pill pill--gold px-3 py-1.5 font-label-sm text-label-sm font-semibold">
                <span
                  className="material-symbols-outlined text-[15px] text-on-tertiary-container"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
                {gradeSubject}
              </span>
              <div className="pill px-3 py-1.5 text-on-surface-variant font-label-md text-label-md">
                <span className="material-symbols-outlined text-[16px] text-secondary">
                  verified
                </span>
                <span>{curriculumBadge}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-space-xs">
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile lg:font-headline-lg lg:text-headline-lg text-primary tracking-tight font-bold">
                {topicTitle}
              </h1>
              <button
                aria-label="Bookmark Topic"
                className="neu-icon neu-icon--round !text-primary"
                type="button"
                onClick={() => alert('Topic bookmarked for quick revision!')}
              >
                <span className="material-symbols-outlined text-[20px]">
                  bookmark_border
                </span>
              </button>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {subtitle}
            </p>
          </header>

          {/* Segmented Control Navigation Tabs */}
          <nav
            aria-label="Study Mode Selection"
            className="segmented my-5 max-w-xl w-full mx-auto"
          >
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              aria-current={activeTab === 'summary' ? 'true' : undefined}
              className="segmented__item font-label-lg text-label-lg"
            >
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
              <span>Summary</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('flashcards')}
              aria-current={activeTab === 'flashcards' ? 'true' : undefined}
              className="segmented__item font-label-lg text-label-lg"
            >
              <span className="material-symbols-outlined text-[18px]">style</span>
              <span>Flashcards</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              aria-current={activeTab === 'quiz' ? 'true' : undefined}
              className="segmented__item font-label-lg text-label-lg"
            >
              <span className="material-symbols-outlined text-[18px]">quiz</span>
              <span>Quiz</span>
            </button>
          </nav>

          {/* TAB 1: SUMMARY CONTENT */}
          {activeTab === 'summary' && (
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start rise">
              {/* Quick Summary Card */}
              <Card className="flex flex-col gap-space-sm relative overflow-hidden lg:col-span-5 lg:sticky lg:top-28">
                <div className="flex items-center gap-2 text-secondary font-label-lg text-label-lg font-bold">
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                  <h2>Quick Summary</h2>
                </div>
                <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                  {summary.quickSummary}
                </p>

                {/* Visual Hierarchy Diagram */}
                <div className="mt-space-xs p-3 neu-well flex items-center justify-between gap-1.5 overflow-x-auto">
                  {summary.hierarchy.map((item, index) => (
                    <React.Fragment key={item.symbol}>
                      <div
                        className={`flex flex-col items-center p-2.5 rounded-xl flex-1 min-w-[64px] ${
                          item.highlight
                            ? 'bg-secondary-fixed text-on-secondary-fixed-variant shadow-[0_6px_14px_-6px_rgba(61,85,240,0.5)] ring-1 ring-secondary/30'
                            : 'neu-raised neu-raised--sm'
                        }`}
                      >
                        <span className="font-headline-sm text-headline-sm text-secondary font-bold">
                          {item.symbol}
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          {item.name}
                        </span>
                      </div>
                      {index < summary.hierarchy.length - 1 && (
                        <span className="material-symbols-outlined text-outline text-[16px]">
                          arrow_forward
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </Card>

              {/* Key Concepts List */}
              <div className="flex flex-col gap-space-sm lg:col-span-7">
                <div className="flex items-center justify-between px-1">
                  <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                    Key Concepts
                  </h2>
                  <span className="pill px-2.5 py-1 font-label-sm text-label-sm text-on-surface-variant font-semibold">
                    {summary.keyConcepts.length} Core Rules
                  </span>
                </div>

                {summary.keyConcepts.map((concept) => (
                  <Card key={concept.id} className="flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`neu-icon neu-icon--round neu-icon--sm font-label-md text-label-md font-bold ${
                            concept.isHighlight ? '!text-on-tertiary-fixed-variant' : ''
                          }`}
                        >
                          {concept.symbol}
                        </span>
                        <h3 className="font-title-md text-title-md text-primary font-bold">
                          {concept.title}
                        </h3>
                      </div>
                      <span
                        className={`pill px-2.5 py-0.5 font-label-sm text-label-sm shrink-0 ${
                          concept.isHighlight ? 'pill--gold font-semibold' : 'text-on-surface-variant'
                        }`}
                      >
                        {concept.badge}
                      </span>
                    </div>

                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {concept.description}
                    </p>

                    <div className="neu-well !rounded-xl px-3 py-2 font-mono text-body-sm text-primary font-semibold tracking-wide overflow-x-auto">
                      {concept.code}
                    </div>

                    {concept.tip && (
                      <div className="mt-1 p-2.5 glass-panel flex items-center gap-2 text-on-surface">
                        <span
                          className="material-symbols-outlined text-[18px] text-tertiary-container"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          lightbulb
                        </span>
                        <span className="font-label-sm text-label-sm">
                          <strong>Crucial Fact:</strong> {concept.tip}
                        </span>
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {/* Quick CTA to Flashcards */}
              <Button
                variant="secondary"
                size="md"
                className="w-full lg:w-auto lg:col-span-12 lg:justify-self-start"
                iconRight="arrow_forward"
                onClick={() => setActiveTab('flashcards')}
              >
                Proceed to Flashcards
              </Button>
            </section>
          )}

          {/* TAB 2: FLASHCARDS SECTION */}
          {activeTab === 'flashcards' && (
            <section className="flex flex-col gap-space-md w-full max-w-2xl mx-auto rise">
              {/* Active Card Counter */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
                  <span className="font-label-lg text-label-lg text-primary font-bold">
                    Card {currentCardIndex + 1} of {flashcards.length}
                  </span>
                </div>

                {/* Progress Indicators */}
                <div className="flex items-center gap-1" aria-hidden="true">
                  {flashcards.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        idx === currentCardIndex
                          ? 'w-7 bg-gradient-to-r from-secondary to-[#7a62d6]'
                          : idx < currentCardIndex
                          ? 'w-3 bg-secondary/40'
                          : 'w-3 bg-surface-container-highest'
                      }`}
                    ></span>
                  ))}
                </div>
              </div>

              {/* Interactive Flashcard */}
              <Card
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                aria-pressed={isCardFlipped}
                aria-label={isCardFlipped ? 'Flashcard, answer shown. Press to see the question.' : 'Flashcard, question shown. Press to reveal the answer.'}
                className="!p-6 sm:!p-8 min-h-[280px] flex flex-col justify-between items-center text-center select-none"
              >
                {/* Header Tag */}
                <div className="flex items-center justify-between w-full">
                  <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-secondary">
                    {currentFlashcard.type}
                  </span>
                  <span className="material-symbols-outlined text-[20px] text-outline">
                    sync
                  </span>
                </div>

                {/* Card Body: Question or Answer */}
                <div key={`${currentCardIndex}-${isCardFlipped}`} className="flip-in py-space-md w-full flex flex-col items-center justify-center">
                  {!isCardFlipped ? (
                    <p className="font-headline-md-mobile text-headline-md-mobile sm:font-headline-md sm:text-headline-md text-primary font-semibold leading-relaxed">
                      {currentFlashcard.question}
                    </p>
                  ) : (
                    <div className="flex flex-col items-center gap-space-xs">
                      <span className="pill pill--accent px-3 py-1 font-label-sm text-label-sm font-semibold mb-1">
                        Answer Revealed
                      </span>
                      <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">
                        {currentFlashcard.answer}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Flip Prompt */}
                <div className="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    touch_app
                  </span>
                  <span>
                    {isCardFlipped ? 'Tap card to view question' : 'Tap card to flip and view explanation'}
                  </span>
                </div>
              </Card>

              {/* Flashcard Controls */}
              <div className="flex items-center gap-space-sm mt-space-xs">
                <Button
                  variant="subtle"
                  size="md"
                  icon="arrow_back"
                  className="flex-1"
                  onClick={handlePrevCard}
                >
                  Previous
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  iconRight="arrow_forward"
                  className="flex-1"
                  onClick={handleNextCard}
                >
                  Next Card
                </Button>
              </div>

              {/* Active Recall Tip */}
              <div className="glass glass--soft p-4 flex items-center gap-space-sm text-on-surface">
                <span
                  className="material-symbols-outlined text-[24px] text-secondary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  school
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md font-semibold">
                    Active Recall Tip
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Try verbalizing the answer before tapping to reveal it.
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* TAB 3: QUIZ PREVIEW */}
          {activeTab === 'quiz' && (
            <section className="flex flex-col gap-space-md w-full max-w-2xl mx-auto rise">
              {/* Quiz Header Banner Card */}
              <Card className="flex flex-col gap-space-md">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center gap-1 text-secondary font-label-sm text-label-sm font-bold uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[16px]">timer</span>
                      Speed Assessment
                    </span>
                    <h2 className="font-headline-md-mobile text-headline-md-mobile text-primary font-bold">
                      Practice MCQ Quiz
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Check how much of this study set you remember. You get instant feedback and an explanation for every answer.
                    </p>
                  </div>
                  <div className="neu-icon neu-icon--lg">
                    <span className="material-symbols-outlined text-[28px] text-secondary">
                      assignment
                    </span>
                  </div>
                </div>

                {/* Quiz Specifications Grid */}
                <div className="grid grid-cols-3 gap-2 p-4 neu-well text-center">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Length
                    </span>
                    <span className="font-headline-sm text-headline-sm text-primary font-bold">
                      {quiz.totalQuestions} Qs
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Time Limit
                    </span>
                    <span className="font-headline-sm text-headline-sm text-primary font-bold">
                      {quiz.timeLimitMinutes} Mins
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Format
                    </span>
                    <span className="font-headline-sm text-headline-sm text-secondary font-bold">
                      {quiz.format}
                    </span>
                  </div>
                </div>

                {/* Syllabus Coverage Breakdown */}
                <div className="flex flex-col gap-space-xs">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                    Included Concepts:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {quiz.coveredConcepts.map((c) => (
                      <span
                        key={c}
                        className="pill px-3 py-1 text-on-surface font-label-sm text-label-sm"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Start Quiz Action */}
                <Button
                  to="/quiz"
                  onClick={startQuiz}
                  variant="primary"
                  size="lg"
                  icon="play_arrow"
                  className="w-full mt-space-xs"
                >
                  Start Quiz
                </Button>
              </Card>

              {/* Target Accuracy Benchmark */}
              <div className="glass glass--soft p-4 flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <div className="neu-icon neu-icon--round !text-tertiary-container">
                    <span className="material-symbols-outlined text-[20px]">
                      military_tech
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-primary font-semibold">
                      Target Accuracy
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Aim for 80%+ to unlock advanced set
                    </span>
                  </div>
                </div>
                <span className="font-headline-sm text-headline-sm text-primary font-bold">
                  {quiz.targetAccuracy}
                </span>
              </div>
            </section>
          )}
        </div>
      </main>

      <Sidebar />
    </div>
  );
}

