VedaAI - AI Assessment Extraction & Answer Mapping

Project Overview

VedaAI is an AI-powered assessment platform designed to help teachers analyze student answer sheets efficiently. The platform allows teachers to upload a question paper and a handwritten answer sheet, automatically extracts questions and answers using AI, maps each answer to its corresponding question, and highlights the exact region of the answer sheet.

The platform also provides an AI Teacher's Toolkit that helps teachers generate questions, lesson plans, worksheets, explanations, and student insights.

Features

• AI-based Question Extraction: Automatically extracts all questions while preserving original numbering and order.

• Handwritten Answer Extraction: Uses AI to analyze handwritten student answers.

• Intelligent Answer Mapping: Matches answers to the correct questions even when answers are written out of order.

• Sub-question Detection: Treats 11(a) and 11(b) as separate questions.

• Answer Region Highlighting: Highlights the exact answer region corresponding to the selected question.

• Multi-page Answer Support: Handles answers that continue across multiple pages.

• Unanswered Question Detection: Identifies questions not answered by the student.

• Unmatched Answer Detection: Identifies answers that cannot be confidently mapped.

• AI-assisted Grading: Provides marks and feedback.

• Question & Answer Search: Allows teachers to search and filter assessment content.

• AI Teacher's Toolkit: Provides AI tools for question generation, lesson planning, worksheets, explanations, student insights, and teacher assistance.

• User Authentication: Includes login and registration.

• Analysis History: Allows access to previously created assessments.

• Responsive Interface: Works across desktop, tablet, and mobile devices.

Tech Stack

• Frontend: Next.js, React.js, TypeScript, CSS

• Backend: Next.js API Routes, Node.js

• AI: Google Gemini API

• Document Processing: PDF and Image Processing

• Authentication: Server-side authentication with secure password handling

• Icons: Lucide React

• Deployment: Vercel / Next.js-compatible hosting

Installation Instructions

1. Clone the repository.

2. Navigate to the project directory.

3. Install dependencies using npm install.

4. Create a .env.local file and add GEMINI_API_KEY=your_gemini_api_key.

5. Run the application using npm run dev.

6. Open http://localhost:3000 in a browser.

Usage Guide

• User Registration: Create a teacher account.

• User Login: Log in using the registered credentials.

• Upload Question Paper: Upload a PDF or image question paper.

• Upload Answer Sheet: Upload the student's handwritten answer sheet.

• Start Analysis: Start AI-powered extraction and mapping.

• Review Questions: View extracted questions in printed order.

• View Answers: Click a question to immediately display its mapped answer.

• Answer Highlighting: The selected answer is automatically highlighted.

• Search Questions: Search question numbers, question text, or answer content.

• Review Unanswered Questions: Filter unanswered questions.

• View AI Feedback: Review AI-generated marks and feedback.

• Teacher's Toolkit: Generate teaching resources and use AI assistance.

AI Teacher's Toolkit

• Question Paper Generator: Generate questions based on subject, topic, grade, difficulty, and marks.

• Lesson Plan Generator: Generate structured lesson plans.

• Worksheet Generator: Create practice worksheets.

• Question Explainer: Generate simple and detailed explanations.

• Student Insights: Generate AI-assisted performance insights.

• AI Teacher Chat: Ask teaching-related questions and receive AI assistance.

Video Demo

Video Demo Link: [Add deployed demo/video URL]

Project Structure

VedaAI/

├── app/

│   ├── api/

│   │   ├── analyze/

│   │   └── toolkit/

│   ├── login/

│   ├── register/

│   ├── dashboard/

│   ├── exams/

│   ├── analyses/

│   ├── library/

│   ├── settings/

│   ├── toolkit/

│   ├── page.tsx

│   ├── layout.tsx

│   └── globals.css

├── components/

├── public/

├── .env.example

├── package.json

├── tsconfig.json

└── README.md

Core Workflow

Upload Question Paper

        ↓

Question Extraction

        ↓

Upload Answer Sheet

        ↓

Answer Extraction

        ↓

Question-Answer Mapping

        ↓

Answer Region Detection

        ↓

AI Grading & Feedback

        ↓

Teacher Review

Future Enhancements

• Batch processing of multiple answer sheets

• Advanced rubric-based grading

• Class-level performance analytics

• Student performance dashboards

• Export assessment reports to PDF/Excel

• Cloud database integration

• Teacher correction of AI-generated mappings

• Multi-language support

• Advanced OCR and handwriting recognition

This document provides an overview of the VedaAI platform, its AI-powered assessment workflow, technology stack, setup instructions, usage process, and project structure.