# Bajaj Life Incentive Calculator (React)

This project is a modern React SPA (Single Page Application) version of the Bajaj Life Incentive Calculator. It was migrated from a legacy static HTML/CSS/Vanilla JS architecture to a component-driven React + Vite application, ensuring high performance, maintainability, and code reusability while strictly preserving existing business logic and calculation formulas.

## Features

*   **Framework:** React 18 + Vite for fast development and optimized production builds.
*   **Routing:** React Router v6 (`HashRouter`) for seamless client-side navigation.
*   **Calculators Included:**
    *   Jan'26 Term SM (BAU & BFL)
    *   Jan'26 Term Outsource (BAU & BFL)
    *   Jan'26 Non-Term (BAU & BFL)
    *   Feb'26 Term (BAU & BFL)
    *   Feb'26 Non-Term (BAU & BFL)
*   **Business Logic Separation:** Core calculation logic, gates, and formulas are decoupled from UI components and live in `src/calculators/`.
*   **Reusable Components:** Extracted common UI patterns (Headers, Progress Bars, Modals) into `src/components/`.
*   **Visual Enhancements:** Preserved all original styling and animations, including the Confetti success effect.

## Tech Stack

*   **React:** UI View Library
*   **Vite:** Build Tool & Dev Server
*   **React Router:** Client-side Routing
*   **Canvas Confetti:** Celebration animations
*   **Vanilla CSS:** Modular styling mapped to original designs

## Getting Started

### Prerequisites

Ensure you have Node.js installed (v18 or higher recommended).

### Installation

1. Clone the repository to your local machine.
2. Navigate to the project directory:
   ```bash
   cd incentive-calculator-react
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the development server with Hot-Module Replacement (HMR):

```bash
npm run dev
```

The app will become available at `http://localhost:5173`.

### Building for Production

To create an optimized, minified production build:

```bash
npm run build
```

The output will be generated inside the `dist/` directory, ready to be deployed to any static hosting provider.
Since this project uses `HashRouter`, it can be served continuously from a static file location without complex server-side route rewrites.

## Project Structure

```text
src/
├── assets/
│   ├── images/         # Logos and icons
│   └── styles/         # Page-specific CSS files
├── calculators/        # Core business logic separated from UI
│   ├── febNonTermCalc.js
│   ├── febTermCalc.js
│   ├── janNonTermCalc.js
│   ├── janTermOutsourceCalc.js
│   └── janTermSMCalc.js
├── components/         # Reusable React components
│   ├── CalculatorHeader.jsx
│   ├── ProgressBar.jsx
│   └── TncModal.jsx
├── pages/              # Routing entry points for each calculator
│   ├── FebNonTermPage.jsx
│   ├── FebTermPage.jsx
│   ├── HomePage.jsx
│   ├── JanNonTermPage.jsx
│   ├── JanTermOutsourcePage.jsx
│   └── JanTermSMPage.jsx
├── utils/              # Helper functions and hooks
│   ├── confettiTrigger.js
│   ├── helpers.js
│   └── useCalcBodyStyle.js
├── App.jsx             # React Router setup
└── main.jsx            # Application entry point
```

