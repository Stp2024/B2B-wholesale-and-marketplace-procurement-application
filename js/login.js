document.addEventListener("DOMContentLoaded", function () {
  // =========================================
  // GET HTML ELEMENTS
  // =========================================

  const loginForm = document.getElementById("loginForm") || document.querySelector("form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const passwordButton = document.querySelector(".password-icon");
  const loginButton = document.getElementById("loginSubmitBtn") || document.querySelector(".login-button");
  const rememberCheckbox = document.querySelector('input[name="remember"]');
  const forgotPassword = document.querySelector(".forgot-password");

  // Role selection elements
  const roleTabs = document.querySelectorAll(".role-tab");
  const selectedRoleInput = document.getElementById("selectedRoleInput");
  const roleContextBadge = document.getElementById("roleContextBadge");
  const roleContextTitle = document.getElementById("roleContextTitle");
  const roleContextDesc = document.getElementById("roleContextDesc");
  const emailLabel = document.getElementById("emailLabel");


  // =========================================
  // ROLE CONFIGURATION & SWITCHING
  // =========================================

  const roleConfigs = {
    admin: {
      key: "admin",
      name: "Admin",
      title: "Admin Governance Portal",
      desc: "— Platform administration, approvals & system metrics",
      label: "Administrator Email",
      placeholder: "Enter your admin email (e.g. admin@tradenest.com)",
      buttonText: "Login as Admin",
      dashboard: "../pages/admin/dashboard.html"
    },
    buyer: {
      key: "buyer",
      name: "Buyer",
      title: "Buyer Procurement Portal",
      desc: "— Browse products, request quotes & manage orders",
      label: "Buyer Business Email",
      placeholder: "Enter your buyer business email",
      buttonText: "Login as Buyer",
      dashboard: "../pages/buyer/dashboard.html"
    },
    supplier: {
      key: "supplier",
      name: "Supplier",
      title: "Supplier Merchant Portal",
      desc: "— Manage catalog, fulfill RFQs & track wholesale orders",
      label: "Supplier Business Email",
      placeholder: "Enter your supplier business email",
      buttonText: "Login as Supplier",
      dashboard: "../pages/supplier/dashboard.html"
    }
  };

  function setRole(roleKey) {
    const config = roleConfigs[roleKey] || roleConfigs.buyer;

    // Update active tab styles & ARIA attributes
    roleTabs.forEach(function (tab) {
      const isMatch = tab.getAttribute("data-role") === config.key;
      tab.classList.toggle("active", isMatch);
      tab.setAttribute("aria-selected", isMatch ? "true" : "false");
    });

    // Update hidden role input
    if (selectedRoleInput) {
      selectedRoleInput.value = config.key;
    }

    // Update context banner
    if (roleContextBadge) {
      roleContextBadge.className = `role-context-badge role-${config.key}`;
    }
    if (roleContextTitle) {
      roleContextTitle.textContent = config.title;
    }
    if (roleContextDesc) {
      roleContextDesc.textContent = config.desc;
    }

    // Update input label and placeholder
    if (emailLabel) {
      emailLabel.innerHTML = `${config.label} <span>*</span>`;
    }
    if (emailInput) {
      emailInput.placeholder = config.placeholder;
      removeError(emailInput);
    }
    if (passwordInput) {
      removeError(passwordInput);
    }

    // Update submit button text
    if (loginButton && !loginButton.disabled) {
      loginButton.innerHTML = `${config.buttonText} <span>→</span>`;
    }
  }

  // Attach click listeners to role tabs
  roleTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      const role = this.getAttribute("data-role");
      if (role && roleConfigs[role]) {
        setRole(role);
      }
    });
  });

  // Check URL query parameters for initial role (?role=admin, ?role=supplier, ?role=buyer)
  const urlParams = new URLSearchParams(window.location.search);
  const paramRole = (urlParams.get("role") || "").toLowerCase();
  if (roleConfigs[paramRole]) {
    setRole(paramRole);
  } else {
    setRole("buyer");
  }


  // =========================================
  // SHOW / HIDE PASSWORD TOGGLE
  // =========================================

  if (passwordButton && passwordInput) {
    const iconEye = passwordButton.querySelector(".icon-eye");
    const iconEyeOff = passwordButton.querySelector(".icon-eye-off");

    passwordButton.addEventListener("click", function () {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        if (iconEye) iconEye.style.display = "none";
        if (iconEyeOff) iconEyeOff.style.display = "block";
        passwordButton.setAttribute("aria-label", "Hide password");
        passwordButton.setAttribute("title", "Hide password");
      } else {
        passwordInput.type = "password";
        if (iconEye) iconEye.style.display = "block";
        if (iconEyeOff) iconEyeOff.style.display = "none";
        passwordButton.setAttribute("aria-label", "Show password");
        passwordButton.setAttribute("title", "Show password");
      }
    });
  }


  // =========================================
  // EMAIL VALIDATION FUNCTION
  // =========================================

  function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailPattern.test(email);
  }


  // =========================================
  // SHOW / REMOVE ERROR MESSAGE
  // =========================================

  function showError(input, message) {
    if (!input) return;

    const formGroup = input.closest(".form-group");
    if (!formGroup) return;

    let errorMessage = formGroup.querySelector(".error-message");

    if (!errorMessage) {
      errorMessage = document.createElement("small");
      errorMessage.className = "error-message";
      formGroup.appendChild(errorMessage);
    }

    errorMessage.textContent = message;
    input.classList.add("input-error");
  }

  function removeError(input) {
    if (!input) return;

    const formGroup = input.closest(".form-group");
    if (!formGroup) return;

    const errorMessage = formGroup.querySelector(".error-message");
    if (errorMessage) {
      errorMessage.remove();
    }

    input.classList.remove("input-error");
  }


  // =========================================
  // LOAD REMEMBERED EMAIL
  // =========================================

  const savedEmail = localStorage.getItem("tradenestEmail");
  if (savedEmail && emailInput) {
    emailInput.value = savedEmail;
    if (rememberCheckbox) {
      rememberCheckbox.checked = true;
    }
  }


  // =========================================
  // REAL-TIME INPUT VALIDATION
  // =========================================

  if (emailInput) {
    emailInput.addEventListener("input", function () {
      const email = emailInput.value.trim();
      if (email === "") {
        removeError(emailInput);
        return;
      }
      if (!isValidEmail(email)) {
        showError(emailInput, "Please enter a valid email address.");
      } else {
        removeError(emailInput);
      }
    });

    emailInput.addEventListener("blur", function () {
      const email = emailInput.value.trim();
      if (email === "") {
        showError(emailInput, "Email address is required.");
      } else if (!isValidEmail(email)) {
        showError(emailInput, "Please enter a valid email address.");
      } else {
        removeError(emailInput);
      }
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener("input", function () {
      const password = passwordInput.value;
      if (password === "") {
        removeError(passwordInput);
        return;
      }
      if (password.length < 6) {
        showError(passwordInput, "Password must contain at least 6 characters.");
      } else {
        removeError(passwordInput);
      }
    });

    passwordInput.addEventListener("blur", function () {
      const password = passwordInput.value;
      if (password === "") {
        showError(passwordInput, "Password is required.");
      } else if (password.length < 6) {
        showError(passwordInput, "Password must contain at least 6 characters.");
      } else {
        removeError(passwordInput);
      }
    });
  }


  // =========================================
  // LOGIN FORM SUBMISSION
  // =========================================

  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const email = emailInput.value.trim().toLowerCase();
      const password = passwordInput.value;
      const currentSelectedRole = selectedRoleInput ? selectedRoleInput.value : "buyer";

      removeError(emailInput);
      removeError(passwordInput);

      let isValid = true;

      if (email === "") {
        showError(emailInput, "Email address is required.");
        isValid = false;
      } else if (!isValidEmail(email)) {
        showError(emailInput, "Please enter a valid email address.");
        isValid = false;
      }

      if (password === "") {
        showError(passwordInput, "Password is required.");
        isValid = false;
      } else if (password.length < 6) {
        showError(passwordInput, "Password must contain at least 6 characters.");
        isValid = false;
      }

      if (!isValid) return;

      // Retrieve registered accounts from localStorage
      let registeredUsers = [];
      try {
        registeredUsers = JSON.parse(localStorage.getItem("tradenestUsers")) || [];
      } catch (error) {
        registeredUsers = [];
      }

      // Default built-in accounts for seamless testing (in memory only, never suggested)
      const builtInAccounts = [
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

      // Combine accounts (registered users take precedence for updated passwords)
      const allUsers = [...registeredUsers];
      builtInAccounts.forEach(function (demo) {
        const alreadyExists = allUsers.some(function (u) {
          return u && u.email && u.email.toLowerCase() === demo.email.toLowerCase();
        });
        if (!alreadyExists) {
          allUsers.push(demo);
        }
      });

      // Find user by email
      const targetUser = allUsers.find(function (user) {
        if (!user) return false;
        return String(user.email || "").trim().toLowerCase() === email;
      });

      if (!targetUser) {
        showError(
          emailInput,
          "No account found with this email. Please check your email or create an account."
        );
        return;
      }

      // Verify password
      const userPassword = String(targetUser.password || "");
      const defaultDemo = builtInAccounts.find(function (d) {
        return d.email.toLowerCase() === email;
      });

      const isPasswordValid =
        password === userPassword ||
        (defaultDemo && password === defaultDemo.password);

      if (!isPasswordValid) {
        showError(
          passwordInput,
          "Incorrect password. Click 'Forgot Password?' to reset it."
        );
        return;
      }

      // Verify selected role matches account role
      const userRole = String(targetUser.role || "").trim().toLowerCase();
      const roleDisplayNames = {
        admin: "Administrator",
        buyer: "Buyer",
        supplier: "Supplier"
      };

      if (userRole !== currentSelectedRole) {
        const correctRoleName = roleDisplayNames[userRole] || userRole;
        const chosenRoleName = roleDisplayNames[currentSelectedRole] || currentSelectedRole;
        showError(
          emailInput,
          `This account is registered as a ${correctRoleName}, not a ${chosenRoleName}. Please select "${correctRoleName}" above to log in.`
        );

        // Highlight matching role tab
        const matchingTab = document.querySelector(`.role-tab[data-role="${userRole}"]`);
        if (matchingTab) {
          matchingTab.style.transform = "scale(1.05)";
          setTimeout(function () {
            matchingTab.style.transform = "";
          }, 800);
        }
        return;
      }

      // Remember me preference
      if (rememberCheckbox && rememberCheckbox.checked) {
        localStorage.setItem("tradenestEmail", email);
      } else {
        localStorage.removeItem("tradenestEmail");
      }

      // Save logged-in session
      localStorage.setItem("tradenestCurrentUser", JSON.stringify(targetUser));

      // Disable button with feedback
      if (loginButton) {
        loginButton.disabled = true;
        const roleLabel = roleDisplayNames[userRole] || "account";
        loginButton.innerHTML = `Logging in as ${roleLabel}... <span>→</span>`;
      }

      // Redirect to appropriate portal dashboard
      setTimeout(function () {
        const redirectParam = urlParams.get("redirect");
        if (redirectParam && redirectParam.startsWith("pages/")) {
          window.location.href = `../${redirectParam}`;
          return;
        }

        if (userRole === "admin") {
          window.location.href = "../pages/admin/dashboard.html";
        } else if (userRole === "supplier") {
          window.location.href = "../pages/supplier/dashboard.html";
        } else {
          window.location.href = "../pages/buyer/dashboard.html";
        }
      }, 500);
    });
  }


  // =========================================
  // RESET PASSWORD MODAL (FORGOT PASSWORD OPTION)
  // =========================================

  const resetModal = document.getElementById("resetPasswordModal");
  const closeResetModalBtn = document.getElementById("closeResetModalBtn");
  const cancelResetModalBtn = document.getElementById("cancelResetModalBtn");
  const resetPasswordForm = document.getElementById("resetPasswordForm");
  const resetEmail = document.getElementById("resetEmail");
  const resetNewPassword = document.getElementById("resetNewPassword");
  const resetConfirmPassword = document.getElementById("resetConfirmPassword");
  const resetAlertMessage = document.getElementById("resetAlertMessage");
  const forgotPasswordBtn = document.getElementById("forgotPasswordBtn") || forgotPassword;

  function showResetAlert(message, type = "error") {
    if (!resetAlertMessage) return;
    resetAlertMessage.textContent = message;
    resetAlertMessage.className = `tn-modal-alert alert-${type}`;
    resetAlertMessage.style.display = "block";
  }

  function hideResetAlert() {
    if (!resetAlertMessage) return;
    resetAlertMessage.style.display = "none";
    resetAlertMessage.textContent = "";
  }

  function openResetModal() {
    if (!resetModal) return;
    hideResetAlert();

    // Prefill with email from login form if already entered
    if (resetEmail) {
      if (emailInput && emailInput.value.trim()) {
        resetEmail.value = emailInput.value.trim();
      } else {
        resetEmail.value = "";
      }
    }

    if (resetNewPassword) resetNewPassword.value = "";
    if (resetConfirmPassword) resetConfirmPassword.value = "";

    resetModal.style.display = "flex";

    setTimeout(function () {
      if (resetEmail && resetEmail.value.trim()) {
        if (resetNewPassword) resetNewPassword.focus();
      } else if (resetEmail) {
        resetEmail.focus();
      }
    }, 100);
  }

  function closeResetModal() {
    if (!resetModal) return;
    resetModal.style.display = "none";
    hideResetAlert();
  }

  if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener("click", function (event) {
      event.preventDefault();
      openResetModal();
    });
  }

  if (closeResetModalBtn) closeResetModalBtn.addEventListener("click", closeResetModal);
  if (cancelResetModalBtn) cancelResetModalBtn.addEventListener("click", closeResetModal);

  if (resetModal) {
    resetModal.addEventListener("click", function (e) {
      if (e.target === resetModal) {
        closeResetModal();
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && resetModal && resetModal.style.display === "flex") {
      closeResetModal();
    }
  });

  // Password visibility toggle buttons inside modal
  const resetToggleBtns = document.querySelectorAll(".reset-toggle-pwd");
  resetToggleBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");
      const targetInput = document.getElementById(targetId);
      if (!targetInput) return;

      if (targetInput.type === "password") {
        targetInput.type = "text";
        this.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        `;
        this.setAttribute("title", "Hide password");
      } else {
        targetInput.type = "password";
        this.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        `;
        this.setAttribute("title", "Show password");
      }
    });
  });

  // Reset Password Form Submission
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener("submit", function (e) {
      e.preventDefault();
      hideResetAlert();

      const emailVal = resetEmail.value.trim().toLowerCase();
      const newPwdVal = resetNewPassword.value;
      const confirmPwdVal = resetConfirmPassword.value;

      if (!emailVal) {
        showResetAlert("Please enter your account email address.", "error");
        resetEmail.focus();
        return;
      }

      if (!isValidEmail(emailVal)) {
        showResetAlert("Please enter a valid email address.", "error");
        resetEmail.focus();
        return;
      }

      if (!newPwdVal) {
        showResetAlert("Please enter a new password.", "error");
        resetNewPassword.focus();
        return;
      }

      if (newPwdVal.length < 6) {
        showResetAlert("Password must contain at least 6 characters.", "error");
        resetNewPassword.focus();
        return;
      }

      if (newPwdVal !== confirmPwdVal) {
        showResetAlert("Passwords do not match. Please re-enter matching passwords.", "error");
        resetConfirmPassword.focus();
        return;
      }

      const defaultAccounts = [
        {
          id: "admin-001",
          fullName: "Vikram Sengupta",
          email: "admin@tradenest.com",
          role: "admin",
          businessName: "TradeNest Marketplace Governance",
          verificationStatus: "Verified",
          accountStatus: "Active"
        },
        {
          id: "buyer-001",
          fullName: "Aisha Patel",
          email: "aisha.patel@tradenest.com",
          role: "buyer",
          businessName: "North Star Retail Pvt. Ltd.",
          verificationStatus: "Verified",
          accountStatus: "Active"
        },
        {
          id: "supplier-001",
          fullName: "Rajesh Kulkarni",
          email: "rajesh@apexgear.com",
          role: "supplier",
          businessName: "Apex Gear Co.",
          verificationStatus: "Verified",
          accountStatus: "Active"
        },
        {
          id: "supplier-002",
          fullName: "Supplier Demo",
          email: "supplier@tradenest.com",
          role: "supplier",
          businessName: "PaperPro Solutions",
          verificationStatus: "Verified",
          accountStatus: "Active"
        }
      ];

      let registeredUsers = [];
      try {
        registeredUsers = JSON.parse(localStorage.getItem("tradenestUsers")) || [];
      } catch (err) {
        registeredUsers = [];
      }
      if (!Array.isArray(registeredUsers)) registeredUsers = [];

      const userIndex = registeredUsers.findIndex(function (u) {
        return u && String(u.email || "").trim().toLowerCase() === emailVal;
      });

      let targetUser = null;

      if (userIndex !== -1) {
        registeredUsers[userIndex].password = newPwdVal;
        targetUser = registeredUsers[userIndex];
      } else {
        const demoMatch = defaultAccounts.find(function (d) {
          return d.email.toLowerCase() === emailVal;
        });
        if (demoMatch) {
          targetUser = {
            ...demoMatch,
            password: newPwdVal
          };
          registeredUsers.push(targetUser);
        } else {
          targetUser = {
            id: "user-" + Date.now(),
            fullName: emailVal.split("@")[0].replace(/[\._]/g, " "),
            email: emailVal,
            password: newPwdVal,
            role: "buyer",
            businessName: "Trade Member (" + emailVal.split("@")[0] + ")",
            verificationStatus: "Verified",
            accountStatus: "Active"
          };
          registeredUsers.push(targetUser);
        }
      }

      try {
        localStorage.setItem("tradenestUsers", JSON.stringify(registeredUsers));
      } catch (saveErr) {
        console.error("Failed to save reset password:", saveErr);
      }

      showResetAlert("✓ Password reset successfully! Updating login...", "success");

      // Populate email on login form and switch to user's role
      if (emailInput) {
        emailInput.value = emailVal;
        removeError(emailInput);
      }
      if (passwordInput) {
        passwordInput.value = "";
        removeError(passwordInput);
      }
      setRole(targetUser.role || "buyer");

      setTimeout(function () {
        closeResetModal();
        if (passwordInput) passwordInput.focus();
      }, 1000);
    });
  }
});