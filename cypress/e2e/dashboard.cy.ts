const selectCustomer = (customer: string) => {
  cy.get('[data-cy="customer-input"]')
    .type(customer);
  cy.get('[data-cy="customer-search"]')
    .click();
  cy.get('[data-cy="customer-search-dialog"]')
    .should('be.visible')
    .within(() => {
      cy.get('td')
        .eq(1)
        .click();
      cy.get('h3')
        .contains(customer);
    });
  cy.scrollTo(0, 0);
};


describe('Customer search', () => {
  it('Can select customer', () => {
    cy.visit('http://localhost:3000');
    cy.get('[data-cy="username"]').type('bennett');
    cy.get('[data-cy="password"]').clear();
    cy.get('[data-cy="password"]').type('mwdup');
    cy.get('[data-cy="login-btn"]').click();

    selectCustomer('271 TRUCK SERVICE');
    cy.get('[data-cy="customer-link"]')
      .contains('271 TRUCK SERVICE');
  });

  it('Can view customer details', () => {
    cy.visit('http://localhost:3000');
    cy.get('[data-cy="username"]').type('bennett');
    cy.get('[data-cy="password"]').clear();
    cy.get('[data-cy="password"]').type('mwdup');
    cy.get('[data-cy="login-btn"]').click();

    selectCustomer('271 TRUCK SERVICE');
    cy.get('[data-cy="expand"]').click();
    cy.get('[data-cy="customer-details"]')
      .should('be.visible');
    cy.get('[data-cy="expand"]').click();
    cy.get('[data-cy="customer-details"]').should('not.exist');
    cy.get('[data-cy="customer-link"]').click();
    cy.url().should('include', '/customer/');
    cy.get('h2').contains('271 TRUCK SERVICE');
  });
});

describe('Quotes', () => {
  it('Mark quote as sold', () => {
    cy.visit('http://localhost:3000');
    cy.get('[data-cy="username"]').type('bennett');
    cy.get('[data-cy="password"]').clear();
    cy.get('[data-cy="password"]').type('mwdup');
    cy.get('[data-cy="login-btn"]').click();

    cy.get('[data-cy="part-quotes"] [data-cy="invoice-btn"]').first().then((btn) => {
      cy.wrap(btn)
        .parents('tr')
        .within(() => {
          cy.get('.cbx-td').click();
        });
      cy.wrap(btn).should('not.exist');
    });
    cy.get('[data-cy="part-quotes"] .cbx').first().then((btn) => {
      cy.wrap(btn)
        .parents('tr')
        .within(() => {
          cy.get('.cbx-td').click();
        });
      cy.wrap(btn).should('exist');
    });
  });
});

describe('Part Search', () => {
  it('Can quote part', () => {
    cy.visit('http://localhost:3000');
    cy.get('[data-cy="username"]').type('bennett');
    cy.get('[data-cy="password"]').clear();
    cy.get('[data-cy="password"]').type('mwdup');
    cy.get('[data-cy="login-btn"]').click();

    cy.get('[data-cy="part-search-table"] tbody tr').first().then((tr) => {
      cy.wrap(tr).within(() => {
        cy.get('[data-cy="quote-part-btn"]').click();
      });
    });
    cy.get('[data-cy="quote-part-dailog"] button[type=submit]').click();
    cy.get('[data-cy="part-quotes"] [data-cy="delete-quote"]').first().click();
  });
});
