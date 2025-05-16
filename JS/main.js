document.addEventListener("DOMContentLoaded", function() {
    // CHECK IF LOCALSTORAGE IS SUPPORTED
    if (typeof(Storage) !== "undefined") {
        let isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

        // Change the login link based on the user's login status
        const loginLink = document.getElementById("loginLink");
        if (loginLink) {
            loginLink.textContent = isLoggedIn ? "Profile" : "Log In";
            loginLink.href = isLoggedIn ? "profile.html" : "login.html"; 
        }

        // PLAY BUTTON HANDLER (ONLY IF ON MAIN PAGE)
        const playButton = document.getElementById("playButton");
        if (playButton) {
            playButton.addEventListener("click", function() {
                window.location.href = isLoggedIn ? "game.html" : "login.html";
            });
        }

        // CHECK IF ALREADY LOGGED IN (FOR OTHER PAGES)
        if (isLoggedIn) {
            // If on profile page, populate user data
            if (window.location.pathname.includes("profile.html")) {
                const username = localStorage.getItem("username");
                const users = JSON.parse(localStorage.getItem("users")) || [];
                const user = users.find(user => user.username === username);

                if (user) {
                    // Display user information
                    document.getElementById("displayName").textContent = user.name;
                    document.getElementById("displayUsername").textContent = user.username;

                    // Calculate user's rank based on topScore
                    const sortedUsers = users.filter(u => u.topScore > 0).sort((a, b) => b.topScore - a.topScore);
                    const userRank = sortedUsers.findIndex(u => u.username === username) + 1; // Adding 1 for 1-based index

                    // If the user does not have a score, set rank to 'Unranked'
                    document.getElementById("displayLevel").textContent = user.topScore > 0 ? userRank : "Unranked";
                }
            }
        } else {
            // If not logged in, redirect to login page
            if (window.location.pathname.includes("profile.html")) {
                window.location.href = "login.html";
            }
        }
    } else {
        console.warn('LocalStorage is not supported by this browser.');
    }

    const feedback = document.querySelector("#feedback");

    // Helper function to clear input fields
    function clearInputs(form) {
        form.querySelectorAll("input").forEach(input => input.value = "");
    }

    // LOGIN FORM EVENT LISTENER
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const enteredUsername = document.getElementById("loginUsername").value;
            const enteredPassword = document.getElementById("loginPassword").value;
            feedback.innerHTML = "";

            const users = JSON.parse(localStorage.getItem("users")) || [];
            const user = users.find(user => user.username === enteredUsername);

            if (user) {
                if (user.password === enteredPassword) {
                    feedback.innerHTML = "You are now logged in!";
                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem("username", enteredUsername);

                    // Add delay before redirecting
                    setTimeout(function() {
                        window.location.href = "profile.html";
                    }, 2000);
                } else {
                    feedback.innerHTML = "Incorrect password. Please try again.";
                }
            } else {
                feedback.innerHTML = "Username not found. Please register or try again.";
            }

            clearInputs(loginForm);
        });
    }

    // REGISTRATION FORM EVENT LISTENER
    const registrationForm = document.getElementById("registrationForm");
    if (registrationForm) {
        registrationForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            const usernameRegEx = /^[a-zA-Z0-9_]+$/; //REGEX VALIDATION

            if (!usernameRegEx.test(username)) {
                feedback.innerHTML = "Username can only contain letters, numbers, and underscores. No special characters allowed.";
                return;
            }

            const newUser = {
                name: name,
                email: email,
                username: username,
                password: password,
                topScore: 0,
                level: 0 // Initialise level to 0
            };

            let users = JSON.parse(localStorage.getItem("users")) || [];
            const usernameExists = users.some(user => user.username === username);
            if (usernameExists) {
                feedback.innerHTML = "Username already exists. Please choose a different one.";
                return;
            }

            users.push(newUser);
            localStorage.setItem("users", JSON.stringify(users));
            feedback.innerHTML = "Registration successful!";

            setTimeout(function() {
                window.location.href = 'login.html';
            }, 2000);
        });
    }

    // LOGIN PASSWORD VISIBILITY TOGGLE
    function setupPasswordVisibilityToggle(toggleElementId, passwordFieldId) {
        const showPasswordToggle = document.querySelector(`#${toggleElementId}`);
        const passwordField = document.querySelector(`#${passwordFieldId}`);
        if (showPasswordToggle && passwordField) {
            showPasswordToggle.addEventListener("click", function() {
                this.classList.toggle("fa-eye");
                this.classList.toggle("fa-eye-slash", !this.classList.contains("fa-eye"));
                const type = passwordField.getAttribute("type") === "password" ? "text" : "password";
                passwordField.setAttribute("type", type);
            });
        }
    }

    // Set up password visibility toggles for all forms
    setupPasswordVisibilityToggle("show-password-login", "loginPassword");
    setupPasswordVisibilityToggle("show-password-register", "password");
    setupPasswordVisibilityToggle("show-password-new", "newPassword");
    setupPasswordVisibilityToggle("show-password-confirm", "confirmPassword");

    // FUNCTION TO UPDATE USER SCORE
    function updateScore(username, newScore) {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const user = users.find(user => user.username === username);
        if (user) {
            if (newScore > user.topScore) {
                user.topScore = newScore; // Update topScore if newScore is higher
                localStorage.setItem("users", JSON.stringify(users));
            }
        }
    }

    // LOGOUT BUTTON FUNCTIONALITY
    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", function() {
            localStorage.setItem("isLoggedIn", "false");
            localStorage.removeItem("username");
            window.location.href = "login.html"; // Redirect to login page
        });
    }

    // GO HOME BUTTON FUNCTIONALITY
    const goHomeButton = document.getElementById("goHome");
    if (goHomeButton) {
        goHomeButton.addEventListener("click", function() {
            window.location.href = "index.html"; // Redirect to home page
        });
    }

    // GO BACK BUTTON FUNCTIONALITY
    const goBackButton = document.getElementById("goback-btn");
    if (goBackButton) {
        goBackButton.addEventListener("click", function() {
            window.history.back(); // This will take the user to the previous page
        });
    }

    // FORGOT PASSWORD EVENT LISTENER
    const resetPasswordForm = document.getElementById("reset-password-form");
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener("submit", function(event) {
            event.preventDefault(); // Prevent default form submission
            const resetUsername = document.getElementById("resetUsername").value;
            const newPassword = document.getElementById("newPassword").value;
            const confirmPassword = document.getElementById("confirmPassword").value;
            const feedback = document.querySelector("#feedback"); // Ensure feedback is captured

            // Clear previous feedback
            feedback.textContent = "";

            if (newPassword !== confirmPassword) {
                feedback.textContent = "Passwords do not match. Please try again.";
                feedback.style.color = "red";
                return;
            }

            // Update password in localStorage
            const users = JSON.parse(localStorage.getItem("users")) || [];
            const userIndex = users.findIndex(user => user.username === resetUsername);

            if (userIndex !== -1) {
                // User found, update the password
                users[userIndex].password = newPassword;
                localStorage.setItem("users", JSON.stringify(users));
                feedback.textContent = "Password successfully reset. You can now log in.";
                feedback.style.color = "green";

                // Redirect to login page after a short delay
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2000);
            } else {
                feedback.textContent = "Username not found. Please check and try again.";
                feedback.style.color = "red";
            }
        });
    }

    // FUNCTION TO UPDATE THE LEADERBOARD
    function updateLeaderboard() {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        
        // Sort users by topScore in descending order and filter out those with topScore of 0
        const filteredUsers = users.filter(user => user.topScore > 0).sort((a, b) => b.topScore - a.topScore);
        
        const leaderboardTableBody = document.querySelector("#leaderboardTable tbody");
        leaderboardTableBody.innerHTML = ""; // Clear existing leaderboard

        // Check if there are any users to display
        if (filteredUsers.length === 0) {
            const noScoreRow = document.createElement("tr");
            noScoreRow.innerHTML = "<td colspan='3'>No scores available.</td>";
            leaderboardTableBody.appendChild(noScoreRow);
        } else {
            filteredUsers.forEach((user, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${user.username}</td>
                    <td>${user.topScore}</td>
                `;
                leaderboardTableBody.appendChild(row);
            });
        }
    }

    // CALL THE FUNCTION TO UPDATE LEADERBOARD WHEN PAGE LOADS
    updateLeaderboard();
});
