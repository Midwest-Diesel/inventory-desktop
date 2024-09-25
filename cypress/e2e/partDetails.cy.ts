import { createNewPart, partSearch } from "../support/utils";

describe('Part Details', () => {
  it('Can create a new part', () => {
    cy.visit('http://localhost:3000');
    cy.get('[data-cy="username"]').type('bennett');
    cy.get('[data-cy="password"]').clear();
    cy.get('[data-cy="password"]').type('mwdup');
    cy.get('[data-cy="login-btn"]').click();

    createNewPart('123');
    partSearch('123');
    cy.get('[data-cy="part-search-table"]').within(() => {
      cy.get('[data-cy="part-num-link"]').first().click();
    });
    cy.get('h2').first().should('have.text', '123');

    cy.visit('http://localhost:3000');
    createNewPart('OR456', '123, 272');
    partSearch('OR456');
    cy.get('[data-cy="part-search-table"]').within(() => {
      cy.get('[data-cy="part-num-link"]').first().click();
    });
    cy.get('[data-cy="alt-parts"]').should('have.text', 'OR456, 123, 272');
  });

  it('Can edit alt parts', () => {
    cy.visit('http://localhost:3000');
    cy.get('[data-cy="username"]').type('bennett');
    cy.get('[data-cy="password"]').clear();
    cy.get('[data-cy="password"]').type('mwdup');
    cy.get('[data-cy="login-btn"]').click();

    partSearch('123');
    cy.get('[data-cy="part-search-table"]').within(() => {
      cy.get('[data-cy="part-num-link"]').first().click();
    });
    cy.get('[data-cy="edit-btn"]').click();
    cy.get('[data-cy="alt-parts"]').type(', 8989, 2828');
    cy.get('[data-cy="save-btn"]').click();
    cy.wait(1000);
    cy.get('[data-cy="alt-parts"]').should('have.text', '123, OR456, 272, 8989, 2828');
    cy.visit('http://localhost:3000');
    
    partSearch('OR456');
    cy.get('[data-cy="part-search-table"]').within(() => {
      cy.get('[data-cy="part-num-link"]').first().click();
    });
    cy.get('[data-cy="alt-parts"]').should('have.text', 'OR456, 123, 272, 8989, 2828');
    cy.visit('http://localhost:3000');

    partSearch('1757526');
    cy.get('[data-cy="part-search-table"]').within(() => {
      cy.get('[data-cy="part-num-link"]').first().click();
    });
    cy.get('[data-cy="alt-parts"]').should('have.text', '2479908, 2113123, 1757526');
  });

  it('Can delete parts', () => {
    cy.visit('http://localhost:3000');
    cy.get('[data-cy="username"]').type('bennett');
    cy.get('[data-cy="password"]').clear();
    cy.get('[data-cy="password"]').type('mwdup');
    cy.get('[data-cy="login-btn"]').click();

    partSearch('123');
    cy.get('[data-cy="part-search-table"]').within(() => {
      cy.get('[data-cy="part-num-link"]').should('have.text', '123');
      cy.get('[data-cy="part-num-link"]').first().click();
    });
    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns('confirm');
    });
    cy.get('[data-cy="delete-btn"]').click();
    partSearch('123');
    cy.get('[data-cy="part-search-table"] tbody').should('not.have.length');
    cy.reload();

    partSearch('OR456');
    cy.get('[data-cy="part-search-table"]').within(() => {
      cy.get('[data-cy="part-num-link"]').should('have.text', 'OR456');
      cy.get('[data-cy="part-num-link"]').first().click();
    });
    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns('confirm');
    });
    cy.get('[data-cy="delete-btn"]').click();
    partSearch('OR456');
    cy.get('[data-cy="part-search-table"] tbody').should('not.have.length');
  });
});
