/**
 * TradeNest Buyer Dashboard JavaScript
 * File: js/buyer/dashboard.js
 *
 * Handles:
 * - Logged-in buyer profile
 * - Profile dropdown
 * - Profile edit modal
 * - Profile updates
 * - Dashboard statistics
 * - Search
 * - Notifications
 * - Mobile sidebar
 * - Logout
 */

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // 1. DEFAULT DATA
    // ==========================================

    const defaultBuyerProfile = {
        fullName: "Aisha Patel",
        email: "aisha.patel@tradenest.com",
        phone: "+91 98765 43210",
        company: "North Star Retail",
        businessType: "Retailer / Wholesale Buyer",
        location: "Bengaluru, Karnataka, India"
    };


    const buyerStats = {
        totalOrders: 24,
        pendingOrders: 6,
        savedProducts: 15,
        totalSpent: "₹48,650"
    };


    let lastActiveElement = null;


    // ==========================================
    // 2. LOAD LOGGED-IN USER
    // ==========================================

    function getCurrentUser() {

        try {

            const currentUser =
                localStorage.getItem("tradenestCurrentUser");

            if (!currentUser) {
                return null;
            }

            const parsedUser = JSON.parse(currentUser);

            if (
                parsedUser &&
                typeof parsedUser === "object"
            ) {
                return parsedUser;
            }

        } catch (error) {

            console.error(
                "Error reading logged-in user:",
                error
            );

        }

        return null;
    }


    // ==========================================
    // 3. CONVERT REGISTERED USER TO PROFILE
    // ==========================================

    function createBuyerProfileFromUser(user) {

        if (!user) {
            return { ...defaultBuyerProfile };
        }


        /*
         * Different registration forms may use
         * different property names.
         *
         * Therefore we check multiple possible
         * field names.
         */

        const fullName =
            user.fullName ||
            user.name ||
            defaultBuyerProfile.fullName;


        const email =
            user.email ||
            defaultBuyerProfile.email;


        const phone =
            user.phone ||
            user.mobile ||
            user.phoneNumber ||
            defaultBuyerProfile.phone;


        const company =
            user.businessName ||
            user.company ||
            user.companyName ||
            defaultBuyerProfile.company;


        const businessType =
            user.businessType ||
            user.typeOfBusiness ||
            defaultBuyerProfile.businessType;


        let location =
            user.location ||
            "";


        /*
         * If registration stores separate
         * city/state/country values, combine them.
         */

        if (!location) {

            const locationParts = [];

            if (user.city) {
                locationParts.push(user.city);
            }

            if (user.state) {
                locationParts.push(user.state);
            }

            if (user.country) {
                locationParts.push(user.country);
            }

            if (locationParts.length > 0) {
                location = locationParts.join(", ");
            }
        }


        if (!location) {
            location = defaultBuyerProfile.location;
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


    function normalizeStoredBuyerProfile(profile) {
        const safeProfile = { ...defaultBuyerProfile, ...(profile || {}) };

        if (String(safeProfile.email || "").includes("@tradenest.demo")) {
            safeProfile.email = defaultBuyerProfile.email;
        }

        if (!safeProfile.fullName || safeProfile.fullName === "Buyer Name") {
            safeProfile.fullName = defaultBuyerProfile.fullName;
        }

        if (!safeProfile.company || safeProfile.company === "TradeNest Buyer Company") {
            safeProfile.company = defaultBuyerProfile.company;
        }

        return safeProfile;
    }

    // ==========================================
    // 4. LOAD BUYER PROFILE
    // ==========================================

    function loadBuyerProfile() {

        /*
         * First check the currently logged-in user.
         */

        const currentUser = getCurrentUser();


        if (
            currentUser &&
            String(currentUser.role || "")
                .trim()
                .toLowerCase() === "buyer"
        ) {

            const loggedInProfile =
                createBuyerProfileFromUser(currentUser);


            try {

                const savedProfile =
                    localStorage.getItem(
                        "tradenestBuyerProfile"
                    );


                if (savedProfile) {

                    const parsedProfile =
                        JSON.parse(savedProfile);


                    if (
                        parsedProfile &&
                        typeof parsedProfile === "object"
                    ) {

                        const mergedProfile = normalizeStoredBuyerProfile({
                            ...loggedInProfile,
                            ...parsedProfile
                        });

                        saveBuyerProfileToStorage(mergedProfile);
                        return mergedProfile;
                    }
                }

            } catch (error) {

                console.error(
                    "Error loading buyer profile:",
                    error
                );

            }


            saveBuyerProfileToStorage(loggedInProfile);

            return normalizeStoredBuyerProfile(loggedInProfile);
        }


        /*
         * If no current user exists, try the
         * previously saved dashboard profile.
         */

        try {

            const storedProfile =
                localStorage.getItem(
                    "tradenestBuyerProfile"
                );


            if (storedProfile) {

                const parsed =
                    JSON.parse(storedProfile);


                if (
                    parsed &&
                    typeof parsed === "object"
                ) {

                    const normalizedProfile = normalizeStoredBuyerProfile({
                        ...defaultBuyerProfile,
                        ...parsed
                    });

                    saveBuyerProfileToStorage(normalizedProfile);
                    return normalizedProfile;
                }
            }

        } catch (error) {

            console.error(
                "Error loading saved buyer profile:",
                error
            );

        }


        const normalizedProfile = normalizeStoredBuyerProfile({
            ...defaultBuyerProfile
        });

        saveBuyerProfileToStorage(normalizedProfile);
        return normalizedProfile;
    }


    // ==========================================
    // 5. SAVE BUYER PROFILE
    // ==========================================

    function saveBuyerProfileToStorage(profile) {

        try {
            const normalizedProfile = normalizeStoredBuyerProfile(profile);

            localStorage.setItem(
                "tradenestBuyerProfile",
                JSON.stringify(normalizedProfile)
            );

            return true;

        } catch (error) {

            console.error(
                "Error saving buyer profile:",
                error
            );

            return false;
        }
    }


    // ==========================================
    // 6. UPDATE CURRENT USER
    // ==========================================

    function updateCurrentUser(profile) {

        try {

            const currentUser =
                getCurrentUser();


            if (!currentUser) {
                return;
            }


            /*
             * Update the logged-in user's
             * information as well.
             */

            currentUser.fullName =
                profile.fullName;

            currentUser.email =
                profile.email;

            currentUser.phone =
                profile.phone;

            currentUser.businessName =
                profile.company;

            currentUser.company =
                profile.company;

            currentUser.businessType =
                profile.businessType;

            currentUser.location =
                profile.location;


            localStorage.setItem(
                "tradenestCurrentUser",
                JSON.stringify(currentUser)
            );


            /*
             * Also update the registered user
             * inside tradenestUsers.
             */

            const usersData =
                localStorage.getItem(
                    "tradenestUsers"
                );


            if (!usersData) {
                return;
            }


            const users =
                JSON.parse(usersData);


            if (!Array.isArray(users)) {
                return;
            }


            const updatedUsers =
                users.map(function (user) {

                    if (
                        String(user.email || "")
                            .trim()
                            .toLowerCase() ===
                        String(profile.email || "")
                            .trim()
                            .toLowerCase()
                    ) {

                        return {
                            ...user,
                            fullName: profile.fullName,
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
                "tradenestUsers",
                JSON.stringify(updatedUsers)
            );

        } catch (error) {

            console.error(
                "Error updating current user:",
                error
            );
        }
    }


    // ==========================================
    // 7. GET INITIAL
    // ==========================================

    function getInitial(name) {

        if (
            !name ||
            typeof name !== "string"
        ) {
            return "B";
        }


        const trimmed =
            name.trim();


        if (!trimmed) {
            return "B";
        }


        return trimmed
            .charAt(0)
            .toUpperCase();
    }


    // ==========================================
    // 8. UPDATE PROFILE UI
    // ==========================================

    function updateProfileUI(profile) {

        const initial =
            getInitial(profile.fullName);


        // --------------------------------------
        // PROFILE DETAILS
        // --------------------------------------

        const profileName =
            document.getElementById(
                "profileName"
            );

        const profileEmail =
            document.getElementById(
                "profileEmail"
            );

        const profilePhone =
            document.getElementById(
                "profilePhone"
            );

        const profileCompany =
            document.getElementById(
                "profileCompany"
            );

        const profileBusinessType =
            document.getElementById(
                "profileBusinessType"
            );

        const profileLocation =
            document.getElementById(
                "profileLocation"
            );

        const profileFullName =
            document.getElementById(
                "profileFullName"
            );


        if (profileName) {
            profileName.textContent =
                profile.fullName;
        }


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
                profile.phone;
        }


        if (profileCompany) {
            profileCompany.textContent =
                profile.company;
        }


        if (profileBusinessType) {
            profileBusinessType.textContent =
                profile.businessType;
        }


        if (profileLocation) {
            profileLocation.textContent =
                profile.location;
        }


        // --------------------------------------
        // PROFILE DROPDOWN
        // --------------------------------------

        const dropdownName =
            document.getElementById(
                "dropdownName"
            );

        const dropdownEmail =
            document.getElementById(
                "dropdownEmail"
            );


        if (dropdownName) {
            dropdownName.textContent =
                profile.fullName;
        }


        if (dropdownEmail) {
            dropdownEmail.textContent =
                profile.email;
        }


        // --------------------------------------
        // WELCOME MESSAGE
        // --------------------------------------

        const welcomeUserName =
            document.getElementById(
                "welcomeUserName"
            );


        if (welcomeUserName) {

            welcomeUserName.textContent =
                `Welcome back, ${profile.fullName}!`;
        }


        // --------------------------------------
        // AVATARS
        // --------------------------------------

        const profileAvatar =
            document.getElementById(
                "profileAvatar"
            );

        const dropdownAvatar =
            document.getElementById(
                "dropdownAvatar"
            );


        if (profileAvatar) {
            profileAvatar.textContent =
                initial;
        }


        if (dropdownAvatar) {
            dropdownAvatar.textContent =
                initial;
        }
    }


    // ==========================================
    // 9. UPDATE DASHBOARD STATISTICS
    // ==========================================

    function updateDashboardStats() {

        const storeRef = window.TradeNestStore;
        const buyerId = storeRef && storeRef.getCurrentUser ? storeRef.getCurrentUser().id : "buyer-001";
        const state = storeRef ? storeRef.getStore() : { orders: [], quotations: [], sampleRequests: [], rfqs: [] };

        const orders = (state.orders || []).filter((item) => item.buyerId === buyerId);
        const quotations = (state.quotations || []).filter((item) => item.buyerId === buyerId);
        const rfqs = (state.rfqs || []).filter((item) => item.buyerId === buyerId);
        const sampleRequests = (state.sampleRequests || []).filter((item) => item.buyerId === buyerId);

        const totalOrdersEl = document.getElementById("totalOrders");
        const activeQuotesEl = document.getElementById("activeQuotes");
        const pendingOrdersEl = document.getElementById("pendingOrders");
        const completedPurchasesEl = document.getElementById("completedPurchases");
        const savedProductsEl = document.getElementById("savedProducts");
        const totalSpentEl = document.getElementById("totalSpent");

        const activeQuotes = quotations.filter((item) => !["Accepted", "Rejected", "Cancelled"].includes(item.status)).length;
        const pendingOrders = orders.filter((item) => !["Completed", "Delivered", "Cancelled", "Rejected"].includes(item.status)).length;
        const completedPurchases = orders.filter((item) => ["Completed", "Delivered"].includes(item.status)).length;
        const totalSpent = orders.reduce((sum, item) => sum + (Number(item.totalAmount || item.amount || 0) || 0), 0);
        const savedProducts = JSON.parse(localStorage.getItem("tradenest_saved_products") || "[]").length;

        if (totalOrdersEl) totalOrdersEl.textContent = orders.length;
        if (activeQuotesEl) activeQuotesEl.textContent = activeQuotes;
        if (pendingOrdersEl) pendingOrdersEl.textContent = pendingOrders;
        if (completedPurchasesEl) completedPurchasesEl.textContent = completedPurchases;
        if (savedProductsEl) savedProductsEl.textContent = savedProducts;
        if (totalSpentEl) totalSpentEl.textContent = storeRef ? storeRef.formatCurrency(totalSpent) : `₹${totalSpent.toLocaleString("en-IN")}`;

        const overviewTotalRfqs = document.getElementById("stat-total-rfqs");
        const overviewPendingQuotations = document.getElementById("stat-pending-quotations");
        const overviewActiveSamples = document.getElementById("stat-active-samples");
        const overviewActiveOrders = document.getElementById("stat-active-orders");
        const overviewCompletedOrders = document.getElementById("stat-completed-orders");

        if (overviewTotalRfqs) overviewTotalRfqs.textContent = rfqs.length;
        if (overviewPendingQuotations) overviewPendingQuotations.textContent = quotations.filter((item) => ["Pending", "In Review", "Under Review", "Offer Received"].includes(item.status)).length;
        if (overviewActiveSamples) overviewActiveSamples.textContent = sampleRequests.filter((item) => !["Delivered", "Feedback Submitted", "Rejected"].includes(item.status)).length;
        if (overviewActiveOrders) overviewActiveOrders.textContent = orders.filter((item) => !["Completed", "Delivered", "Cancelled", "Rejected"].includes(item.status)).length;
        if (overviewCompletedOrders) overviewCompletedOrders.textContent = completedPurchases;
    }


    // ==========================================
    // 10. PROFILE DROPDOWN
    // ==========================================

    const profileButton =
        document.getElementById(
            "profileButton"
        );

    const profileDropdown =
        document.getElementById(
            "profileDropdown"
        );


    function openProfileDropdown() {

        if (
            !profileDropdown ||
            !profileButton
        ) {
            return;
        }


        profileDropdown.hidden = false;

        profileDropdown.classList.add(
            "show"
        );

        profileButton.setAttribute(
            "aria-expanded",
            "true"
        );
    }


    function closeProfileDropdown() {

        if (
            !profileDropdown ||
            !profileButton
        ) {
            return;
        }


        profileDropdown.hidden = true;

        profileDropdown.classList.remove(
            "show"
        );

        profileButton.setAttribute(
            "aria-expanded",
            "false"
        );
    }


    function toggleProfileDropdown() {

        if (!profileDropdown) {
            return;
        }


        if (
            profileDropdown.hidden ||
            !profileDropdown.classList.contains(
                "show"
            )
        ) {

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


    // ==========================================
    // 11. PROFILE EDIT MODAL
    // ==========================================

    const profileModal =
        document.getElementById(
            "profileModal"
        );

    const modalOverlay =
        document.getElementById(
            "modalOverlay"
        );

    const profileEditForm =
        document.getElementById(
            "profileEditForm"
        );

    const closeProfileModalBtn =
        document.getElementById(
            "closeProfileModal"
        );

    const cancelProfileEditBtn =
        document.getElementById(
            "cancelProfileEdit"
        );

    const editProfileBtn =
        document.getElementById(
            "editProfileButton"
        );

    const dropdownEditProfileBtn =
        document.getElementById(
            "dropdownEditProfile"
        );


    // ==========================================
    // 12. POPULATE EDIT FORM
    // ==========================================

    function populateEditForm(profile) {

        const editFullName =
            document.getElementById(
                "editFullName"
            );

        const editEmail =
            document.getElementById(
                "editEmail"
            );

        const editPhone =
            document.getElementById(
                "editPhone"
            );

        const editCompany =
            document.getElementById(
                "editCompany"
            );

        const editBusinessType =
            document.getElementById(
                "editBusinessType"
            );

        const editLocation =
            document.getElementById(
                "editLocation"
            );


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
    }


    // ==========================================
    // 13. OPEN PROFILE MODAL
    // ==========================================

    function openProfileModal() {

        if (!profileModal) {
            return;
        }


        lastActiveElement =
            document.activeElement;


        const currentProfile =
            loadBuyerProfile();


        populateEditForm(
            currentProfile
        );


        profileModal.hidden = false;

        profileModal.classList.add(
            "open",
            "active",
            "show"
        );


        if (modalOverlay) {

            modalOverlay.hidden = false;

            modalOverlay.classList.add(
                "open",
                "active",
                "show"
            );
        }


        document.body.style.overflow =
            "hidden";


        closeProfileDropdown();


        const editFullName =
            document.getElementById(
                "editFullName"
            );


        if (editFullName) {
            editFullName.focus();
        }
    }


    // ==========================================
    // 14. CLOSE PROFILE MODAL
    // ==========================================

    function closeProfileModal() {

        if (!profileModal) {
            return;
        }


        profileModal.hidden = true;

        profileModal.classList.remove(
            "open",
            "active",
            "show"
        );


        if (modalOverlay) {

            modalOverlay.hidden = true;

            modalOverlay.classList.remove(
                "open",
                "active",
                "show"
            );
        }


        document.body.style.overflow =
            "";


        if (
            lastActiveElement &&
            typeof lastActiveElement.focus ===
            "function"
        ) {

            lastActiveElement.focus();
        }
    }


    if (editProfileBtn) {

        editProfileBtn.addEventListener(
            "click",
            openProfileModal
        );
    }


    if (dropdownEditProfileBtn) {

        dropdownEditProfileBtn.addEventListener(
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


    // ==========================================
    // 15. PROFILE FORM VALIDATION
    // ==========================================

    function validateProfileForm(formData) {

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const phoneRegex =
            /^[0-9+\s\-()]*$/;


        if (
            !formData.fullName ||
            formData.fullName.trim().length < 2
        ) {

            alert(
                "Please enter a valid Full Name (at least 2 characters)."
            );

            return false;
        }


        if (
            !formData.email ||
            !emailRegex.test(
                formData.email.trim()
            )
        ) {

            alert(
                "Please enter a valid Email address."
            );

            return false;
        }


        if (
            formData.phone &&
            !phoneRegex.test(
                formData.phone.trim()
            )
        ) {

            alert(
                "Please enter a valid Phone number."
            );

            return false;
        }


        if (
            !formData.company ||
            formData.company.trim().length < 2
        ) {

            alert(
                "Please enter a valid Company name."
            );

            return false;
        }


        if (
            !formData.businessType ||
            formData.businessType.trim() === ""
        ) {

            alert(
                "Please select or enter a Business Type."
            );

            return false;
        }


        if (
            !formData.location ||
            formData.location.trim() === ""
        ) {

            alert(
                "Please enter a Location."
            );

            return false;
        }


        return true;
    }


    // ==========================================
    // 16. SAVE PROFILE EDIT
    // ==========================================

    if (profileEditForm) {

        profileEditForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const editFullName =
                    document.getElementById(
                        "editFullName"
                    );

                const editEmail =
                    document.getElementById(
                        "editEmail"
                    );

                const editPhone =
                    document.getElementById(
                        "editPhone"
                    );

                const editCompany =
                    document.getElementById(
                        "editCompany"
                    );

                const editBusinessType =
                    document.getElementById(
                        "editBusinessType"
                    );

                const editLocation =
                    document.getElementById(
                        "editLocation"
                    );


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


                // Validate
                if (
                    !validateProfileForm(
                        updatedProfile
                    )
                ) {
                    return;
                }


                // Save dashboard profile
                const success =
                    saveBuyerProfileToStorage(
                        updatedProfile
                    );


                if (!success) {

                    alert(
                        "Failed to save profile. Please try again."
                    );

                    return;
                }


                // Update logged-in user
                updateCurrentUser(
                    updatedProfile
                );


                // Update dashboard immediately
                updateProfileUI(
                    updatedProfile
                );


                // Close modal
                closeProfileModal();


                alert(
                    "Profile updated successfully."
                );
            }
        );
    }


    // ==========================================
    // 17. MOBILE SIDEBAR
    // ==========================================

    const menuToggle =
        document.getElementById(
            "menuToggle"
        );

    const sidebar =
        document.querySelector(
            ".sidebar"
        ) ||
        document.getElementById(
            "sidebar"
        );


    function closeMobileSidebar() {

        if (sidebar) {
            sidebar.classList.remove(
                "open"
            );
        }


        if (menuToggle) {

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    }


    if (
        menuToggle &&
        sidebar
    ) {

        menuToggle.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                sidebar.classList.toggle(
                    "open"
                );


                const isOpen =
                    sidebar.classList.contains(
                        "open"
                    );


                menuToggle.setAttribute(
                    "aria-expanded",
                    isOpen
                        ? "true"
                        : "false"
                );
            }
        );


        const sidebarLinks =
            sidebar.querySelectorAll(
                "a"
            );


        sidebarLinks.forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        if (
                            window.innerWidth <=
                            768
                        ) {

                            closeMobileSidebar();
                        }
                    }
                );
            }
        );
    }


    // ==========================================
    // 18. SEARCH FUNCTIONALITY
    // ==========================================

    const navbarSearch =
        document.getElementById(
            "navbarSearch"
        );


    function handleDashboardSearch() {

        if (!navbarSearch) {
            return;
        }


        const query =
            navbarSearch.value
                .toLowerCase()
                .trim();


        const selectors = [
            ".data-table tbody tr",
            ".product-card",
            ".order-card",
            ".quote-item",
            ".supplier-card"
        ];


        let targetElements = [];


        selectors.forEach(
            function (selector) {

                const found =
                    document.querySelectorAll(
                        selector
                    );


                found.forEach(
                    function (element) {

                        targetElements.push(
                            element
                        );
                    }
                );
            }
        );


        let totalMatchCount = 0;


        targetElements.forEach(
            function (element) {

                const text =
                    element.textContent
                        .toLowerCase();


                if (
                    query === "" ||
                    text.includes(query)
                ) {

                    element.style.display =
                        "";

                    totalMatchCount++;

                } else {

                    element.style.display =
                        "none";
                }
            }
        );


        let noResultsEl =
            document.getElementById(
                "searchNoResultsMessage"
            );


        if (
            query !== "" &&
            totalMatchCount === 0 &&
            targetElements.length > 0
        ) {

            if (!noResultsEl) {

                noResultsEl =
                    document.createElement(
                        "div"
                    );


                noResultsEl.id =
                    "searchNoResultsMessage";


                noResultsEl.textContent =
                    "No matching results found.";


                noResultsEl.style.padding =
                    "15px";


                noResultsEl.style.textAlign =
                    "center";


                noResultsEl.style.color =
                    "#666";


                const container =
                    document.querySelector(
                        ".main-content"
                    ) ||
                    document.querySelector(
                        "main"
                    ) ||
                    document.body;


                container.appendChild(
                    noResultsEl
                );

            } else {

                noResultsEl.style.display =
                    "block";
            }

        } else if (noResultsEl) {

            noResultsEl.style.display =
                "none";
        }
    }


    if (navbarSearch) {

        navbarSearch.addEventListener(
            "input",
            handleDashboardSearch
        );
    }


    // ==========================================
    // 19. NOTIFICATIONS
    // ==========================================

    const notificationButton =
        document.getElementById(
            "notificationButton"
        );

    const notificationBadge =
        document.querySelector(
            ".notification-badge"
        );


    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            function () {

                alert(
                    "You have 3 new notifications:\n\n" +
                    "1. Your order #1024 has been shipped.\n" +
                    "2. Quote request answered by Supplier.\n" +
                    "3. Price drop on Saved Products."
                );


                if (notificationBadge) {

                    notificationBadge.style.display =
                        "none";
                }
            }
        );
    }


    // ==========================================
    // 20. LOGOUT
    // ==========================================

    const sidebarLogoutButton =
        document.getElementById(
            "sidebarLogoutButton"
        );

    const dropdownLogout =
        document.getElementById(
            "dropdownLogout"
        );


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


        try {

            /*
             * Remove the active login session.
             *
             * We intentionally keep the profile
             * and registered account information.
             */

            localStorage.removeItem(
                "tradenestCurrentUser"
            );

            sessionStorage.clear();

        } catch (error) {

            console.error(
                "Error clearing login session:",
                error
            );
        }


        /*
         * Dashboard is:
         *
         * pages/buyer/dashboard.html
         *
         * Login is:
         *
         * auth/login.html
         *
         * Therefore we need:
         *
         * ../../auth/login.html
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


    // ==========================================
    // 21. CLICK OUTSIDE
    // ==========================================

    document.addEventListener(
        "click",
        function (event) {

            // -------------------------------
            // PROFILE DROPDOWN
            // -------------------------------

            if (
                profileDropdown &&
                !profileDropdown.hidden
            ) {

                const clickedInsideDropdown =
                    profileDropdown.contains(
                        event.target
                    );


                const clickedOnButton =
                    profileButton &&
                    profileButton.contains(
                        event.target
                    );


                if (
                    !clickedInsideDropdown &&
                    !clickedOnButton
                ) {

                    closeProfileDropdown();
                }
            }


            // -------------------------------
            // MOBILE SIDEBAR
            // -------------------------------

            if (
                sidebar &&
                sidebar.classList.contains(
                    "open"
                )
            ) {

                const clickedInsideSidebar =
                    sidebar.contains(
                        event.target
                    );


                const clickedOnToggle =
                    menuToggle &&
                    menuToggle.contains(
                        event.target
                    );


                if (
                    !clickedInsideSidebar &&
                    !clickedOnToggle &&
                    window.innerWidth <= 768
                ) {

                    closeMobileSidebar();
                }
            }
        }
    );


    // ==========================================
    // 22. ESCAPE KEY
    // ==========================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" ||
                event.key === "Esc"
            ) {

                // Close modal
                if (
                    profileModal &&
                    (
                        profileModal.classList.contains(
                            "open"
                        ) ||
                        profileModal.classList.contains(
                            "active"
                        ) ||
                        !profileModal.hidden
                    )
                ) {

                    closeProfileModal();
                }


                // Close dropdown
                if (
                    profileDropdown &&
                    !profileDropdown.hidden
                ) {

                    closeProfileDropdown();
                }


                // Close sidebar
                if (
                    sidebar &&
                    sidebar.classList.contains(
                        "open"
                    )
                ) {

                    closeMobileSidebar();
                }
            }
        }
    );


    // ==========================================
    // 23. CROSS-SYNC WITH SUPPLIER WORKSPACE
    // ==========================================
    function syncWithSupplierWorkspace() {
        try {
            const storeRef = window.TradeNestStore;
            const buyerId = storeRef && storeRef.getCurrentUser ? storeRef.getCurrentUser().id : "buyer-001";
            const state = storeRef ? storeRef.getStore() : { orders: [], quotations: [] };

            const orders = (state.orders || []).filter((item) => item.buyerId === buyerId);
            const quotes = (state.quotations || []).filter((item) => item.buyerId === buyerId);

            const ordersTbody = document.querySelector(".recent-orders-card .data-table tbody");
            if (ordersTbody) {
                ordersTbody.innerHTML = orders.length ? orders.slice(0, 4).map((ord) => {
                    const statusClass = String(ord.status || "").toLowerCase().replace(/[^a-z]/g, "");
                    return `
                        <tr>
                            <td><strong>#${ord.id}</strong></td>
                            <td>${ord.productName} (x${ord.quantity})</td>
                            <td>${ord.supplierName}</td>
                            <td>${storeRef ? storeRef.formatCurrency(ord.totalAmount || ord.amount || 0) : `₹${(ord.totalAmount || ord.amount || 0).toLocaleString("en-IN")}`}</td>
                            <td><span class="status-badge ${statusClass}">${ord.status}</span></td>
                        </tr>
                    `;
                }).join("") : '<tr><td colspan="5"><div class="empty-state">No orders yet.</div></td></tr>';
            }

            const quotesList = document.querySelector(".active-quotes-card .quotes-list");
            if (quotesList) {
                quotesList.innerHTML = quotes.length ? quotes.slice(0, 3).map((q) => {
                    const statusClass = String(q.status || "").toLowerCase().replace(/[^a-z]/g, "");
                    return `
                        <div class="quote-item">
                            <div class="quote-info">
                                <h3 class="quote-product">${q.productName}</h3>
                                <p class="quote-meta">Qty: ${q.quantity} ${q.unit || "Units"} • Supplier: <strong>${q.supplierName}</strong></p>
                            </div>
                            <div class="quote-details">
                                <span class="quote-amount">${storeRef ? storeRef.formatCurrency(q.totalAmount || q.unitPrice * (q.quantity || 1) || 0) : `₹${((q.totalAmount || q.unitPrice * (q.quantity || 1) || 0)).toLocaleString("en-IN")}`}</span>
                                <span class="status-badge ${statusClass}">${q.status}</span>
                            </div>
                        </div>
                    `;
                }).join("") : '<div class="empty-state">No active quotes right now.</div>';
            }
        } catch (e) {
            console.warn("Cross-sync with supplier workspace error:", e);
        }
    }

    // ==========================================
    // 24. INITIALIZATION
    // ==========================================

    const initialProfile =
        loadBuyerProfile();

    updateProfileUI(
        initialProfile
    );

    updateDashboardStats();

    syncWithSupplierWorkspace();

});