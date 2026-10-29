export const sampleNotes = `Real Numbers comprise Rational and Irrational numbers. Natural numbers (N) are counting numbers 1, 2, 3... Whole numbers (W) include 0, 1, 2, 3... Integers (Z) include negative numbers, zero, and positive numbers. Rational numbers (Q) can be written as p/q where q ≠ 0 and p, q are integers. Prime numbers have only two factors: 1 and themselves (e.g., 2, 3, 5, 7, 11). 2 is the only even prime number.`;

export const studySetData = {
  topicTitle: "Number System - CBSE Class 9 Maths",
  gradeSubject: "Class 9 Mathematics • AI Generated",
  curriculumBadge: "NCERT Aligned",
  subtitle: "Master fundamental sets, decimal expansions, and real numbers hierarchy.",

  summary: {
    quickSummary:
      "Real numbers encompass all rational and irrational numbers, forming the absolute foundation of arithmetic and continuous coordinate systems. Every real number corresponds to a unique point on the real number line.",
    hierarchy: [
      { symbol: "N", name: "Natural", highlight: false },
      { symbol: "W", name: "Whole", highlight: false },
      { symbol: "Z", name: "Integers", highlight: false },
      { symbol: "R", name: "Reals", highlight: true }
    ],
    keyConcepts: [
      {
        id: "natural",
        symbol: "N",
        title: "Natural Numbers (N)",
        badge: "Counting",
        description: "Positive integers starting from 1 with no upper limit.",
        code: "{ 1, 2, 3, 4, ... }"
      },
      {
        id: "whole",
        symbol: "W",
        title: "Whole Numbers (W)",
        badge: "Zero Included",
        description: "All natural numbers augmented with zero.",
        code: "{ 0, 1, 2, 3, ... }"
      },
      {
        id: "integers",
        symbol: "Z",
        title: "Integers (Z)",
        badge: "Positive & Negative",
        description: "Complete set of whole numbers along with their additive inverses.",
        code: "{ ..., -2, -1, 0, 1, 2, ... }"
      },
      {
        id: "rational",
        symbol: "Q",
        title: "Rational Numbers",
        badge: "p / q Form",
        description: "Expressible as p/q where p, q ∈ Z and q ≠ 0. Either terminating or repeating decimals.",
        code: "Examples: 1/2, 0.75, -4 (-4/1), 0.333..."
      },
      {
        id: "irrational",
        symbol: "I",
        title: "Irrational Numbers",
        badge: "Non-Repeating",
        description: "Cannot be written in ratio format; decimals are non-terminating and non-recurring.",
        code: "Examples: √2, π, √3, e"
      },
      {
        id: "prime",
        symbol: "P",
        title: "Prime Numbers",
        badge: "Exam Alert",
        isHighlight: true,
        description: "Numbers strictly greater than 1 with exactly two distinct factors: 1 and the number itself.",
        code: "{ 2, 3, 5, 7, 11, 13, 17, 19, ... }",
        tip: "2 is the ONLY even prime number!"
      }
    ]
  },

  flashcards: [
    {
      id: 1,
      type: "QUESTION / DEFINITION",
      question: "What defines a Rational Number?",
      answer: "A number that can be expressed in the form p/q, where p and q are integers and q ≠ 0."
    },
    {
      id: 2,
      type: "CONCEPT CHECK",
      question: "Is zero (0) a rational number?",
      answer: "Yes! Zero can be written as 0/1, 0/2, 0/-5, fulfilling the p/q format where denominator ≠ 0."
    },
    {
      id: 3,
      type: "KEY EXAM FACT",
      question: "What is the only even prime number, and why?",
      answer: "2 is the only even prime number. Any higher even number is divisible by 2, giving it at least three factors (1, 2, and itself)."
    },
    {
      id: 4,
      type: "PROPERTY DEFINITION",
      question: "What characterizes an irrational decimal expansion?",
      answer: "Decimal expansions of irrational numbers are strictly non-terminating and non-recurring (e.g., √2 = 1.4142135...).",
    },
    {
      id: 5,
      type: "ARITHMETIC RULE",
      question: "What is the sum of a rational number and an irrational number?",
      answer: "The sum or difference of a rational number and an irrational number is always irrational. E.g., 2 + √3 is irrational."
    },
    {
      id: 6,
      type: "SET DISTINCTION",
      question: "Are all whole numbers also natural numbers?",
      answer: "No! 0 is a whole number, but 0 is NOT a natural number. However, all natural numbers are whole numbers."
    },
    {
      id: 7,
      type: "ALGEBRAIC TECHNIQUE",
      question: "How do you rationalize the denominator of 1 / (√a + √b)?",
      answer: "Multiply both the numerator and denominator by the conjugate (√a - √b) using the identity (√a + √b)(√a - √b) = a - b."
    },
    {
      id: 8,
      type: "THEOREM",
      question: "What does Euclid's Division Lemma state?",
      answer: "For any two positive integers a and b, there exist unique integers q and r such that a = bq + r, where 0 ≤ r < b."
    }
  ],

  quiz: {
    totalQuestions: 10,
    timeLimitMinutes: 15,
    format: "MCQ",
    coveredConcepts: [
      "Representation on Number Line",
      "Decimal Expansions",
      "Rationalizing Denominators",
      "Laws of Exponents"
    ],
    targetAccuracy: "8/10",
    questions: [
      {
        id: 1,
        topic: "Irrational Numbers",
        question: "Which of the following numbers is an irrational number?",
        subtitle: "Select the option that cannot be expressed as a quotient of two integers with a non-zero denominator.",
        options: [
          "0.75 (Terminating decimal)",
          "22/7 (p/q form)",
          "√2 (Square root of 2)",
          "0 (Whole number / Integer)"
        ],
        correctAnswer: 2,
        explanation: "√2 has a non-terminating and non-repeating decimal expansion, so it cannot be expressed in p/q form."
      },
      {
        id: 2,
        topic: "Rational Numbers",
        question: "Is zero (0) a rational number?",
        subtitle: "Evaluate whether zero fulfills the standard definition of rational numbers.",
        options: [
          "No, because zero has no numerical value",
          "Yes, because it can be written as 0/q where q ≠ 0",
          "Only in negative coordinate sets",
          "It is an irrational mathematical constant"
        ],
        correctAnswer: 1,
        explanation: "Zero can be written as 0/1, 0/2, 0/100, where numerator and denominator are integers and denominator ≠ 0."
      },
      {
        id: 3,
        topic: "Prime Numbers",
        question: "Which of the following statements about prime numbers is TRUE?",
        subtitle: "Check the fundamental properties of prime numbers.",
        options: [
          "1 is the smallest prime number",
          "All prime numbers are odd numbers",
          "2 is the only even prime number",
          "There are finitely many primes under 1000"
        ],
        correctAnswer: 2,
        explanation: "2 has exactly two factors (1 and 2) and is the only even prime. All other even numbers have at least three factors (1, 2, and the number)."
      },
      {
        id: 4,
        topic: "Decimal Expansions",
        question: "What type of decimal expansion does 1/7 produce?",
        subtitle: "Analyze the denominator's prime factorization.",
        options: [
          "Terminating decimal",
          "Non-terminating recurring decimal",
          "Non-terminating non-recurring decimal",
          "Terminates after 6 decimal places"
        ],
        correctAnswer: 1,
        explanation: "Since the prime factors of denominator 7 are not of the form 2^n × 5^m, it results in a non-terminating repeating block (0.142857...)."
      },
      {
        id: 5,
        topic: "Real Number Operations",
        question: "The product of a non-zero rational number and an irrational number is always:",
        subtitle: "Recall the closure properties of real numbers under multiplication.",
        options: [
          "Always rational",
          "Always irrational",
          "Zero",
          "Sometimes rational, depending on sign"
        ],
        correctAnswer: 1,
        explanation: "Multiplying any non-zero rational number by an irrational number always produces an irrational number."
      },
      {
        id: 6,
        topic: "Density of Numbers",
        question: "Between any two distinct rational numbers, there exist:",
        subtitle: "Consider the density property of rational numbers.",
        options: [
          "Only one unique rational number",
          "No rational numbers at all",
          "Infinitely many rational numbers",
          "Exactly 10 rational numbers"
        ],
        correctAnswer: 2,
        explanation: "Rational numbers are dense on the number line; between any two distinct numbers there is an infinite count of rationals."
      },
      {
        id: 7,
        topic: "Rationalization & Radicals",
        question: "What is the simplified value of (√3 + √2)(√3 - √2)?",
        subtitle: "Apply the algebraic identity (a + b)(a - b) = a² - b².",
        options: [
          "1",
          "5",
          "√6",
          "2√3"
        ],
        correctAnswer: 0,
        explanation: "(√3)² - (√2)² = 3 - 2 = 1, which is a rational number."
      },
      {
        id: 8,
        topic: "Laws of Exponents",
        question: "The value of 64^(1/2) is:",
        subtitle: "Apply radical exponent rules.",
        options: [
          "4",
          "8",
          "16",
          "32"
        ],
        correctAnswer: 1,
        explanation: "64^(1/2) = √64 = 8, because 8 × 8 = 64."
      },
      {
        id: 9,
        topic: "Classification of Integers",
        question: "Every integer m can be classified as a rational number because:",
        subtitle: "Identify the representation of integers in p/q format.",
        options: [
          "It can always be written as m/1",
          "It is always a positive value",
          "It has a square root that is an integer",
          "It cannot be plotted on a number line"
        ],
        correctAnswer: 0,
        explanation: "Any integer m can be written as m/1, where m, 1 ∈ Z and 1 ≠ 0, satisfying the definition of a rational number."
      },
      {
        id: 10,
        topic: "Euclid's Division Lemma",
        question: "Which of the following equations represents Euclid's Division Lemma for positive integers a and b?",
        subtitle: "Check the remainder inequality constraint.",
        options: [
          "a = bq - r",
          "a = bq + r (where 0 ≤ r < b)",
          "a = b/q + r (where r > b)",
          "a = b + qr (where r = 0)"
        ],
        correctAnswer: 1,
        explanation: "Euclid's division lemma states that for positive integers a and b, there exist unique integers q and r such that a = bq + r, with 0 ≤ r < b."
      }
    ]
  }
};

