/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // index of options
  explanation: string;
}

export interface Topic {
  id: string;
  title: string;
  content: string;
  icon: string;
  quiz: QuizQuestion[];
}

export interface SoalOption {
  text: string;
  image?: string;
}

export interface SoalSet {
  id: string;
  title: string;
  description: string;
  kelas?: string;
  isActive: boolean;
  isFullScreen?: boolean;
  isScoreVisible?: boolean;
  timerMode: 'per_judul' | 'per_soal';
  titleTimerSeconds: number;
  defaultQuestionTimerSeconds: number;
  shuffleQuestions?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SoalQuestion {
  id: string;
  setId: string;
  order: number;
  isActive: boolean;
  questionText: string;
  questionImage?: string;
  options: [SoalOption, SoalOption, SoalOption, SoalOption];
  correctAnswer: 0 | 1 | 2 | 3;
  timerSeconds: number;
  explanation?: string;
  createdAt: string;
  updatedAt: string;
}

