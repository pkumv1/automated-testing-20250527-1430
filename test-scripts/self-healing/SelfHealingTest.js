const { test } = require('@playwright/test');

class SelfHealingTest {
  constructor(page) {
    this.page = page;
    this.healingAttempts = [];
  }

  async findElement(selectors) {
    const strategies = [
      // Tier 1: ID/data-testid
      async () => {
        if (selectors.id) return await this.page.$(`#${selectors.id}`);
        if (selectors.testId) return await this.page.$(`[data-testid="${selectors.testId}"]`);
      },
      // Tier 2: CSS with context
      async () => {
        if (selectors.css) return await this.page.$(selectors.css);
        if (selectors.class) return await this.page.$(`.${selectors.class}`);
      },
      // Tier 3: XPath relative
      async () => {
        if (selectors.xpath) return await this.page.$(`xpath=${selectors.xpath}`);
      },
      // Tier 4: Text matching
      async () => {
        if (selectors.text) return await this.page.getByText(selectors.text).first();
        if (selectors.label) return await this.page.getByLabel(selectors.label);
      },
      // Tier 5: Visual pattern
      async () => {
        if (selectors.nearText) {
          const near = await this.page.getByText(selectors.nearText);
          if (near) return await near.locator('..').locator(selectors.tag || '*').first();
        }
      },
      // Tier 6: AI detection fallback
      async () => {
        const allElements = await this.page.$$(selectors.tag || '*');
        for (const el of allElements) {
          const text = await el.textContent();
          if (text && selectors.contains && text.includes(selectors.contains)) {
            return el;
          }
        }
      }
    ];

    for (let i = 0; i < strategies.length; i++) {
      try {
        const element = await strategies[i]();
        if (element) {
          this.healingAttempts.push({
            selectors,
            strategy: i + 1,
            success: true,
            timestamp: new Date().toISOString()
          });
          return element;
        }
      } catch (e) {
        // Continue to next strategy
      }
    }

    this.healingAttempts.push({
      selectors,
      strategy: 'failed',
      success: false,
      timestamp: new Date().toISOString()
    });
    return null;
  }

  getHealingMetrics() {
    const total = this.healingAttempts.length;
    const successful = this.healingAttempts.filter(a => a.success).length;
    const byStrategy = {};
    
    this.healingAttempts.forEach(attempt => {
      if (attempt.success) {
        byStrategy[attempt.strategy] = (byStrategy[attempt.strategy] || 0) + 1;
      }
    });

    return {
      total,
      successful,
      healingRate: total > 0 ? (successful / total * 100).toFixed(2) + '%' : '0%',
      byStrategy
    };
  }
}

module.exports = { SelfHealingTest };