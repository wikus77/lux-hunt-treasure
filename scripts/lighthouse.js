#!/usr/bin/env node
// © 2025 M1SSION™ – Joseph MULÉ – NIYVORA KFT
// Lighthouse Performance Audit Script

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

const config = {
  extends: 'lighthouse:default',
  settings: {
    output: ['json', 'html'],
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  },
};

const urls = [
  { name: 'Home', url: 'http://localhost:5173' },
  { name: 'Map', url: 'http://localhost:5173/map' }
];

const minScores = {
  performance: 90,
  accessibility: 90,
  'best-practices': 80,
  seo: 85
};

async function runLighthouse() {
  console.log('🚀 Starting Lighthouse audit...\n');
  
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  
  let allPassed = true;
  const results = [];

  for (const { name, url } of urls) {
    console.log(`📊 Auditing ${name} (${url})...`);
    
    try {
      const runnerResult = await lighthouse(url, { port: chrome.port }, config);
      const { lhr } = runnerResult;
      
      const scores = {
        performance: Math.round(lhr.categories.performance.score * 100),
        accessibility: Math.round(lhr.categories.accessibility.score * 100),
        'best-practices': Math.round(lhr.categories['best-practices'].score * 100),
        seo: Math.round(lhr.categories.seo.score * 100)
      };
      
      console.log(`  Performance: ${scores.performance}/100`);
      console.log(`  Accessibility: ${scores.accessibility}/100`);
      console.log(`  Best Practices: ${scores['best-practices']}/100`);
      console.log(`  SEO: ${scores.seo}/100\n`);
      
      // Check if scores meet requirements
      for (const [category, score] of Object.entries(scores)) {
        if (score < minScores[category]) {
          console.error(`❌ ${name} ${category} score (${score}) is below minimum (${minScores[category]})`);
          allPassed = false;
        }
      }
      
      results.push({ name, url, scores });
      
      // Save reports
      const reportsDir = path.join(process.cwd(), 'lighthouse-reports');
      if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);
      
      fs.writeFileSync(
        path.join(reportsDir, `${name.toLowerCase()}-report.json`),
        runnerResult.report[0]
      );
      fs.writeFileSync(
        path.join(reportsDir, `${name.toLowerCase()}-report.html`),
        runnerResult.report[1]
      );
      
    } catch (error) {
      console.error(`❌ Error auditing ${name}:`, error.message);
      allPassed = false;
    }
  }
  
  await chrome.kill();
  
  console.log('\n📋 Audit Summary:');
  results.forEach(({ name, scores }) => {
    console.log(`${name}: P${scores.performance} A${scores.accessibility} B${scores['best-practices']} S${scores.seo}`);
  });
  
  if (allPassed) {
    console.log('\n✅ All lighthouse audits passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some lighthouse audits failed.');
    if (process.env.CI) {
      process.exit(1);
    }
  }
}

runLighthouse().catch(console.error);