# Biomarker Cards Implementation Guide

This guide explains how to integrate the interactive biomarker cards into your Patient Info interface.

## Overview

The BiomarkerCards component provides visual representation of lab results with:
- Interactive trend charts with hover tooltips
- Adaptive Y-axis scaling based on data
- Color-coded range indicators (red/green zones)
- Unified slider showing safe/unsafe ranges
- Automatic positioning to prevent label overlap

## Prerequisites

### 1. Install Dependencies

```bash
npm install recharts react-is
```

### 2. File Structure

```
components/
  patientInfo/
    BiomarkerCards.tsx          # Copy this file
    SummaryTab.tsx              # Modify this file
```

## Implementation Steps

### Step 1: Copy the BiomarkerCards Component

Copy the entire `BiomarkerCards.tsx` file to your project at:
```
components/patientInfo/BiomarkerCards.tsx
```

### Step 2: Update SummaryTab.tsx

#### 2.1 Add Import

At the top of `SummaryTab.tsx`, add:

```typescript
import { ElevatedCard } from './BiomarkerCards';
```

Also add the Droplet icon:

```typescript
import { Activity, Stethoscope, User, Clock, Droplet } from 'lucide-react';
```

#### 2.2 Replace the "Key Lab Findings" Section

Find the section that displays lab findings (usually a list with bullet points) and replace it with:

```tsx
{/* Key Findings - Biomarker Cards */}
<div className="bg-white rounded-lg border border-neutral-200 p-6">
  <div className="flex items-center gap-2 mb-6">
    <Droplet size={16} className="text-neutral-500" />
    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Key Lab Findings</span>
  </div>
  
  {/* Biomarker Cards - Single Column */}
  <div className="space-y-4 mb-6">
    {/* Add your biomarker cards here - see Step 3 */}
  </div>
  
  {/* Additional Findings (optional) */}
  <div className="pt-4 border-t border-neutral-100">
    <h4 className="text-sm font-semibold text-neutral-700 mb-3">Imaging Findings</h4>
    <ul className="space-y-2">
      <li className="flex items-start gap-3">
        <span className="w-2 h-2 rounded-full bg-neutral-400 mt-2 shrink-0"></span>
        <span className="text-sm text-neutral-800 leading-relaxed">
          {/* Your imaging findings text */}
        </span>
      </li>
    </ul>
  </div>
</div>
```

### Step 3: Add Biomarker Cards with Your Data

For each lab result, add an `ElevatedCard` component. Here's the data structure:

```tsx
<ElevatedCard
  title="ALT (Alanine Aminotransferase)"
  value={620}                    // Current value
  unit="U/L"                     // Unit of measurement
  date="2 days ago"              // Last updated
  ranges={[0, 10, 40, 800]}      // [min, lowThreshold, highThreshold, max]
  normalRange="10-40 U/L"        // Display text for normal range
  chartData={[                   // Historical data points
    { date: '3 weeks ago', value: 28 },
    { date: '2 weeks ago', value: 35 },
    { date: '1 week ago', value: 180 },
    { date: '3 days ago', value: 420 },
    { date: 'Today', value: 620 }
  ]}
/>
```

## Data Structure Reference

### ElevatedCard Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | Yes | Full name of the biomarker |
| `value` | number | Yes | Current measured value |
| `unit` | string | Yes | Unit of measurement (e.g., "U/L", "mg/dL", "%") |
| `date` | string | Yes | When the measurement was taken |
| `ranges` | number[] | Yes | Array of 4 numbers: [min, lowThreshold, highThreshold, max] |
| `normalRange` | string | No | Human-readable normal range text |
| `chartData` | ChartPoint[] | No | Array of historical data points |

### ChartPoint Interface

```typescript
interface ChartPoint {
  date: string;    // Display label (e.g., "3 weeks ago", "Jan 15")
  value: number;   // Measured value at that time
}
```

### Ranges Array Explanation

The `ranges` array defines the safe/unsafe zones:

```typescript
ranges = [min, lowThreshold, highThreshold, max]
```

- **min**: Absolute minimum value for the scale (usually 0)
- **lowThreshold**: Start of safe zone (values below this are "too low")
- **highThreshold**: End of safe zone (values above this are "too high")
- **max**: Absolute maximum value for the scale

**Example for ALT:**
```typescript
ranges={[0, 10, 40, 800]}
// 0-10: Too low (red zone)
// 10-40: Safe zone (green)
// 40-800: Too high (red zone)
```

## Complete Example

Here's a complete example with multiple biomarkers:

```tsx
<div className="space-y-4 mb-6">
  {/* ALT - Elevated */}
  <ElevatedCard
    title="ALT (Alanine Aminotransferase)"
    value={620}
    unit="U/L"
    date="2 days ago"
    ranges={[0, 10, 40, 800]}
    normalRange="10-40 U/L"
    chartData={[
      { date: '3 weeks ago', value: 28 },
      { date: '2 weeks ago', value: 35 },
      { date: '1 week ago', value: 180 },
      { date: '3 days ago', value: 420 },
      { date: 'Today', value: 620 }
    ]}
  />
  
  {/* AST - Elevated */}
  <ElevatedCard
    title="AST (Aspartate Aminotransferase)"
    value={450}
    unit="U/L"
    date="2 days ago"
    ranges={[0, 10, 35, 600]}
    normalRange="10-35 U/L"
    chartData={[
      { date: '3 weeks ago', value: 22 },
      { date: '2 weeks ago', value: 30 },
      { date: '1 week ago', value: 150 },
      { date: '3 days ago', value: 320 },
      { date: 'Today', value: 450 }
    ]}
  />
  
  {/* Total Bilirubin - Elevated */}
  <ElevatedCard
    title="Total Bilirubin"
    value={5.2}
    unit="mg/dL"
    date="2 days ago"
    ranges={[0, 0.3, 1.2, 10]}
    normalRange="0.3-1.2 mg/dL"
    chartData={[
      { date: '3 weeks ago', value: 0.8 },
      { date: '2 weeks ago', value: 0.9 },
      { date: '1 week ago', value: 1.8 },
      { date: '3 days ago', value: 3.5 },
      { date: 'Today', value: 5.2 }
    ]}
  />
</div>
```

## Connecting to Your Backend

### Option 1: Static Data from JSON

If your lab data is in a JSON file:

```typescript
import labResults from '../../dataobjects/lab_results.json';

// In your component:
{labResults.map((lab, index) => (
  <ElevatedCard
    key={index}
    title={lab.name}
    value={lab.currentValue}
    unit={lab.unit}
    date={lab.lastUpdated}
    ranges={lab.ranges}
    normalRange={lab.normalRangeText}
    chartData={lab.history}
  />
))}
```

### Option 2: Dynamic Data from API

```typescript
const [labResults, setLabResults] = useState([]);

useEffect(() => {
  fetch('/api/patient/lab-results')
    .then(res => res.json())
    .then(data => setLabResults(data));
}, []);

// Render:
{labResults.map((lab, index) => (
  <ElevatedCard
    key={index}
    title={lab.biomarkerName}
    value={lab.value}
    unit={lab.unit}
    date={lab.measuredAt}
    ranges={[lab.min, lab.lowThreshold, lab.highThreshold, lab.max]}
    normalRange={`${lab.lowThreshold}-${lab.highThreshold} ${lab.unit}`}
    chartData={lab.historicalData}
  />
))}
```

### Option 3: From Patient Summary Data

If your data is in `patient_summary.json`:

```typescript
import patientSummaryData from '../../dataobjects/patient_summary.json';

// Extract lab values from keyFindings
const labData = [
  {
    title: "ALT (Alanine Aminotransferase)",
    value: 620,
    unit: "U/L",
    ranges: [0, 10, 40, 800],
    normalRange: "10-40 U/L"
  },
  // ... more labs
];

{labData.map((lab, index) => (
  <ElevatedCard
    key={index}
    {...lab}
    date="2 days ago"
    chartData={generateChartData(lab.value)} // Helper function
  />
))}
```

## Helper Functions

### Generate Chart Data

If you don't have historical data, you can generate sample trend data:

```typescript
function generateChartData(currentValue: number, points: number = 5): ChartPoint[] {
  const data: ChartPoint[] = [];
  const timeLabels = ['3 weeks ago', '2 weeks ago', '1 week ago', '3 days ago', 'Today'];
  
  for (let i = 0; i < points; i++) {
    // Generate values that trend toward current value
    const progress = i / (points - 1);
    const value = currentValue * (0.3 + progress * 0.7);
    
    data.push({
      date: timeLabels[i] || `${points - i} days ago`,
      value: Math.round(value * 10) / 10
    });
  }
  
  return data;
}
```

### Parse Lab Results

If your backend returns different format:

```typescript
function parseLab Result(backendData: any) {
  return {
    title: backendData.test_name,
    value: parseFloat(backendData.result),
    unit: backendData.unit_of_measure,
    date: formatDate(backendData.collected_date),
    ranges: [
      backendData.reference_range.min,
      backendData.reference_range.low_normal,
      backendData.reference_range.high_normal,
      backendData.reference_range.max
    ],
    normalRange: `${backendData.reference_range.low_normal}-${backendData.reference_range.high_normal} ${backendData.unit_of_measure}`,
    chartData: backendData.history?.map(h => ({
      date: formatDate(h.date),
      value: parseFloat(h.value)
    })) || []
  };
}
```

## Styling Notes

The component uses Tailwind CSS classes. If you need to customize:

- Card padding: Change `p-4` in ElevatedCard
- Chart height: Change `h-[140px]` in HealthChart
- Font sizes: Adjust `text-[9px]`, `text-base`, etc.
- Colors: Modify `bg-red-400`, `bg-emerald-400`, etc.

## Features

### Adaptive Y-Axis
The chart automatically adjusts its Y-axis range based on:
- Actual data values (min/max)
- Safe zone thresholds
- 20% padding for better visualization

### Smart Label Positioning
Labels on the range slider automatically:
- Hide duplicates (e.g., when min = low threshold)
- Prevent overlaps (5% minimum spacing)
- Align with visual zone boundaries

### Interactive Charts
- Hover over data points to see exact values
- Smooth animations on load
- Color-coded based on safe/unsafe status

## Troubleshooting

### Charts not showing
- Verify recharts is installed: `npm list recharts`
- Check console for errors
- Ensure chartData array has at least 2 points

### Labels overlapping
- Increase spacing threshold in BiomarkerCards.tsx (line ~250)
- Reduce font size
- Use shorter date labels

### Wrong colors
- Verify ranges array is correct: [min, low, high, max]
- Check that value is a number, not string
- Ensure low < high in ranges

### Performance issues
- Limit chartData to 5-10 points
- Use React.memo for ElevatedCard if rendering many cards
- Debounce data updates

## Support

For issues or questions:
1. Check that all props match the expected types
2. Verify ranges array has exactly 4 numbers in ascending order
3. Ensure chartData dates are strings and values are numbers
4. Check browser console for React/TypeScript errors
