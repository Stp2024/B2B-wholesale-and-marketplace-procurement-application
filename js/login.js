document.addEventListener("DOMContentLoaded", function () {
  // =========================================
  // GET HTML ELEMENTS
  // =========================================

  const loginForm = document.querySelector("form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const passwordButton = document.querySelector(".password-icon");
  const loginButton = document.querySelector(".login-button");
  const rememberCheckbox = document.querySelector(
    'input[name="remember"]'
  );
  const forgotPassword = document.querySelector(".forgot-password");


  // =========================================
  // SHOW / HIDE PASSWORD
  // =========================================

  if (passwordButton && passwordInput) {
    passwordButton.addEventListener("click", function () {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";

        passwordButton.textContent = "◉";

        passwordButton.setAttribute(
          "aria-label",
          "Hide password"
        );

        passwordButton.setAttribute(
          "title",
          "Hide password"
        );
      } else {
        passwordInput.type = "password";

        passwordButton.textContent = "◉";

        passwordButton.setAttribute(
          "aria-label",
          "Show password"
        );

        passwordButton.setAttribute(
          "title",
          "Show password"
        );
      }
    });
  }


  // =========================================
  // EMAIL VALIDATION FUNCTION
  // =========================================

  function isValidEmail(email) {
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    return emailPattern.test(email);
  }


  // =========================================
  // SHOW ERROR MESSAGE
  // =========================================

  function showError(input, message) {
    if (!input) {
      return;
    }

    const formGroup = input.closest(".form-group");

    if (!formGroup) {
      return;
    }

    let errorMessage =
      formGroup.querySelector(".error-message");

    if (!errorMessage) {
      errorMessage = document.createElement("small");

      errorMessage.className = "error-message";

      formGroup.appendChild(errorMessage);
    }

    errorMessage.textContent = message;

    input.classList.add("input-error");
  }


  // =========================================
  // REMOVE ERROR MESSAGE
  // =========================================

  function removeError(input) {
    if (!input) {
      return;
    }

    const formGroup = input.closest(".form-group");

    if (!formGroup) {
      return;
    }

    const errorMessage =
      formGroup.querySelector(".error-message");

    if (errorMessage) {
      errorMessage.remove();
    }

    input.classList.remove("input-error");
  }


  // =========================================
  // LOAD REMEMBERED EMAIL
  // =========================================

  const savedEmail =
    localStorage.getItem("tradenestEmail");

  if (savedEmail && emailInput) {
    emailInput.value = savedEmail;

    if (rememberCheckbox) {
      rememberCheckbox.checked = true;
    }
  }


  // =========================================
  // EMAIL VALIDATION WHILE TYPING
  // =========================================

  if (emailInput) {
    emailInput.addEventListener(
      "input",
      function () {
        const email =
          emailInput.value.trim();

        if (email === "") {
          removeError(emailInput);
          return;
        }

        if (!isValidEmail(email)) {
          showError(
            emailInput,
            "Please enter a valid email address."
          );
        } else {
          removeError(emailInput);
        }
      }
    );


    // =======================================
    // EMAIL BLUR VALIDATION
    // =======================================

    emailInput.addEventListener(
      "blur",
      function () {
        const email =
          emailInput.value.trim();

        if (email === "") {
          showError(
            emailInput,
            "Email address is required."
          );
        } else if (!isValidEmail(email)) {
          showError(
            emailInput,
            "Please enter a valid email address."
          );
        } else {
          removeError(emailInput);
        }
      }
    );
  }


  // =========================================
  // PASSWORD VALIDATION WHILE TYPING
  // =========================================

  if (passwordInput) {
    passwordInput.addEventListener(
      "input",
      function () {
        const password =
          passwordInput.value;

        if (password === "") {
          removeError(passwordInput);
          return;
        }

        if (password.length < 6) {
          showError(
            passwordInput,
            "Password must contain at least 6 characters."
          );
        } else {
          removeError(passwordInput);
        }
      }
    );


    // =======================================
    // PASSWORD BLUR VALIDATION
    // =======================================

    passwordInput.addEventListener(
      "blur",
      function () {
        const password =
          passwordInput.value;

        if (password === "") {
          showError(
            passwordInput,
            "Password is required."
          );
        } else if (password.length < 6) {
          showError(
            passwordInput,
            "Password must contain at least 6 characters."
          );
        } else {
          removeError(passwordInput);
        }
      }
    );
  }


  // =========================================
  // LOGIN FORM SUBMISSION
  // =========================================

  if (loginForm) {
    loginForm.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();


        // =====================================
        // GET LOGIN VALUES
        // =====================================

        const email =
          emailInput.value
            .trim()
            .toLowerCase();

        const password =
          passwordInput.value;


        // =====================================
        // REMOVE OLD ERRORS
        // =====================================

        removeError(emailInput);
        removeError(passwordInput);


        let isValid = true;


        // =====================================
        // CHECK EMAIL
        // =====================================

        if (email === "") {
          showError(
            emailInput,
            "Email address is required."
          );

          isValid = false;

        } else if (!isValidEmail(email)) {
          showError(
            emailInput,
            "Please enter a valid email address."
          );

          isValid = false;
        }


        // =====================================
        // CHECK PASSWORD
        // =====================================

        if (password === "") {
          showError(
            passwordInput,
            "Password is required."
          );

          isValid = false;

        } else if (password.length < 6) {
          showError(
            passwordInput,
            "Password must contain at least 6 characters."
          );

          isValid = false;
        }


        // =====================================
        // STOP IF VALIDATION FAILED
        // =====================================

        if (!isValid) {
          return;
        }


        // =====================================
        // GET REGISTERED USERS
        // =====================================

        let registeredUsers = [];

        try {
          registeredUsers =
            JSON.parse(
              localStorage.getItem(
                "tradenestUsers"
              )
            ) || [];

        } catch (error) {
          console.error(
            "Unable to read registered users:",
            error
          );

          registeredUsers = [];
        }


        // =====================================
        // BUILT-IN DEMO ACCOUNTS + REGISTERED
        // =====================================

        const demoAccounts = [
          {
            id: "admin-001",
            fullName: "Vikram Sengupta",
            email: "admin@tradenest.com",
            password: "Admin@123",
            role: "admin",
            businessName: "TradeNest Marketplace Governance",
            verificationStatus: "Verified",
            accountStatus: "Active"
          },
          {
            id: "buyer-001",
            fullName: "Aisha Patel",
            email: "aisha.patel@tradenest.com",
            password: "Buyer@123",
            role: "buyer",
            businessName: "North Star Retail Pvt. Ltd.",
            verificationStatus: "Verified",
            accountStatus: "Active"
          },
          {
            id: "supplier-001",
            fullName: "Rajesh Kulkarni",
            email: "rajesh@apexgear.com",
            password: "Supplier@123",
            role: "supplier",
            businessName: "Apex Gear Co.",
            verificationStatus: "Verified",
            accountStatus: "Active"
          },
          {
            id: "supplier-002",
            fullName: "Supplier Demo",
            email: "supplier@tradenest.com",
            password: "Supplier@123",
            role: "supplier",
            businessName: "PaperPro Solutions",
            verificationStatus: "Verified",
            accountStatus: "Active"
          }
        ];

        // Combine registered users with demo accounts
        const allUsers = [...registeredUsers];
        demoAccounts.forEach(function (demo) {
          if (!allUsers.some(function (u) { return u && u.email && u.email.toLowerCase() === demo.email.toLowerCase(); })) {
            allUsers.push(demo);
          }
        });

        // =====================================
        // FIND MATCHING USER
        // =====================================

        const loggedInUser =
          allUsers.find(
            function (user) {
              if (!user) {
                return false;
              }

              const registeredEmail =
                String(
                  user.email || ""
                )
                  .trim()
                  .toLowerCase();

              const registeredPassword =
                String(
                  user.password || ""
                );

              // Allow demo login if email matches demo account, or exact match
              const isDemo = demoAccounts.some(function (d) { return d.email.toLowerCase() === registeredEmail; });
              if (registeredEmail === email && (isDemo || registeredPassword === password)) {
                return true;
              }

              return (
                registeredEmail === email &&
                registeredPassword === password
              );
            }
          );


        // =====================================
        // INVALID EMAIL OR PASSWORD
        // =====================================

        if (!loggedInUser) {
          showError(
            emailInput,
            "Email or password is incorrect. Demo accounts: admin@tradenest.com, aisha.patel@tradenest.com, or rajesh@apexgear.com"
          );

          showError(
            passwordInput,
            "Please check your credentials or use the demo accounts."
          );

          return;
        }


        // =====================================
        // GET ROLE FROM REGISTERED ACCOUNT
        // =====================================

        const userRole =
          String(
            loggedInUser.role || ""
          )
            .trim()
            .toLowerCase();


        // =====================================
        // CHECK USER ROLE
        // =====================================

        if (
          userRole !== "buyer" &&
          userRole !== "supplier" &&
          userRole !== "admin"
        ) {
          showError(
            emailInput,
            "Your account role is missing or invalid. Please register again."
          );

          return;
        }


        // =====================================
        // REMEMBER EMAIL
        // =====================================

        if (
          rememberCheckbox &&
          rememberCheckbox.checked
        ) {
          localStorage.setItem(
            "tradenestEmail",
            email
          );
        } else {
          localStorage.removeItem(
            "tradenestEmail"
          );
        }


        // =====================================
        // SAVE LOGGED-IN USER
        // =====================================

        localStorage.setItem(
          "tradenestCurrentUser",
          JSON.stringify(loggedInUser)
        );


        // =====================================
        // DISABLE LOGIN BUTTON
        // =====================================

        if (loginButton) {
          loginButton.disabled = true;

          loginButton.innerHTML =
            'Logging in... <span>→</span>';
        }


        // =====================================
        // ROLE-BASED DASHBOARD REDIRECT
        // =====================================

        setTimeout(function () {

          // -----------------------------------
          // ADMIN DASHBOARD
          // -----------------------------------

          if (userRole === "admin") {
            window.location.href =
              "../pages/admin/dashboard.html";

            return;
          }

          // -----------------------------------
          // BUYER DASHBOARD
          // -----------------------------------

          if (userRole === "buyer") {
            window.location.href =
              "../pages/buyer/dashboard.html";

            return;
          }


          // -----------------------------------
          // SUPPLIER DASHBOARD
          // -----------------------------------

          if (userRole === "supplier") {
            window.location.href =
              "../pages/supplier/dashboard.html";

            return;
          }

        }, 500);
      }
    );
  }


  // =========================================
  // FORGOT PASSWORD
  // =========================================

  if (forgotPassword) {
    forgotPassword.addEventListener(
      "click",
      function (event) {
        event.preventDefault();


        const email =
          emailInput.value
            .trim()
            .toLowerCase();


        // =====================================
        // EMAIL REQUIRED
        // =====================================

        if (email === "") {
          showError(
            emailInput,
            "Enter your registered email address first."
          );

          emailInput.focus();

          return;
        }


        // =====================================
        // VALID EMAIL
        // =====================================

        if (!isValidEmail(email)) {
          showError(
            emailInput,
            "Please enter a valid email address."
          );

          emailInput.focus();

          return;
        }


        // =====================================
        // GET REGISTERED USERS
        // =====================================

        let registeredUsers = [];

        try {
          registeredUsers =
            JSON.parse(
              localStorage.getItem(
                "tradenestUsers"
              )
            ) || [];

        } catch (error) {
          console.error(
            "Unable to read registered users:",
            error
          );

          registeredUsers = [];
        }


        // =====================================
        // CHECK REGISTERED EMAIL
        // =====================================

        const userExists =
          Array.isArray(registeredUsers) &&
          registeredUsers.some(
            function (user) {
              if (!user) {
                return false;
              }

              return (
                String(
                  user.email || ""
                )
                  .trim()
                  .toLowerCase() === email
              );
            }
          );


        // =====================================
        // EMAIL NOT FOUND
        // =====================================

        if (!userExists) {
          showError(
            emailInput,
            "No account was found with this email address."
          );

          return;
        }


        // =====================================
        // PASSWORD RESET MESSAGE
        // =====================================

        alert(
          "Password reset functionality will be available soon.\n\nRegistered email: " +
          email
        );
      }
    );
  }

});