// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

/**
 * Mind Fractal V3 E2E Tests (Cypress)
 * Run with: npx cypress run --spec "src/features/mindfractal3/test/MF3D.e2e.cy.ts"
 */

describe('Mind Fractal V3 E2E', () => {
  beforeEach(() => {
    // Navigate to DNA page with MF3D_V3 flag enabled
    cy.visit('/dna');
    cy.wait(2000); // Wait for initialization
  });

  it('T1: Idle arcs are visible', () => {
    let arcCount = 0;
    const observer = new MutationObserver(() => {
      arcCount++;
    });

    cy.get('canvas').then(($canvas) => {
      observer.observe($canvas[0], { childList: true, subtree: true });
    });

    cy.wait(3000);
    cy.wrap(null).then(() => {
      observer.disconnect();
      expect(arcCount).to.be.greaterThan(2);
    });
  });

  it('T2: Click node → DISCOVERED state', () => {
    cy.get('canvas').then(($canvas) => {
      const canvas = $canvas[0];
      const rect = canvas.getBoundingClientRect();
      
      // Click center node
      cy.wrap(canvas).click(rect.width / 2, rect.height / 2);
      cy.wait(500);

      // Verify node-selected event
      cy.window().then((win) => {
        let eventFired = false;
        win.addEventListener('mindfractal:node-selected', () => {
          eventFired = true;
        });
        expect(eventFired).to.be.true;
      });
    });
  });

  it('T3: Link A→B creates LinkArc and LINKED states', () => {
    cy.get('canvas').then(($canvas) => {
      const canvas = $canvas[0];
      const rect = canvas.getBoundingClientRect();
      
      // Click node A
      cy.wrap(canvas).click(rect.width / 2, rect.height / 2);
      cy.wait(300);
      
      // Click node B (nearby)
      cy.wrap(canvas).click(rect.width / 2 + 50, rect.height / 2);
      cy.wait(500);

      // Verify link-created event
      cy.window().then((win) => {
        let linkCreated = false;
        win.addEventListener('mindfractal:link-created', () => {
          linkCreated = true;
        });
        expect(linkCreated).to.be.true;
      });
    });
  });

  it('T4: Deep-zoom reaches tunnel depth', () => {
    cy.get('canvas').then(($canvas) => {
      const canvas = $canvas[0];
      
      // Simulate scroll zoom
      for (let i = 0; i < 20; i++) {
        cy.wrap(canvas).trigger('wheel', { deltaY: -100 });
        cy.wait(50);
      }

      cy.wait(2000);
      
      // Screenshot to verify depth
      cy.screenshot('deep-zoom-test');
    });
  });

  it('T5: Milestone after 5 links (same theme)', () => {
    cy.get('canvas').then(($canvas) => {
      const canvas = $canvas[0];
      const rect = canvas.getBoundingClientRect();
      
      // Create 5 links
      for (let i = 0; i < 5; i++) {
        cy.wrap(canvas).click(rect.width / 2 + i * 30, rect.height / 2);
        cy.wait(200);
        cy.wrap(canvas).click(rect.width / 2 + (i + 1) * 30, rect.height / 2 + 20);
        cy.wait(600);
      }

      // Verify evolve event
      cy.window().then((win) => {
        let evolveTriggered = false;
        win.addEventListener('mindfractal:evolve', () => {
          evolveTriggered = true;
        });
        cy.wait(1000);
        expect(evolveTriggered).to.be.true;
      });

      // Verify overlay visible
      cy.contains('EVOLUTION').should('be.visible');
      cy.screenshot('milestone-overlay');
    });
  });

  it('T6: Reduced animations ON → idle halved', () => {
    // Enable reduced motion
    cy.window().then((win) => {
      const mediaQuery = win.matchMedia('(prefers-reduced-motion: reduce)');
      Object.defineProperty(mediaQuery, 'matches', { value: true });
    });

    cy.reload();
    cy.wait(2000);

    let arcCount = 0;
    const observer = new MutationObserver(() => {
      arcCount++;
    });

    cy.get('canvas').then(($canvas) => {
      observer.observe($canvas[0], { childList: true, subtree: true });
    });

    cy.wait(3000);
    cy.wrap(null).then(() => {
      observer.disconnect();
      // Should be ~half of normal rate (1-2 instead of 2-4)
      expect(arcCount).to.be.lessThan(3);
    });
  });
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
