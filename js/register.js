document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  /* =========================================================
     TRADESTNEST REGISTRATION SYSTEM
     Frontend / Demo Version

     Registered users are stored in localStorage.
     ========================================================= */


  /* =========================================================
     ELEMENTS
  ========================================================== */

  const form = document.getElementById("registrationForm");

  const fullName = document.getElementById("fullName");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const otp = document.getElementById("otp");

  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");

  const businessName = document.getElementById("businessName");
  const businessType = document.getElementById("businessType");
  const registrationNumber =
    document.getElementById("registrationNumber");

  const gst = document.getElementById("gst");
  const year = document.getElementById("year");
  const category = document.getElementById("category");
  const subcategory = document.getElementById("subcategory");
  const website = document.getElementById("website");

  const address = document.getElementById("address");
  const country = document.getElementById("country");
  const state = document.getElementById("state");
  const city = document.getElementById("city");
  const pincode = document.getElementById("pincode");
  const locationType = document.getElementById("locationType");

  const terms = document.getElementById("terms");

  const otpButton = document.getElementById("otpButton");
  const createButton = document.getElementById("createButton");

  const togglePassword =
    document.getElementById("togglePassword");

  const toggleConfirmPassword =
    document.getElementById("toggleConfirmPassword");


  /* =========================================================
     STORAGE
  ========================================================== */

  const USERS_KEY = "tradenestUsers";
  const LAST_REGISTERED_EMAIL =
    "tradenestLastRegisteredEmail";


  /* =========================================================
     OTP STATE
  ========================================================== */

  let generatedOTP = "";
  let otpVerified = false;


  /* =========================================================
     BASIC SAFETY CHECK
  ========================================================== */

  if (!form) {
    console.error("TradeNest registration form was not found.");
    return;
  }


  /* =========================================================
     USER STORAGE FUNCTIONS
  ========================================================== */

  function getUsers() {
    try {
      const storedUsers =
        localStorage.getItem(USERS_KEY);

      if (!storedUsers) {
        return [];
      }

      const users = JSON.parse(storedUsers);

      return Array.isArray(users) ? users : [];
    } catch (error) {
      console.error(
        "Unable to read TradeNest users:",
        error
      );

      return [];
    }
  }


  function saveUsers(users) {
    localStorage.setItem(
      USERS_KEY,
      JSON.stringify(users)
    );
  }


  /* =========================================================
     ERROR HANDLING
  ========================================================== */

  function showError(input, message) {
    if (!input) {
      return;
    }

    const group =
      input.closest(".form-group");

    if (!group) {
      return;
    }

    removeSuccess(input);

    let error =
      group.querySelector(".error-message");

    if (!error) {
      error = document.createElement("small");

      error.className = "error-message";

      group.appendChild(error);
    }

    error.textContent = message;

    input.classList.add("input-error");

    input.setAttribute(
      "aria-invalid",
      "true"
    );
  }


  function removeError(input) {
    if (!input) {
      return;
    }

    const group =
      input.closest(".form-group");

    if (!group) {
      return;
    }

    const error =
      group.querySelector(".error-message");

    if (error) {
      error.remove();
    }

    input.classList.remove("input-error");

    input.removeAttribute(
      "aria-invalid"
    );
  }


  function showSuccess(input, message) {
    if (!input) {
      return;
    }

    const group =
      input.closest(".form-group");

    if (!group) {
      return;
    }

    removeError(input);

    let success =
      group.querySelector(".success-message");

    if (!success) {
      success = document.createElement("small");

      success.className = "success-message";

      group.appendChild(success);
    }

    success.textContent = message;

    input.classList.add("input-success");
  }


  function removeSuccess(input) {
    if (!input) {
      return;
    }

    const group =
      input.closest(".form-group");

    if (!group) {
      return;
    }

    const success =
      group.querySelector(".success-message");

    if (success) {
      success.remove();
    }

    input.classList.remove("input-success");
  }


  /* =========================================================
     TERMS ERROR
  ========================================================== */

  function showTermsError(message) {
    const container =
      document.querySelector(".terms");

    if (!container) {
      return;
    }

    let error =
      container.querySelector(".terms-error");

    if (!error) {
      error = document.createElement("small");

      error.className = "terms-error";

      container.appendChild(error);
    }

    error.textContent = message;
  }


  function removeTermsError() {
    const error =
      document.querySelector(".terms-error");

    if (error) {
      error.remove();
    }
  }


  /* =========================================================
     ACCOUNT TYPE
  ========================================================== */

  function getSelectedAccountType() {
    const selected =
      document.querySelector(
        'input[name="accountType"]:checked'
      );

    return selected
      ? selected.value
      : "";
  }


  /* =========================================================
     FULL NAME
  ========================================================== */

  function validateFullName() {
    const value =
      fullName.value.trim();

    if (!value) {
      showError(
        fullName,
        "Full name is required."
      );

      return false;
    }

    if (value.length < 3) {
      showError(
        fullName,
        "Full name must contain at least 3 characters."
      );

      return false;
    }

    if (!/^[A-Za-z\s.'-]+$/.test(value)) {
      showError(
        fullName,
        "Please enter a valid name."
      );

      return false;
    }

    removeError(fullName);

    return true;
  }


  /* =========================================================
     EMAIL
  ========================================================== */

  function validateEmail() {
    const value =
      email.value.trim().toLowerCase();

    const pattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!value) {
      showError(
        email,
        "Business email is required."
      );

      return false;
    }

    if (!pattern.test(value)) {
      showError(
        email,
        "Please enter a valid email address."
      );

      return false;
    }

    const users = getUsers();

    const exists =
      users.some(function (user) {
        return (
          String(user.email || "")
            .toLowerCase() === value
        );
      });

    if (exists) {
      showError(
        email,
        "This email is already registered."
      );

      return false;
    }

    email.value = value;

    removeError(email);

    return true;
  }


  /* =========================================================
     PHONE
  ========================================================== */

  function validatePhone() {
    const value =
      phone.value.trim();

    const digits =
      value.replace(/\D/g, "");

    if (!digits) {
      showError(
        phone,
        "Mobile number is required."
      );

      return false;
    }

    if (!/^[6-9]\d{9}$/.test(digits)) {
      showError(
        phone,
        "Enter a valid 10-digit Indian mobile number."
      );

      return false;
    }

    phone.value = digits;

    removeError(phone);

    return true;
  }


  /* =========================================================
     OTP
  ========================================================== */

  function sendOTP() {
    if (!validatePhone()) {
      phone.focus();
      return;
    }

    generatedOTP =
      Math.floor(
        100000 +
        Math.random() * 900000
      ).toString();

    otpVerified = false;

    otp.value = "";

    removeError(otp);
    removeSuccess(otp);

    otpButton.dataset.mode = "verify";

    otpButton.textContent = "Verify OTP";

    alert(
      "Demo OTP sent successfully.\n\n" +
      "Your OTP is: " +
      generatedOTP
    );

    otp.focus();
  }


  function verifyOTP() {
    const enteredOTP =
      otp.value.trim();

    if (!enteredOTP) {
      showError(
        otp,
        "Enter the OTP sent to your mobile number."
      );

      otp.focus();

      return false;
    }

    if (!/^\d{6}$/.test(enteredOTP)) {
      showError(
        otp,
        "OTP must contain exactly 6 digits."
      );

      return false;
    }

    if (!generatedOTP) {
      showError(
        otp,
        "Please send an OTP first."
      );

      return false;
    }

    if (enteredOTP !== generatedOTP) {
      showError(
        otp,
        "Incorrect OTP. Please try again."
      );

      return false;
    }

    otpVerified = true;

    removeError(otp);

    showSuccess(
      otp,
      "Mobile number verified successfully."
    );

    otpButton.textContent = "OTP Verified";

    otpButton.disabled = true;

    otpButton.classList.add("verified");

    return true;
  }


  if (otpButton) {
    otpButton.addEventListener(
      "click",
      function () {

        if (
          otpButton.dataset.mode === "verify"
        ) {
          verifyOTP();
        } else {
          sendOTP();
        }

      }
    );
  }


  /* =========================================================
     OTP INPUT
  ========================================================== */

  otp.addEventListener(
    "input",
    function () {

      otp.value =
        otp.value
          .replace(/\D/g, "")
          .slice(0, 6);

      if (otpVerified) {
        otpVerified = false;

        otpButton.disabled = false;

        otpButton.classList.remove(
          "verified"
        );

        otpButton.textContent =
          "Verify OTP";
      }

      removeSuccess(otp);

    }
  );


  /* =========================================================
     PHONE INPUT
  ========================================================== */

  phone.addEventListener(
    "input",
    function () {

      const value =
        phone.value
          .replace(/\D/g, "")
          .slice(0, 10);

      phone.value = value;

      /*
       * Changing the mobile number invalidates
       * the previously generated OTP.
       */

      if (generatedOTP) {
        generatedOTP = "";

        otpVerified = false;

        otp.value = "";

        otpButton.disabled = false;

        otpButton.classList.remove(
          "verified"
        );

        otpButton.textContent =
          "Send OTP";

        otpButton.dataset.mode = "";

        removeError(otp);
        removeSuccess(otp);
      }

    }
  );


  /* =========================================================
     PASSWORD SHOW / HIDE
  ========================================================== */

  function setupPasswordToggle(
    button,
    input
  ) {

    if (!button || !input) {
      return;
    }

    button.addEventListener(
      "click",
      function () {

        const isPassword =
          input.type === "password";

        input.type =
          isPassword
            ? "text"
            : "password";

        button.setAttribute(
          "aria-label",
          isPassword
            ? "Hide password"
            : "Show password"
        );

        button.setAttribute(
          "title",
          isPassword
            ? "Hide password"
            : "Show password"
        );

        const icon =
          button.querySelector(".eye-icon");

        if (icon) {
          icon.textContent =
            isPassword
              ? "◉"
              : "◉";
        }

      }
    );
  }


  setupPasswordToggle(
    togglePassword,
    password
  );

  setupPasswordToggle(
    toggleConfirmPassword,
    confirmPassword
  );


  /* =========================================================
     PASSWORD VALIDATION
  ========================================================== */

  function validatePassword() {
    const value =
      password.value;

    if (!value) {
      showError(
        password,
        "Password is required."
      );

      return false;
    }

    if (value.length < 8) {
      showError(
        password,
        "Password must contain at least 8 characters."
      );

      return false;
    }

    if (!/[A-Z]/.test(value)) {
      showError(
        password,
        "Password must contain at least one uppercase letter."
      );

      return false;
    }

    if (!/[a-z]/.test(value)) {
      showError(
        password,
        "Password must contain at least one lowercase letter."
      );

      return false;
    }

    if (!/[0-9]/.test(value)) {
      showError(
        password,
        "Password must contain at least one number."
      );

      return false;
    }

    if (!/[^A-Za-z0-9]/.test(value)) {
      showError(
        password,
        "Password must contain at least one special character."
      );

      return false;
    }

    removeError(password);

    if (confirmPassword.value) {
      validateConfirmPassword();
    }

    return true;
  }


  /* =========================================================
     CONFIRM PASSWORD
  ========================================================== */

  function validateConfirmPassword() {
    const value =
      confirmPassword.value;

    if (!value) {
      showError(
        confirmPassword,
        "Please confirm your password."
      );

      return false;
    }

    if (value !== password.value) {
      showError(
        confirmPassword,
        "Passwords do not match."
      );

      return false;
    }

    removeError(confirmPassword);

    return true;
  }


  /* =========================================================
     BUSINESS NAME
  ========================================================== */

  function validateBusinessName() {
    const value =
      businessName.value.trim();

    if (!value) {
      showError(
        businessName,
        "Business name is required."
      );

      return false;
    }

    if (value.length < 2) {
      showError(
        businessName,
        "Business name must contain at least 2 characters."
      );

      return false;
    }

    removeError(businessName);

    return true;
  }


  /* =========================================================
     GENERIC SELECT
  ========================================================== */

  function validateSelect(
    input,
    message
  ) {

    if (!input.value) {
      showError(
        input,
        message
      );

      return false;
    }

    removeError(input);

    return true;
  }


  /* =========================================================
     REGISTRATION NUMBER
  ========================================================== */

  function validateRegistrationNumber() {
    const value =
      registrationNumber.value.trim();

    if (!value) {
      showError(
        registrationNumber,
        "Business registration number is required."
      );

      return false;
    }

    if (value.length < 4) {
      showError(
        registrationNumber,
        "Please enter a valid registration number."
      );

      return false;
    }

    removeError(registrationNumber);

    return true;
  }


  /* =========================================================
     GST
  ========================================================== */

  function validateGST() {
    const value =
      gst.value.trim().toUpperCase();

    gst.value =
      value.replace(/\s/g, "");

    /*
     * GST is optional.
     */

    if (!gst.value) {
      removeError(gst);
      return true;
    }

    const gstPattern =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

    if (!gstPattern.test(gst.value)) {
      showError(
        gst,
        "Please enter a valid 15-character GSTIN."
      );

      return false;
    }

    removeError(gst);

    return true;
  }


  /* =========================================================
     YEAR
  ========================================================== */

  function validateYear() {
    if (!year.value) {
      showError(
        year,
        "Please select the established year."
      );

      return false;
    }

    const selectedYear =
      Number(year.value);

    const currentYear =
      new Date().getFullYear();

    if (
      selectedYear > currentYear
    ) {
      showError(
        year,
        "Established year cannot be in the future."
      );

      return false;
    }

    removeError(year);

    return true;
  }


  /* =========================================================
     WEBSITE
  ========================================================== */

  function validateWebsite() {
    const value =
      website.value.trim();

    /*
     * Website is optional.
     */

    if (!value) {
      removeError(website);
      return true;
    }

    try {

      const url =
        new URL(value);

      if (
        url.protocol !== "http:" &&
        url.protocol !== "https:"
      ) {
        showError(
          website,
          "Website must start with http:// or https://."
        );

        return false;
      }

    } catch (error) {

      showError(
        website,
        "Please enter a valid website URL."
      );

      return false;
    }

    removeError(website);

    return true;
  }


  /* =========================================================
     ADDRESS
  ========================================================== */

  function validateAddress() {
    const value =
      address.value.trim();

    if (!value) {
      showError(
        address,
        "Business address is required."
      );

      return false;
    }

    if (value.length < 10) {
      showError(
        address,
        "Please enter your complete business address."
      );

      return false;
    }

    removeError(address);

    return true;
  }


  /* =========================================================
     PINCODE
  ========================================================== */

  function validatePincode() {
    const value =
      pincode.value.trim();

    if (!value) {
      showError(
        pincode,
        "Pincode is required."
      );

      return false;
    }

    if (!/^\d{6}$/.test(value)) {
      showError(
        pincode,
        "Pincode must contain exactly 6 digits."
      );

      return false;
    }

    removeError(pincode);

    return true;
  }


  /* =========================================================
     YEAR OPTIONS
  ========================================================== */

  function populateYears() {

    const currentYear =
      new Date().getFullYear();

    const minimumYear = 1950;

    for (
      let y = currentYear;
      y >= minimumYear;
      y--
    ) {

      const option =
        document.createElement("option");

      option.value = y;
      option.textContent = y;

      year.appendChild(option);
    }
  }

  populateYears();


  /* =========================================================
     INPUT RESTRICTIONS
  ========================================================== */

  pincode.addEventListener(
    "input",
    function () {

      pincode.value =
        pincode.value
          .replace(/\D/g, "")
          .slice(0, 6);

    }
  );


  gst.addEventListener(
    "input",
    function () {

      gst.value =
        gst.value
          .toUpperCase()
          .replace(/\s/g, "")
          .slice(0, 15);

    }
  );


  /* =========================================================
     REAL-TIME VALIDATION
  ========================================================== */

  fullName.addEventListener(
    "blur",
    validateFullName
  );

  email.addEventListener(
    "blur",
    validateEmail
  );

  phone.addEventListener(
    "blur",
    validatePhone
  );

  password.addEventListener(
    "blur",
    validatePassword
  );

  confirmPassword.addEventListener(
    "blur",
    validateConfirmPassword
  );

  businessName.addEventListener(
    "blur",
    validateBusinessName
  );

  registrationNumber.addEventListener(
    "blur",
    validateRegistrationNumber
  );

  gst.addEventListener(
    "blur",
    validateGST
  );

  year.addEventListener(
    "change",
    validateYear
  );

  businessType.addEventListener(
    "change",
    function () {
      validateSelect(
        businessType,
        "Please select your business type."
      );
    }
  );

  category.addEventListener(
    "change",
    function () {
      validateSelect(
        category,
        "Please select a business category."
      );
    }
  );

  subcategory.addEventListener(
    "change",
    function () {
      validateSelect(
        subcategory,
        "Please select a sub-category."
      );
    }
  );

  website.addEventListener(
    "blur",
    validateWebsite
  );

  address.addEventListener(
    "blur",
    validateAddress
  );

  country.addEventListener(
    "change",
    function () {
      validateSelect(
        country,
        "Please select your country."
      );
    }
  );

  state.addEventListener(
    "change",
    function () {
      validateSelect(
        state,
        "Please select your state."
      );
    }
  );

  city.addEventListener(
    "change",
    function () {
      validateSelect(
        city,
        "Please select your city."
      );
    }
  );

  pincode.addEventListener(
    "blur",
    validatePincode
  );

  locationType.addEventListener(
    "change",
    function () {
      validateSelect(
        locationType,
        "Please select your business location type."
      );
    }
  );


  /* =========================================================
     TERMS
  ========================================================== */

  terms.addEventListener(
    "change",
    function () {

      if (terms.checked) {
        removeTermsError();
      }

    }
  );


  /* =========================================================
     COMPLETE FORM VALIDATION
  ========================================================== */

  function validateForm() {

    let valid = true;


    if (!getSelectedAccountType()) {
      valid = false;
    }


    if (!validateFullName()) {
      valid = false;
    }


    if (!validateEmail()) {
      valid = false;
    }


    if (!validatePhone()) {
      valid = false;
    }


    if (!otpVerified) {

      showError(
        otp,
        "Please verify your mobile number using OTP."
      );

      valid = false;

    } else {

      if (!verifyOTP()) {
        valid = false;
      }

    }


    if (!validatePassword()) {
      valid = false;
    }


    if (!validateConfirmPassword()) {
      valid = false;
    }


    if (!validateBusinessName()) {
      valid = false;
    }


    if (
      !validateSelect(
        businessType,
        "Please select your business type."
      )
    ) {
      valid = false;
    }


    if (!validateRegistrationNumber()) {
      valid = false;
    }


    if (!validateGST()) {
      valid = false;
    }


    if (!validateYear()) {
      valid = false;
    }


    if (
      !validateSelect(
        category,
        "Please select a business category."
      )
    ) {
      valid = false;
    }


    if (
      !validateSelect(
        subcategory,
        "Please select a sub-category."
      )
    ) {
      valid = false;
    }


    if (!validateWebsite()) {
      valid = false;
    }


    if (!validateAddress()) {
      valid = false;
    }


    if (
      !validateSelect(
        country,
        "Please select your country."
      )
    ) {
      valid = false;
    }


    if (
      !validateSelect(
        state,
        "Please select your state."
      )
    ) {
      valid = false;
    }


    if (
      !validateSelect(
        city,
        "Please select your city."
      )
    ) {
      valid = false;
    }


    if (!validatePincode()) {
      valid = false;
    }


    if (
      !validateSelect(
        locationType,
        "Please select your business location type."
      )
    ) {
      valid = false;
    }


    if (!terms.checked) {

      showTermsError(
        "You must agree to the TradeNest Terms & Conditions."
      );

      valid = false;

    } else {

      removeTermsError();

    }


    return valid;
  }


  /* =========================================================
     CREATE USER PROFILE
  ========================================================== */

  function createUserProfile() {

    const accountType =
      getSelectedAccountType();

    const username =
      email.value.trim().toLowerCase();

    return {

      id:
        "TN-" +
        Date.now() +
        "-" +
        Math.floor(
          Math.random() * 1000
        ),

      username: username,

      email: username,

      /*
       * This is only for the frontend demo.
       * Do not store plaintext passwords in a real application.
       */
      password: password.value,

      role: accountType,

      accountType: accountType,

      fullName:
        fullName.value.trim(),

      phone:
        phone.value.trim(),

      business: {

        name:
          businessName.value.trim(),

        type:
          businessType.value,

        registrationNumber:
          registrationNumber.value.trim(),

        gst:
          gst.value.trim().toUpperCase(),

        year:
          year.value,

        category:
          category.value,

        subcategory:
          subcategory.value,

        website:
          website.value.trim()

      },

      address: {

        address:
          address.value.trim(),

        country:
          country.value,

        state:
          state.value,

        city:
          city.value,

        pincode:
          pincode.value.trim(),

        locationType:
          locationType.value

      },

      profileCreated: true,

      registrationDate:
        new Date().toISOString(),

      status: "active"

    };
  }


  /* =========================================================
     SAVE USER
  ========================================================== */

  function registerUser(userProfile) {

    const users =
      getUsers();

    const exists =
      users.some(function (user) {

        return (
          String(user.email || "")
            .toLowerCase() ===
          userProfile.email.toLowerCase()
        );

      });


    if (exists) {

      showError(
        email,
        "This email is already registered."
      );

      email.focus();

      return false;
    }


    users.push(userProfile);

    saveUsers(users);

    return true;
  }


  /* =========================================================
     FORM SUBMISSION
  ========================================================== */

  form.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();


      if (createButton.disabled) {
        return;
      }


      const isValid =
        validateForm();


      if (!isValid) {

        const firstError =
          document.querySelector(
            ".input-error"
          );

        if (firstError) {

          firstError.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });

          setTimeout(
            function () {
              firstError.focus();
            },
            350
          );

        } else if (!terms.checked) {

          terms.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });

          terms.focus();

        }

        return;
      }


      const userProfile =
        createUserProfile();


      const saved =
        registerUser(userProfile);


      if (!saved) {
        return;
      }


      localStorage.setItem(
        LAST_REGISTERED_EMAIL,
        userProfile.email
      );


      createButton.disabled = true;

      createButton.textContent =
        "Account Created ✓";


      alert(
        "Registration successful!\n\n" +
        "Account Type: " +
        userProfile.accountType
          .charAt(0)
          .toUpperCase() +
        userProfile.accountType.slice(1) +
        "\n\n" +
        "Email: " +
        userProfile.email +
        "\n\n" +
        "Your TradeNest account has been created successfully."
      );


      window.location.href =
        "login.html";

    }
  );


  /* =========================================================
     ENTER KEY
  ========================================================== */

  form.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Enter" &&
        event.target.tagName !== "TEXTAREA" &&
        event.target.tagName !== "BUTTON"
      ) {

        event.preventDefault();

      }

    }
  );


  /* =========================================================
     INITIAL STATE
  ========================================================== */

  otpButton.dataset.mode = "";

  console.log(
    "TradeNest registration system initialized."
  );

});