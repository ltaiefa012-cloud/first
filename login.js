// ==================================
// WAIT FOR PAGE TO LOAD
// ==================================
document.addEventListener("DOMContentLoaded", () => {

    // ==================================
    // ELEMENTS
    // ==================================
    const signInContainer = document.getElementById("sign-in-container");
    const signUpContainer = document.getElementById("sign-up-container");

    const signUpBtn = document.getElementById("sign-up");
    const signInBtn = document.getElementById("sign-in");

    // ==================================
    // SIGN IN FORM
    // ==================================
    const loginForm = document.getElementById("login-in");
    if (loginForm) { // check if exists
        const loginEmail = loginForm.querySelector("#email");
        const loginPassword = loginForm.querySelector("#password");
        const loginEye = loginForm.querySelector(".login__eye");
        const errorMsg = document.getElementById("error-msg");

        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const storedEmail = localStorage.getItem("email");
            const storedPassword = localStorage.getItem("password");

            if (loginEmail.value.trim() === storedEmail && loginPassword.value.trim() === storedPassword) {
                window.location.href = "index.html"; // redirect on successful login
            } else {
                errorMsg.textContent = "Invalid email or password";
                errorMsg.style.color = "red";
                errorMsg.style.textAlign = "center";
            }
        });

        // Show / Hide password (SIGN IN)
        loginEye.addEventListener("click", () => {
            togglePassword(loginPassword, loginEye);
        });
    }

    // ==================================
    // SIGN UP FORM
    // ==================================
    const signUpForm = document.getElementById("login-up");
    if (signUpForm) { // check if exists
        const signUpInputs = signUpForm.querySelectorAll("input");
        const signUpUsername = signUpInputs[0]; // username
        const signUpEmail = signUpInputs[1];
        const signUpPassword = signUpInputs[2];
        const signUpEye = signUpForm.querySelector(".login__eye");

        signUpForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const username = signUpUsername.value.trim();
            const email = signUpEmail.value.trim();
            const password = signUpPassword.value.trim();

            if (username && email && password) {
                // Save in localStorage
                localStorage.setItem("username", username);
                localStorage.setItem("email", email);
                localStorage.setItem("password", password);

                // Redirect to welcome page
                window.location.href = "welcome.html";
            } else {
                alert("Please fill all fields");
            }
        });

        // Show / Hide password (SIGN UP)
        signUpEye.addEventListener("click", () => {
            togglePassword(signUpPassword, signUpEye);
        });
    }

    // ==================================
    // SHOW / HIDE SIGN IN & SIGN UP
    // ==================================
    if (signUpBtn) {
        signUpBtn.addEventListener("click", (e) => {
            e.preventDefault();
            signInContainer.classList.add("none");
            signUpContainer.classList.remove("none");
        });
    }

    if (signInBtn) {
        signInBtn.addEventListener("click", (e) => {
            e.preventDefault();
            signUpContainer.classList.add("none");
            signInContainer.classList.remove("none");
        });
    }

    // ==================================
    // PASSWORD TOGGLE FUNCTION (REUSABLE)
    // ==================================
    function togglePassword(input, eyeIcon) {
        if (input.type === "password") {
            input.type = "text";
            eyeIcon.classList.replace("ri-eye-line", "ri-eye-off-line");
        } else {
            input.type = "password";
            eyeIcon.classList.replace("ri-eye-off-line", "ri-eye-line");
        }
    }

    // ==================================
    // WELCOME PAGE USERNAME DISPLAY
    // ==================================
    const welcomeH1 = document.querySelector(".welcome-box h1");
    if (welcomeH1) {
        const username = localStorage.getItem("username") || "User";
        welcomeH1.textContent = `Welcome, ${username}!`;
    }

});


