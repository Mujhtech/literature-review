# Literature Review Assistant

An AI-powered tool that helps students analyze research papers for their literature review. The application extracts key information from PDF papers and evaluates their relevance to the student's research topic.

## Features

- Upload multiple PDF research papers
- Extract key information:
  - Aim/Purpose
  - Methodology
  - Results
  - Scope
  - Relevance to research topic
- Modern, responsive UI
- Real-time analysis feedback

## Prerequisites

- Node.js 18+ and npm/pnpm
- OpenAI API key

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd literature-review
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env.local` file in the root directory and add your OpenAI API key:

```
OPENAI_API_KEY=your-api-key-here
```

4. Run the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

1. Enter your research topic in the input field
2. Upload PDF research papers by dragging and dropping them or clicking the upload area
3. Click "Analyze Papers" to start the analysis
4. View the results for each paper, including:
   - Main aim/purpose
   - Methodology used
   - Key results
   - Research scope
   - Relevance to your topic

## Technologies Used

- Next.js 14 with App Router
- React 19
- TypeScript
- Tailwind CSS
- Shadcn UI
- LangChain
- OpenAI API
- PDF.js

## License

MIT
