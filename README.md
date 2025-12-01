# CET-6 Recorder (Web App)

Github Pages：https://vasantlong.github.io/cet6-recorder/

An elegant, single-page application (SPA) designed to help students prepare for the **CET-6 (College English Test Band 6)**. It offers strict scoring algorithms, granular time tracking, and insightful performance analytics.

## 🚀 Key Features

- **Smart Scoring Engine**: Automatically calculates scores based on the official CET-6 weighting logic:
  - **Listening (35%)**: Granular support for Long Conversations, Passages, and Lectures.
  - **Reading (35%)**: Dedicated inputs for Banked Cloze, Matching, and Careful Reading.
  - **Writing & Translation (15% each)**: Standard score conversion (e.g., input 12/15 -> converted score).
- **Granular Practice Tracking**:
  - Track full mock exams or specific drills (e.g., "Just Reading Passage 1").
  - **Section Timer**: Log time for specific sections (e.g., 15 mins for Careful Reading) which auto-syncs to your score entry.
  - **Attempt Tracking**: Distinguishes between "Skipped" sections and "Failed" (0 score) sections for accurate average calculations.
- **Visual Analytics**:
  - **Dashboard**: View Total Sessions, Best Score, and Normalized Averages.
  - **Drill Performance**: See your specific strength in granular areas (e.g., matching vs. cloze).
  - **Trends Chart**: Dual-axis chart visualizing Score vs. Duration over time.
- **Data Management**:
  - **Local Storage** persistence (offline capable).
  - Export history to **CSV** for Excel analysis.
  - Data privacy (no server upload).

## 🛠 Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charting**: Recharts
- **Icons/Fonts**: Inter Font

## 📦 Installation & Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/VasantLong/cet6-recorder.git
   cd cet6-recorder
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run development server**:

   ```bash
   npm run dev
   ```

   Open http://localhost:5173 in your browser.

4. **Build for production**:

   ```bash
   npm run build
   ```

## 🚢 Deployment (GitHub Pages)

This project is configured for easy deployment to GitHub Pages.

1. Update vite.config.ts:

   ```typescript
   export default defineConfig({
     base: "/cet6-recorder/", // Replace with your repo name
     plugins: [react()],
   });
   ```

2. Run the deploy script:

   ```bash
   npm run deploy
   ```

## 🧩 Usage Guide

### Practice Mode

1. **Timer**: Select a target section (e.g., "Reading - Careful 1") and start the timer. When finished, click **"Log & Reset"** to send the time to the form.
2. **Score Entry**:
   - Toggle the **circle button** next to a section to mark it as "Attempted".
   - Enter your correct answer count (or standard score for Writing/Trans).
   - **Validation**: Active sections must have a valid time (except Listening). Zero scores require confirmation.
3. **Save**: Click "Save Record" to calculate your total and save to history.

### Statistics Mode

1. **Dashboard**: View normalized averages. For example, if you only did 1 reading passage, the score is scaled to represent a full section equivalent for accurate averaging.
2. **Chart**: Use the dropdown to switch metrics (e.g., view only "Writing" trends).
3. **Manage**: Export data to CSV or clear history.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

See the [LICENSE](LICENSE) file for details.

## TODO

- [x] !! Clear alert messages after user interaction.
- [ ] Improve the UI/UX for better user interaction.
- [x] Add dark mode support.
- [ ] Optimize performance for mobile devices.
- [ ] Implement user authentication for cloud storage options.
- [ ] Integrate with third-party APIs for additional resources.
