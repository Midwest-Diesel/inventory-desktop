export const dragDialogDown = (selector: string) => {
  cy.get(selector).then($dialog => {
    const $handlebar = $dialog.siblings('.dialog__handlebar');
    if ($handlebar.length === 0) {
      throw new Error('Dialog handlebar not found.');
    }

    const handlebar = $handlebar[0];
    const rect = handlebar.getBoundingClientRect();
    const startX = rect.x + rect.width / 2;
    const startY = rect.y + rect.height / 2;
    const endY = startY + 150;

    cy.wrap(handlebar)
      .trigger('mousedown', { button: 0, clientX: startX, clientY: startY })
      .trigger('mousemove', { clientX: startX, clientY: endY })
      .trigger('mouseup', { force: true });
  });
};

export const createNewPart = (partNum: string, altParts?: string) => {
  cy.get('[data-cy="new-part-btn"]').click();
  cy.get('[data-cy="part-num"]').type(partNum);
  cy.get('[data-cy="desc"]').type('TEST PART');
  cy.get('[data-cy="stock-num"]').type('A456');
  if (altParts) cy.get('[data-cy="alt-parts"]').type(altParts);
  cy.get('[data-cy="save-btn"]').click();
  cy.wait(1000);
};

export const partSearch = (partNum: string) => {
  cy.get('[data-cy="part-search-btn"]').click();
  cy.get('[data-cy="part-serch-dialog"]').within(() => {
    cy.get('input').first().type(partNum);
    cy.get('[type="submit"]').click();
  });
  cy.wait(1000);
};
