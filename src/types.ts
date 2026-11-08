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
