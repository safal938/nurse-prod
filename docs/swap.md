# Implementing Smooth Auto-Sorting Animations

This guide explains how to create a list of items that can be programmatically reordered (shuffled, swapped, or sorted) with smooth animations using **React** and **Framer Motion**.

## 1. Prerequisites

You need to install Framer Motion.

```bash
npm install framer-motion
# or
yarn add framer-motion
```

## 2. Core Concept

The smooth animation is achieved not by calculating pixel positions manually, but by leveraging Framer Motion's `layout` prop.

1.  **State Change**: You update the order of items in your React state array.
2.  **React Render**: React re-renders the list in the new order.
3.  **Framer Motion**: The `layout` prop detects that the element's position on the screen has changed and automatically interpolates (animates) the transform from the old position to the new one.
4.  **Delays**: To visualize a sorting algorithm (like Bubble Sort), we introduce artificial delays (`setTimeout`) between state updates.

## 3. The Component Structure

### Step A: The Animated Card Component

The child component **must** use `motion.div` and include the `layout` prop.

```tsx
// Card.tsx
import { motion } from 'framer-motion';

interface CardProps {
  id: string;
  text: string;
  isHighlighted?: boolean;
}

export const Card = ({ id, text, isHighlighted }: CardProps) => {
  return (
    <motion.div
      // 1. The layout prop triggers the magic animation
      layout
      // 2. layoutId helps Framer track this specific item across renders
      layoutId={id} 
      // 3. Define the visual style for the transition
      transition={{ 
        type: "spring", 
        stiffness: 350, 
        damping: 25 
      }}
      // 4. (Optional) Animate styles based on props (like highlighting)
      animate={{ 
        scale: isHighlighted ? 1.05 : 1,
        backgroundColor: isHighlighted ? '#f0fdf4' : '#ffffff',
        borderColor: isHighlighted ? '#4ade80' : '#e5e7eb'
      }}
      style={{
        border: '1px solid #e5e7eb',
        padding: '1rem',
        borderRadius: '0.5rem',
        background: 'white'
      }}
    >
      {text}
    </motion.div>
  );
};
```

### Step B: The Parent Container (Logic)

The parent component manages the array of data and the async functions to manipulate it.

```tsx
// App.tsx
import React, { useState } from 'react';
import { Card } from './Card';

const App = () => {
  const [items, setItems] = useState([{id: '1', text: 'A'}, {id: '2', text: 'B'}, {id: '3', text: 'C'}]);
  const [isSorting, setIsSorting] = useState(false);
  const [activeIndices, setActiveIndices] = useState<number[]>([]);

  // 1. Helper for delays
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // 2. Example: Swap two specific indices
  const swapItems = async (indexA: number, indexB: number) => {
    if (isSorting) return;
    setIsSorting(true);

    // Visual cue: Highlight items before moving
    setActiveIndices([indexA, indexB]);
    await delay(500);

    // Perform Swap
    setItems(prev => {
      const copy = [...prev];
      [copy[indexA], copy[indexB]] = [copy[indexB], copy[indexA]];
      return copy;
    });

    // Wait for animation to finish
    await delay(800); 
    
    // Cleanup
    setActiveIndices([]);
    setIsSorting(false);
  };

  // 3. Example: Bubble Sort Visualization
  const bubbleSort = async () => {
    if (isSorting) return;
    setIsSorting(true);
    
    let arr = [...items];
    let len = arr.length;
    let swapped;

    do {
      swapped = false;
      for (let i = 0; i < len - 1; i++) {
        // Highlight comparison
        setActiveIndices([i, i + 1]);
        await delay(300);

        // Compare IDs (or any value)
        if (arr[i].id > arr[i + 1].id) {
          // Swap local array
          const temp = arr[i];
          arr[i] = arr[i + 1];
          arr[i + 1] = temp;
          swapped = true;

          // Update State to trigger layout animation
          setItems([...arr]);
          
          // Wait for animation
          await delay(600);
        }
      }
      len--;
    } while (swapped);

    setActiveIndices([]);
    setIsSorting(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => swapItems(0, 2)}>Swap 1st & 3rd</button>
        <button onClick={bubbleSort}>Auto Sort</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {items.map((item, index) => (
          <Card 
            key={item.id} // CRITICAL: Key must track the data ID, not the index
            id={item.id}
            text={item.text}
            isHighlighted={activeIndices.includes(index)}
          />
        ))}
      </div>
    </div>
  );
};
```

## 4. Key Rules for Success

1.  **Stable Keys**: When mapping your list, use `key={item.uniqueId}`, **never** `key={index}`. If you use the index, React thinks the items haven't moved, they just changed content, and Framer Motion won't animate the position change.
2.  **Layout Prop**: The child component must have the `layout` prop.
3.  **Async/Await**: You cannot use a standard `for` loop with `setState` inside it without `await delay()`. React state updates are batched. Without the delay, the user will only see the start and end result, not the steps in between.
