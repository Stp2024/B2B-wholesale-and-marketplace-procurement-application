/* ==========================================================================
   TradeNest Supplier Dashboard JavaScript
   File: js/supplier/dashboard.js

   Description:
   Clean, beginner-friendly vanilla JavaScript for:
   - Loading the logged-in supplier profile
   - Profile dropdown
   - Profile editing
   - Saving profile changes
   - Dashboard search
   - Notifications
   - Dashboard statistics
   - Mobile sidebar
   - Logout
   ========================================================================== */


document.addEventListener("DOMContentLoaded", function () {

    // ==========================================================================
    // 1. ELEMENT REFERENCES
    // ==========================================================================

    // Profile Displays
    const profileName = document.getElementById("profileName");
    const profileAvatar = document.getElementById("profileAvatar");
    const dropdownName = document.getElementById("dropdownName");
    const dropdownAvatar = document.getElementById("dropdownAvatar");
    const dropdownEmail = document.getElementById("dropdownEmail");

    const profileFullName = document.getElementById("profileFullName");
    const profileEmail = document.getElementById("profileEmail");
    const profilePhone = document.getElementById("profilePhone");
    const profileCompany = document.getElementById("profileCompany");
    const profileBusinessType = document.getElementById("profileBusinessType");
    const profileLocation = document.getElementById("profileLocation");
    const welcomeUserName = document.getElementById("welcomeUserName");


    // Profile Dropdown
    const profileMenu = document.querySelector(".profile-menu");
    const profileButton = document.getElementById("profileButton");
    const profileDropdown = document.getElementById("profileDropdown");


    // Profile Modal
    const editProfileButton = document.getElementById("editProfileButton");
    const dropdownEditProfile = document.getElementById("dropdownEditProfile");
    const profileModal = document.getElementById("profileModal");
    const modalOverlay = document.getElementById("modalOverlay");
    const closeProfileModalBtn = document.getElementById("closeProfileModal");
    const cancelProfileEditBtn = document.getElementById("cancelProfileEdit");
    const profileEditForm = document.getElementById("profileEditForm");


    // Profile Edit Inputs
    const editFullName = document.getElementById("editFullName");
    const editEmail = document.getElementById("editEmail");
    const editPhone = document.getElementById("editPhone");
    const editCompany = document.getElementById("editCompany");
    const editBusinessType = document.getElementById("editBusinessType");
    const editLocation = document.getElementById("editLocation");


    // Navigation
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.querySelector(".sidebar");
    const sidebarNavLinks = document.querySelectorAll(".sidebar .nav-link");


    // Search, Notifications and Logout
    const navbarSearch = document.getElementById("navbarSearch");
    const notificationButton = document.getElementById("notificationButton");
    const notificationBadge = document.querySelector(".notification-badge");

    const sidebarLogoutButton =
        document.getElementById("sidebarLogoutButton");

    const dropdownLogout =
        document.getElementById("dropdownLogout");


    // Dashboard Statistics
    const totalProductsElem =
        document.getElementById("totalProducts");

    const pendingOrdersElem =
        document.getElementById("pendingOrders");

    const quoteRequestsElem =
        document.getElementById("quoteRequests");

    const totalSalesElem =
        document.getElementById("totalSales");


    // ==========================================================================
    // 2. DEFAULT SUPPLIER DATA
    // ==========================================================================

    /*
       These are only fallback values.

       The dashboard will first try to use the currently logged-in
       supplier from "tradenestCurrentUser".
    */

    const defaultSupplierProfile = {
        fullName: "Supplier Name",
        email: "supplier@example.com",
        phone: "+91 98765 43210",
        company: "TradeNest Supplies Pvt. Ltd.",
        businessType: "Manufacturer & Wholesale Supplier",
        location: "Bengaluru, Karnataka, India"
    };


    const supplierStats = {
        totalProducts: 48,
        pendingOrders: 12,
        quoteRequests: 18,
        totalSales: "₹24,850"
    };


    let notificationCount = 4;

    const STORAGE_KEY = "tradenestSupplierProfile";
    const CURRENT_USER_KEY = "tradenestCurrentUser";
    const USERS_KEY = "tradenestUsers";


    // ==========================================================================
    // 3. GET FIRST LETTER FOR AVATAR
    // ==========================================================================

    function getInitial(name) {

        if (!name || typeof name !== "string") {
            return "S";
        }

        const trimmedName = name.trim();

        if (trimmedName.length === 0) {
            return "S";
        }

        return trimmedName.charAt(0).toUpperCase();
    }


    // ==========================================================================
    // 4. GET CURRENT LOGGED-IN SUPPLIER
    // ==========================================================================

    function getCurrentUser() {

        try {

            const currentUser =
                localStorage.getItem(CURRENT_USER_KEY);

            if (!currentUser) {
                return null;
            }

            return JSON.parse(currentUser);

        } catch (error) {

            console.error(
                "Error reading current user:",
                error
            );

            return null;
        }
    }


    // ==========================================================================
    // 5. CREATE SUPPLIER PROFILE FROM REGISTERED USER
    // ==========================================================================

    function createSupplierProfileFromUser(user) {

        if (!user) {
            return defaultSupplierProfile;
        }


        /*
           Different registration versions may use slightly
           different field names.

           So we support the common names here.
        */

        const fullName =
            user.fullName ||
            user.name ||
            "Supplier Name";


        const email =
            user.email ||
            "supplier@example.com";


        const phone =
            user.phone ||
            user.mobile ||
            user.phoneNumber ||
            "";


        const company =
            user.businessName ||
            user.company ||
            user.companyName ||
            "";


        const businessType =
            user.businessType ||
            user.typeOfBusiness ||
            "";


        let location =
            user.location ||
            "";


        /*
           If the registration form stores location
           as separate fields, combine them.
        */

        if (!location) {

            const locationParts = [
                user.city,
                user.state,
                user.country
            ].filter(function (part) {
                return part && part.trim();
            });

            location = locationParts.join(", ");
        }


        return {
            fullName: fullName,
            email: email,
            phone: phone,
            company: company,
            businessType: businessType,
            location: location
        };
    }


    // ==========================================================================
    // 6. LOAD SUPPLIER PROFILE
    // ==========================================================================

    function loadSupplierProfile() {

        const currentUser = getCurrentUser();


        /*
           If a user is logged in and is a supplier,
           use that account as the main source of information.
        */

        if (
            currentUser &&
            currentUser.role &&
            currentUser.role.toLowerCase() === "supplier"
        ) {

            const loggedInProfile =
                createSupplierProfileFromUser(currentUser);


            /*
               Check whether an existing supplier profile belongs
               to the SAME email account.

               This prevents an old supplier profile from another
               account from replacing the current user's information.
            */

            try {

                const savedProfile =
                    localStorage.getItem(STORAGE_KEY);


                if (savedProfile) {

                    const parsedProfile =
                        JSON.parse(savedProfile);


                    if (
                        parsedProfile &&
                        parsedProfile.email &&
                        parsedProfile.email.toLowerCase() ===
                        loggedInProfile.email.toLowerCase()
                    ) {

                        return {
                            ...loggedInProfile,
                            ...parsedProfile
                        };
                    }
                }

            } catch (error) {

                console.error(
                    "Error reading saved supplier profile:",
                    error
                );
            }


            /*
               Save the current registered supplier
               into the supplier profile storage.
            */

            saveSupplierProfile(loggedInProfile);

            return loggedInProfile;
        }


        /*
           If there is no current logged-in supplier,
           try the saved supplier profile.
        */

        try {

            const savedProfile =
                localStorage.getItem(STORAGE_KEY);


            if (savedProfile) {

                return JSON.parse(savedProfile);
            }

        } catch (error) {

            console.error(
                "Error reading supplier profile:",
                error
            );
        }


        return defaultSupplierProfile;
    }


    // ==========================================================================
    // 7. SAVE SUPPLIER PROFILE
    // ==========================================================================

    function saveSupplierProfile(profile) {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(profile)
            );

        } catch (error) {

            console.error(
                "Error saving supplier profile:",
                error
            );
        }
    }


    // ==========================================================================
    // 8. UPDATE CURRENT USER
    // ==========================================================================

    function updateCurrentUser(profile) {

        try {

            const currentUser = getCurrentUser();

            if (!currentUser) {
                return;
            }


            /*
               Update the logged-in user object.
            */

            const updatedUser = {
                ...currentUser,

                fullName: profile.fullName,
                email: profile.email,
                phone: profile.phone,

                businessName: profile.company,
                company: profile.company,

                businessType: profile.businessType,

                location: profile.location
            };


            localStorage.setItem(
                CURRENT_USER_KEY,
                JSON.stringify(updatedUser)
            );


            /*
               Also update the matching account inside
               tradenestUsers.
            */

            const usersData =
                localStorage.getItem(USERS_KEY);


            if (!usersData) {
                return;
            }


            const users = JSON.parse(usersData);


            const updatedUsers = users.map(function (user) {

                /*
                   Match the existing account using
                   the original/current email.
                */

                if (
                    user.email &&
                    currentUser.email &&
                    user.email.toLowerCase() ===
                    currentUser.email.toLowerCase()
                ) {

                    return {
                        ...user,

                        fullName: profile.fullName,
                        email: profile.email,
                        phone: profile.phone,

                        businessName: profile.company,
                        company: profile.company,

                        businessType: profile.businessType,

                        location: profile.location
                    };
                }


                return user;
            });


            localStorage.setItem(
                USERS_KEY,
                JSON.stringify(updatedUsers)
            );

        } catch (error) {

            console.error(
                "Error updating current supplier user:",
                error
            );
        }
    }


    // ==========================================================================
    // 9. UPDATE PROFILE UI
    // ==========================================================================

    function updateProfileUI() {

        const profile = loadSupplierProfile();

        const initial =
            getInitial(profile.fullName);


        // Header Profile
        if (profileName) {
            profileName.textContent =
                profile.fullName;
        }


        // Welcome Message
        if (welcomeUserName) {
            welcomeUserName.textContent =
                profile.fullName;
        }


        // Dropdown
        if (dropdownName) {
            dropdownName.textContent =
                profile.fullName;
        }


        if (dropdownEmail) {
            dropdownEmail.textContent =
                profile.email;
        }


        // Header Avatar
        if (profileAvatar) {
            profileAvatar.textContent =
                initial;
        }


        // Dropdown Avatar
        if (dropdownAvatar) {
            dropdownAvatar.textContent =
                initial;
        }


        // Profile Details
        if (profileFullName) {
            profileFullName.textContent =
                profile.fullName;
        }


        if (profileEmail) {
            profileEmail.textContent =
                profile.email;
        }


        if (profilePhone) {
            profilePhone.textContent =
                profile.phone || "N/A";
        }


        if (profileCompany) {
            profileCompany.textContent =
                profile.company || "N/A";
        }


        if (profileBusinessType) {
            profileBusinessType.textContent =
                profile.businessType || "N/A";
        }


        if (profileLocation) {
            profileLocation.textContent =
                profile.location || "N/A";
        }
    }


    // ==========================================================================
    // 10. PROFILE DROPDOWN
    // ==========================================================================

    function openProfileDropdown() {

        if (profileDropdown) {
            profileDropdown.hidden = false;
        }

        if (profileButton) {
            profileButton.setAttribute(
                "aria-expanded",
                "true"
            );
        }
    }


    function closeProfileDropdown() {

        if (profileDropdown) {
            profileDropdown.hidden = true;
        }

        if (profileButton) {
            profileButton.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    }


    function toggleProfileDropdown() {

        if (!profileDropdown) {
            return;
        }


        if (profileDropdown.hidden) {
            openProfileDropdown();
        } else {
            closeProfileDropdown();
        }
    }


    if (profileButton) {

        profileButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                toggleProfileDropdown();
            }
        );
    }


    // ==========================================================================
    // 11. PROFILE MODAL
    // ==========================================================================

    function openProfileModal() {

        closeProfileDropdown();


        const profile =
            loadSupplierProfile();


        if (editFullName) {
            editFullName.value =
                profile.fullName || "";
        }


        if (editEmail) {
            editEmail.value =
                profile.email || "";
        }


        if (editPhone) {
            editPhone.value =
                profile.phone || "";
        }


        if (editCompany) {
            editCompany.value =
                profile.company || "";
        }


        if (editBusinessType) {
            editBusinessType.value =
                profile.businessType || "";
        }


        if (editLocation) {
            editLocation.value =
                profile.location || "";
        }


        if (profileModal) {
            profileModal.hidden = false;
        }


        document.body.style.overflow = "hidden";


        if (editFullName) {
            editFullName.focus();
        }
    }


    function closeProfileModal() {

        if (profileModal) {
            profileModal.hidden = true;
        }


        document.body.style.overflow = "";


        const inputs = [
            editFullName,
            editEmail,
            editPhone,
            editCompany,
            editBusinessType,
            editLocation
        ];


        inputs.forEach(function (input) {

            if (input) {
                input.setCustomValidity("");
            }
        });
    }


    if (editProfileButton) {

        editProfileButton.addEventListener(
            "click",
            openProfileModal
        );
    }


    if (dropdownEditProfile) {

        dropdownEditProfile.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                openProfileModal();
            }
        );
    }


    if (closeProfileModalBtn) {

        closeProfileModalBtn.addEventListener(
            "click",
            closeProfileModal
        );
    }


    if (cancelProfileEditBtn) {

        cancelProfileEditBtn.addEventListener(
            "click",
            closeProfileModal
        );
    }


    if (modalOverlay) {

        modalOverlay.addEventListener(
            "click",
            closeProfileModal
        );
    }


    // ==========================================================================
    // 12. PROFILE VALIDATION
    // ==========================================================================

    function validateProfileForm() {

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const phonePattern =
            /^[+\d\s-]*$/;


        // Full Name
        if (editFullName) {

            editFullName.setCustomValidity("");


            if (
                !editFullName.value.trim() ||
                editFullName.value.trim().length < 2
            ) {

                editFullName.setCustomValidity(
                    "Full Name is required and must be at least 2 characters long."
                );

                editFullName.reportValidity();

                return false;
            }
        }


        // Email
        if (editEmail) {

            editEmail.setCustomValidity("");


            if (
                !editEmail.value.trim() ||
                !emailPattern.test(
                    editEmail.value.trim()
                )
            ) {

                editEmail.setCustomValidity(
                    "Please enter a valid email address."
                );

                editEmail.reportValidity();

                return false;
            }
        }


        // Phone
        if (
            editPhone &&
            editPhone.value.trim().length > 0
        ) {

            editPhone.setCustomValidity("");


            if (
                !phonePattern.test(
                    editPhone.value.trim()
                ) ||
                editPhone.value.trim().length < 7
            ) {

                editPhone.setCustomValidity(
                    "Please enter a valid phone number."
                );

                editPhone.reportValidity();

                return false;
            }
        }


        return true;
    }


    // ==========================================================================
    // 13. SAVE EDITED PROFILE
    // ==========================================================================

    if (profileEditForm) {

        profileEditForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                if (!validateProfileForm()) {
                    return;
                }


                const updatedProfile = {

                    fullName:
                        editFullName
                            ? editFullName.value.trim()
                            : "",

                    email:
                        editEmail
                            ? editEmail.value.trim()
                            : "",

                    phone:
                        editPhone
                            ? editPhone.value.trim()
                            : "",

                    company:
                        editCompany
                            ? editCompany.value.trim()
                            : "",

                    businessType:
                        editBusinessType
                            ? editBusinessType.value.trim()
                            : "",

                    location:
                        editLocation
                            ? editLocation.value.trim()
                            : ""
                };


                /*
                   Save supplier dashboard profile.
                */

                saveSupplierProfile(
                    updatedProfile
                );


                /*
                   Also update the logged-in user.
                */

                updateCurrentUser(
                    updatedProfile
                );


                /*
                   Immediately update the dashboard.
                */

                updateProfileUI();


                closeProfileModal();


                alert(
                    "Profile updated successfully."
                );
            }
        );
    }


    // ==========================================================================
    // 14. MOBILE SIDEBAR
    // ==========================================================================

    if (menuToggle && sidebar) {

        menuToggle.addEventListener(
            "click",
            function () {

                sidebar.classList.toggle("open");


                const isOpen =
                    sidebar.classList.contains("open");


                menuToggle.setAttribute(
                    "aria-expanded",
                    isOpen ? "true" : "false"
                );
            }
        );
    }


    // Close sidebar after navigation
    sidebarNavLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                if (
                    window.innerWidth <= 768 &&
                    sidebar &&
                    sidebar.classList.contains("open")
                ) {

                    sidebar.classList.remove("open");


                    if (menuToggle) {

                        menuToggle.setAttribute(
                            "aria-expanded",
                            "false"
                        );
                    }
                }
            }
        );
    });


    // ==========================================================================
    // 15. DASHBOARD SEARCH
    // ==========================================================================

    function updateEmptySearchState(
        hasVisibleItems,
        searchTerm
    ) {

        let emptyStateElem =
            document.getElementById(
                "searchEmptyState"
            );


        if (
            !hasVisibleItems &&
            searchTerm !== ""
        ) {

            if (!emptyStateElem) {

                emptyStateElem =
                    document.createElement("div");


                emptyStateElem.id =
                    "searchEmptyState";


                emptyStateElem.style.padding =
                    "20px";


                emptyStateElem.style.textAlign =
                    "center";


                emptyStateElem.style.color =
                    "#666";


                emptyStateElem.style.fontWeight =
                    "500";


                emptyStateElem.textContent =
                    "No matching results found.";


                const mainContent =
                    document.querySelector("main") ||
                    document.querySelector(
                        ".dashboard-content"
                    );


                if (mainContent) {
                    mainContent.prepend(
                        emptyStateElem
                    );
                }
            }

        } else if (emptyStateElem) {

            emptyStateElem.remove();
        }
    }


    function handleDashboardSearch() {

        if (!navbarSearch) {
            return;
        }


        const searchTerm =
            navbarSearch.value
                .toLowerCase()
                .trim();


        let matchCount = 0;


        // Table Rows
        const tableRows =
            document.querySelectorAll(
                ".data-table tbody tr"
            );


        tableRows.forEach(function (row) {

            const text =
                row.textContent.toLowerCase();


            if (text.includes(searchTerm)) {

                row.style.display = "";

                matchCount++;

            } else {

                row.style.display = "none";
            }
        });


        // Product Cards
        const productCards =
            document.querySelectorAll(
                ".product-card"
            );


        productCards.forEach(function (card) {

            const text =
                card.textContent.toLowerCase();


            if (text.includes(searchTerm)) {

                card.style.display = "";

                matchCount++;

            } else {

                card.style.display = "none";
            }
        });


        // Quote Items
        const quoteItems =
            document.querySelectorAll(
                ".quote-item"
            );


        quoteItems.forEach(function (item) {

            const text =
                item.textContent.toLowerCase();


            if (text.includes(searchTerm)) {

                item.style.display = "";

                matchCount++;

            } else {

                item.style.display = "none";
            }
        });


        // Supplier / Customer Cards
        const supplierCards =
            document.querySelectorAll(
                ".supplier-card"
            );


        supplierCards.forEach(function (card) {

            const text =
                card.textContent.toLowerCase();


            if (text.includes(searchTerm)) {

                card.style.display = "";

                matchCount++;

            } else {

                card.style.display = "none";
            }
        });


        const totalItemsTracked =
            tableRows.length +
            productCards.length +
            quoteItems.length +
            supplierCards.length;


        if (totalItemsTracked > 0) {

            updateEmptySearchState(
                matchCount > 0,
                searchTerm
            );
        }
    }


    if (navbarSearch) {

        navbarSearch.addEventListener(
            "input",
            handleDashboardSearch
        );
    }


    // ==========================================================================
    // 16. PRODUCT BUTTONS
    // ==========================================================================

    const productButtons =
        document.querySelectorAll(
            ".product-card button, .product-card a"
        );


    productButtons.forEach(function (btn) {

        btn.addEventListener(
            "click",
            function (event) {

                const href =
                    btn.getAttribute("href");


                if (!href || href === "#") {

                    event.preventDefault();


                    alert(
                        "Product management functionality is available in demo mode."
                    );
                }
            }
        );
    });


    // ==========================================================================
    // 17. NOTIFICATIONS
    // ==========================================================================

    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            function () {

                if (notificationCount > 0) {

                    alert(
                        `You have ${notificationCount} new notifications.`
                    );


                    notificationCount = 0;


                    if (notificationBadge) {

                        notificationBadge.hidden = true;
                    }

                } else {

                    alert(
                        "You have no new notifications."
                    );
                }
            }
        );
    }


    // ==========================================================================
    // 18. DASHBOARD STATISTICS
    // ==========================================================================

    function updateDashboardStats() {

        const productCards =
            document.querySelectorAll(
                ".product-card"
            );


        const productCount =
            productCards.length > 0
                ? productCards.length
                : supplierStats.totalProducts;


        if (totalProductsElem) {

            totalProductsElem.textContent =
                productCount;
        }


        if (pendingOrdersElem) {

            pendingOrdersElem.textContent =
                supplierStats.pendingOrders;
        }


        if (quoteRequestsElem) {

            quoteRequestsElem.textContent =
                supplierStats.quoteRequests;
        }


        if (totalSalesElem) {

            totalSalesElem.textContent =
                supplierStats.totalSales;
        }
    }


    // ==========================================================================
    // 19. LOGOUT
    // ==========================================================================

    function handleLogout(event) {

        if (event) {
            event.preventDefault();
        }


        const confirmed =
            confirm(
                "Are you sure you want to logout?"
            );


        if (!confirmed) {
            return;
        }


        /*
           Remove only the current login session.

           Keep:
           - tradenestUsers
           - tradenestSupplierProfile
           - other registered account data
        */

        localStorage.removeItem(
            CURRENT_USER_KEY
        );


        sessionStorage.clear();


        /*
           IMPORTANT:
           Supplier dashboard is:

           pages/supplier/dashboard.html

           Login is:

           auth/login.html

           Therefore:

           ../../auth/login.html
        */

        window.location.href =
            "../../auth/login.html";
    }


    if (sidebarLogoutButton) {

        sidebarLogoutButton.addEventListener(
            "click",
            handleLogout
        );
    }


    if (dropdownLogout) {

        dropdownLogout.addEventListener(
            "click",
            handleLogout
        );
    }


    // ==========================================================================
    // 20. GLOBAL CLICK CONTROLS
    // ==========================================================================

    document.addEventListener(
        "click",
        function (event) {

            if (
                profileMenu &&
                !profileMenu.contains(event.target)
            ) {

                closeProfileDropdown();
            }
        }
    );


    // ==========================================================================
    // 21. ESC KEY
    // ==========================================================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" ||
                event.key === "Esc"
            ) {

                // Close dropdown
                if (
                    profileDropdown &&
                    !profileDropdown.hidden
                ) {

                    closeProfileDropdown();
                }


                // Close modal
                if (
                    profileModal &&
                    !profileModal.hidden
                ) {

                    closeProfileModal();
                }


                // Close mobile sidebar
                if (
                    sidebar &&
                    sidebar.classList.contains("open")
                ) {

                    sidebar.classList.remove("open");


                    if (menuToggle) {

                        menuToggle.setAttribute(
                            "aria-expanded",
                            "false"
                        );
                    }
                }
            }
        }
    );


    // ==========================================================================
    // 22. INITIAL DASHBOARD SETUP
    // ==========================================================================

    updateProfileUI();

    updateDashboardStats();

});