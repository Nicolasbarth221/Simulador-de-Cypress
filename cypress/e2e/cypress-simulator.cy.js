describe("Cypress Simulator", () => {
  beforeEach(() => {
    cy.login()
    cy.visit("./src/index.html?skipCaptcha=true", {
      onBeforeLoad(win) {
        win.localStorage.setItem("cookieConsent", "accepted");
      }
    });
  });

  it("shows an error when entering and running a valid Cypress command without parentheses (e.g., cy.visit)", () => {
    cy.run("cy.visit")

    cy.get("#outputArea", { timeout: 6000 })
      .should("contain", "Error:")
      .and("contain", "Missing parentheses on `cy.visit` command")
      .and("be.visible");
  });

  it("checks the run button disabled and enabled states", () => {
    cy.get("#runButton").should("be.disabled");

    cy.get("#codeInput").type("jsdgfsjdb");
    cy.get("#runButton").should("be.enabled");

    cy.get("#codeInput").clear();
    cy.get("#runButton").should("be.disabled");
  });

  it("clears the code input when logging off then logging in again", () => {
    cy.get("textarea[placeholder='Write your Cypress code here...']")
      .type("Cy.get()");
    cy.get(".header-actions").click();
    cy.get("#logoutButton").click();

    cy.contains("button", "Login").click();

    cy.get("textarea[placeholder='Write your Cypress code here...']")
      .should("have.value", "");
  });

  it("disables the run button when logging off then logging in again", () => {
    cy.get("textarea[placeholder='Write your Cypress code here...']")
      .type("Cy.get()");
    cy.contains("button", "Run").should("be.enabled");

    cy.get(".header-actions").click();
    cy.get("#logoutButton").click();

    cy.contains("button", "Login").click();
    cy.contains("button", "Run").should("be.disabled");
  });

  it("clears the code output when logging off then logging in again", () => {
    cy.run("cy.log('Yay!')")

    cy.get("#outputArea", { timeout: 6000 })
      .should("contain", "Success:");

    cy.get(".header-actions").click();
    cy.get("#logoutButton").click();
    cy.get("form > button").click();

    cy.get("#outputArea").should("have.text", "");
  });

  it("doesn't show the cookie consent banner on the login page", () => {
    cy.clearLocalStorage();
    cy.reload();

    cy.contains("button", "Login").should("be.visible");
    cy.get("#cookieConsent").should("not.be.visible");
  });
});

describe("Cypress Simulator - Cookies consent", () => {
  beforeEach(() => {
    cy.login()
    cy.visit("./src/index.html?skipCaptcha=true");
  });

  it("consents on the cookies usage", () => {
    cy.get("#cookieConsent", { timeout: 6000 })
      .as("cookiesConsentBanner")
      .find("button:contains('Accept')")
      .click();

    cy.get("@cookiesConsentBanner").should("not.be.visible");

    cy.window()
      .its("localStorage.cookieConsent")
      .should("be.equal", "accepted");
  });
});
