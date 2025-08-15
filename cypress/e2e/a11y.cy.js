describe("Cypress Simulator - A11y Checks", () => {
  beforeEach(() => {
    cy.login()
    cy.visit("./src/index.html?skipCaptcha=true&chancesOfError=0", {
      onBeforeLoad(win) {
        win.localStorage.setItem("cookieConsent", "accepted");
      }
    });
    cy.injectAxe();
  });

  
  it("successfully simulates a Cypress command (e.g., cy.log('Yay!'))", () => {
    cy.run("cy.log('Yay!')")

    cy.get("#outputArea", { timeout: 6000 })
      .should("contain", "Success:")
      .and("contain", "cy.log('Yay!') // Logged message 'Yay!'")
      .and("be.visible");

    cy.checkA11y(".success")
  })

  

  it("shows an error when entering and running an invalid Cypress command (e.g., cy.run()) ", () => {
    cy.run("cy.run()")

    cy.get("#outputArea", { timeout: 6000 })
      .should("contain", "Error:")
      .and("contain", "Invalid Cypress command: cy.run()")
      .and("be.visible");

    cy.checkA11y(".error")
  });

  it("a warning when entering and running a not-implemented Cypress command (e.g., cy.contains('Login'))", () => {
    cy.run("cy.contains('Login')")

    cy.get("#outputArea", { timeout: 6000 })
      .should("contain", "Warning")
      .and("contain", "The `cy.contains` command has not been implemented yet.")
      .and("be.visible");

    cy.checkA11y(".warning")
    
  });

  it("asks for help and gets common Cypress commands and examples with a link to the docs", () => {
    cy.run("help")

    cy.get("#outputArea", { timeout: 6000 })
      .should("contain", "Common Cypress commands and examples:")
      .and("contain", "For more commands and details, visit the official Cypress API documentation.")
      .and("be.visible");

    cy.contains("#outputArea a", "official Cypress API documentation")
      .should("have.attr", "href", "https://docs.cypress.io/api/table-of-contents")
      .and("have.attr", "target", "_blank")
      .and("have.attr", "rel", "noopener noreferrer")
      .and("be.visible");

    cy.checkA11y("#outputArea")

  });

  it("maximizes and minimizes a simulation result", () => {
    cy.run("cy.log('Yay!')")

    cy.get(".expand-collapse").click();

    cy.get("#outputArea", { timeout: 6000 })
      .should("contain", "Success:")
      .and("contain", "cy.log('Yay!') // Logged message 'Yay!'")
      .and("be.visible");

    cy.get("#collapseIcon").should("be.visible");

    cy.checkA11y();

    cy.get(".expand-collapse").click();

    cy.get("#expandIcon").should("be.visible");
  });

  it("logs out successfully", () => {
    cy.get("#sandwich-menu")
      .should("be.visible")
      .click();

    cy.get("#logoutButton")
      .should("be.visible")
      .click();

    cy.get("form > button")
      .should("be.visible");

    cy.checkA11y();
  });

  it("shows and hides the logout button", () => {
    cy.get("#sandwich-menu").click();

    cy.get("#logoutButton")
      .should("be.visible");

    cy.checkA11y();

    cy.get("#sandwich-menu").click();

    cy.get("#logoutButton")
      .should("not.be.visible");
  });

  it("shows the running state before showing the final result", () => {
    cy.get("textarea[placeholder='Write your Cypress code here...']")
      .type("help");

    cy.get("#runButton").click();

    cy.get("#runButton")
      .should("contain", "Running...")
      .and("be.disabled");

    cy.checkA11y();

    cy.get("#outputArea", { timeout: 6000 })
      .should("contain", "Running... Please wait.");

    cy.contains("#outputArea", "Running... Please wait.", { timeout: 6000 })
      .should("not.exist");

    cy.get("#runButton")
      .should("contain", "Run")
      .and("be.visible");
  });

  it("declines on the cookies usage", () => {
  cy.visit("./src/index.html?skipCaptcha=true&chancesOfError=0", {
    onBeforeLoad(win) {
      // Garante que o banner será exibido
      win.localStorage.removeItem("cookieConsent");
    }
  });

  cy.get("#cookieConsent", { timeout: 10000 })
    .as("cookiesConsentBanner")
    .should("be.visible");

  cy.contains("#cookieConsent button", "Decline").click();

  cy.get("@cookiesConsentBanner").should("not.be.visible");

  cy.window().then((win) => {
    expect(win.localStorage.getItem("cookieConsent")).to.equal("declined");
  })
})
})

describe("Cypress Simulator - Captcha", () => {
  beforeEach(() => {
    cy.visit("./src/index.html&chancesOfError=0");
    cy.contains("button", "Login").click();
    cy.injectAxe();
  });

  it("finds no a11y issues on all captcha view states (button enabled/disabled and error)", () => {
    cy.get("main#captcha").should("be.visible");

    cy.get("#verifyCaptcha").should("be.disabled");

    cy.get("input[placeholder='Enter your answer']").type("1000");

    cy.get("#verifyCaptcha").should("be.enabled");

    cy.checkA11y("main#captcha");

    cy.get("#verifyCaptcha").click();

    cy.contains(".error", "Incorrect answer, please try again.").should("be.visible");
    cy.get("input[placeholder='Enter your answer']").should("have.value", "");
    cy.get("#verifyCaptcha").should("be.disabled");

    cy.checkA11y("main#captcha");
  });

  it("disables the captcha verify button when no answer is provided or it's cleared", () => {
    cy.get("#verifyCaptcha").should("be.disabled");

    cy.get("#captchaInput").type("1000");

    cy.get("#verifyCaptcha").should("be.enabled");

    cy.get("input[placeholder='Enter your answer']").clear();
  });

  it("shows an error on a wrong captcha answer and goes back to its initial state", () => {
    cy.get("input[placeholder='Enter your answer']").type("1000");
    cy.contains("button", "Verify").click();

    cy.get("#captchaError")
      .should("contain", "Incorrect answer, please try again.")
      .should("be.visible");

    cy.get("input[placeholder='Enter your answer']").should("have.value", "");

    cy.get("#verifyCaptcha").should("be.disabled");
  });
});
