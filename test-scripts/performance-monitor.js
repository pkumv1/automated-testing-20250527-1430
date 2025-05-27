const { test } = require('@playwright/test');

class PerformanceMonitor {
  constructor(page) {
    this.page = page;
    this.metrics = {
      navigationTiming: {},
      resourceTiming: [],
      userTiming: [],
      performanceMarks: []
    };
  }

  async captureMetrics() {
    // Navigation timing
    this.metrics.navigationTiming = await this.page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
        loadComplete: nav.loadEventEnd - nav.loadEventStart,
        domInteractive: nav.domInteractive - nav.fetchStart,
        timeToFirstByte: nav.responseStart - nav.requestStart,
        totalLoadTime: nav.loadEventEnd - nav.fetchStart
      };
    });

    // Resource timing
    this.metrics.resourceTiming = await this.page.evaluate(() => {
      return performance.getEntriesByType('resource').map(resource => ({
        name: resource.name.split('/').pop(),
        type: resource.initiatorType,
        duration: resource.duration,
        size: resource.transferSize
      }));
    });

    // Core Web Vitals
    this.metrics.webVitals = await this.page.evaluate(() => {
      return new Promise(resolve => {
        let metrics = {};
        
        // LCP
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          metrics.lcp = entries[entries.length - 1].startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // FID simulation
        metrics.fid = performance.now() - performance.timeOrigin;

        // CLS
        let clsValue = 0;
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          metrics.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });

        setTimeout(() => resolve(metrics), 1000);
      });
    });

    return this.metrics;
  }

  async measureAction(actionName, actionFn) {
    const startMark = `${actionName}-start`;
    const endMark = `${actionName}-end`;
    
    await this.page.evaluate(mark => performance.mark(mark), startMark);
    const startTime = Date.now();
    
    await actionFn();
    
    const endTime = Date.now();
    await this.page.evaluate(mark => performance.mark(mark), endMark);
    
    const duration = endTime - startTime;
    this.metrics.userTiming.push({
      action: actionName,
      duration,
      timestamp: new Date().toISOString()
    });
    
    return duration;
  }

  getPerformanceReport() {
    const report = {
      summary: {
        avgPageLoadTime: this.metrics.navigationTiming.totalLoadTime + 'ms',
        avgTimeToInteractive: this.metrics.navigationTiming.domInteractive + 'ms',
        avgTimeToFirstByte: this.metrics.navigationTiming.timeToFirstByte + 'ms'
      },
      webVitals: {
        LCP: (this.metrics.webVitals?.lcp || 0) + 'ms',
        FID: (this.metrics.webVitals?.fid || 0) + 'ms',
        CLS: this.metrics.webVitals?.cls || 0
      },
      resourceBreakdown: this.getResourceBreakdown(),
      userActions: this.metrics.userTiming
    };

    return report;
  }

  getResourceBreakdown() {
    const breakdown = {
      scripts: { count: 0, totalSize: 0, avgDuration: 0 },
      stylesheets: { count: 0, totalSize: 0, avgDuration: 0 },
      images: { count: 0, totalSize: 0, avgDuration: 0 },
      xhr: { count: 0, totalSize: 0, avgDuration: 0 }
    };

    this.metrics.resourceTiming.forEach(resource => {
      const type = resource.type === 'xmlhttprequest' ? 'xhr' : 
                   resource.type === 'script' ? 'scripts' :
                   resource.type === 'link' ? 'stylesheets' :
                   resource.type === 'img' ? 'images' : null;
      
      if (type && breakdown[type]) {
        breakdown[type].count++;
        breakdown[type].totalSize += resource.size || 0;
        breakdown[type].avgDuration = 
          ((breakdown[type].avgDuration * (breakdown[type].count - 1)) + resource.duration) / breakdown[type].count;
      }
    });

    return breakdown;
  }
}

module.exports = { PerformanceMonitor };