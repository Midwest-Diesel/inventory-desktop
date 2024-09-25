describe('Alerts table', () => {
  it('Should display data', () => {
    cy.visit('http://localhost:3000/alerts');
    cy.get('[data-cy="username"]').type('bennett');
    cy.get('[data-cy="password"]').clear();
    cy.get('[data-cy="password"]').type('mwdup');
    cy.get('[data-cy="login-btn"]').click();
    cy.get('[data-cy="alerts-table-body"]')
      .children()
      .should('have.length.at.least', 1);
  });

  it('Should edit rows', () => {
    cy.visit('http://localhost:3000/alerts');
    cy.get('[data-cy="username"]').type('bennett');
    cy.get('[data-cy="password"]').clear();
    cy.get('[data-cy="password"]').type('mwdup');
    cy.get('[data-cy="login-btn"]').click();
    // Get initial values
    let type = '';
    let partNum = '';
    let note = '';
    cy.get('[data-cy="alerts-table-body"]')
      .children()
      .first()
      .within(() => {
        cy.get('[data-cy="part-num"]').invoke('text').then((text) => {
          partNum = text;
        });
        cy.get('[data-cy="note"]').invoke('text').then((text) => {
          note = text;
        });
        cy.get('[data-cy="open-alert-btn"]').invoke('text').then((text) => {
          type = text;
        });
      });

    // Edit values
    cy.get('[data-cy="edit-alert-btn"]')
      .first()
      .click();
    cy.get('[data-cy="edit-alert-dialog"]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-cy="alert-type"]')
          .select('SYSTEMS CHECK!!!');
        cy.get('[data-cy="part-num"]')
          .clear()
          .type('12345');
        cy.get('[data-cy="note"]')
          .clear()
          .type('This is a note');
        cy.get('[data-cy="save"]')
          .click();
      });
    cy.get('[data-cy="alerts-table-body"]')
      .children()
      .first()
      .within(() => {
        cy.get('[data-cy="open-alert-btn"]')
          .contains('SYSTEMS CHECK!!!');
        cy.get('[data-cy="part-num"]')
          .contains('12345');
        cy.get('[data-cy="note"]')
          .contains('This is a note');
      });

    // Reset values
    cy.get('[data-cy="edit-alert-btn"]')
      .first()
      .click();
    cy.get('[data-cy="edit-alert-dialog"]')
      .within(() => {
        cy.get('[data-cy="alert-type"]')
          .select(type);
        cy.get('[data-cy="part-num"]')
          .clear()
          .type(partNum);
        cy.get('[data-cy="note"]')
          .clear()
          .type(note);
        cy.get('[data-cy="save"]')
          .click();
      });
  });

  it('Should add new alert', () => {
    cy.visit('http://localhost:3000/alerts');
    cy.get('[data-cy="username"]').type('bennett');
    cy.get('[data-cy="password"]').clear();
    cy.get('[data-cy="password"]').type('mwdup');
    cy.get('[data-cy="login-btn"]').click();

    cy.get('[data-cy="new-alert-btn"]')
      .first()
      .click();
    cy.get('[data-cy="new-alert-dialog"]')
      .within(() => {
        cy.get('[data-cy="alert-type"]')
        .select('ALERT!!!');
        cy.get('[data-cy="part-num"]')
          .clear()
          .type('6789');
        cy.get('[data-cy="note"]')
          .clear()
          .type('CYPRESS Note');
        cy.get('[data-cy="save"]')
          .click();
      });

    cy.get('[data-cy="alerts-table-body"]')
      .children()
      .first()
      .within(() => {
        cy.get('[data-cy="open-alert-btn"]')
          .contains('ALERT!!!');
        cy.get('[data-cy="part-num"]')
          .contains('6789');
        cy.get('[data-cy="note"]')
          .contains('CYPRESS Note');
      });
  });

  it('Should delete alert', () => {
    cy.visit('http://localhost:3000/alerts');
    cy.get('[data-cy="username"]').type('bennett');
    cy.get('[data-cy="password"]').clear();
    cy.get('[data-cy="password"]').type('mwdup');
    cy.get('[data-cy="login-btn"]').click();
    cy.get('[data-cy="alerts-table-body"]')
      .children()
      .first()
      .within(() => {
        cy.get('[data-cy="delete-alert-btn"]')
          .click();
      });

    cy.get('[data-cy="alerts-table-body"]')
      .children()
      .first()
      .within(() => {
        cy.get('[data-cy="part-num"]').should('not.have.text', '6789');
        cy.get('[data-cy="note"]').should('not.have.text', 'CYPRESS Note');
      });
  });
});
