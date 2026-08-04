import React from 'react';
import { createRoot } from 'react-dom/client';
import SwingAnalyzer from './components/swing/SwingAnalyzer';
window.__mountSwing = (el, urls) =>
  createRoot(el).render(React.createElement(SwingAnalyzer, { variant: 'member', initialUrls: urls }));
