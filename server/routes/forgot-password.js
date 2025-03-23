document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("forgotPasswordForm");
    const emailInput = document.getElementById("email");
    const otpInput = document.getElementById("otp");
    const emailSection = document.getElementById("emailSection");
    const otpSection = document.getElementById("otpSection");
    const submitBtn = document.getElementById("submitBtn");

    let currentStep = "email"; // "email" or "otp"
    let userEmail = "";

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (currentStep === "email") {
            userEmail = emailInput.value.trim();
            if (!userEmail) {
                alert("Please enter your email.");
                return;
            }

            // Send request to backend to generate and send OTP
            const response = await fetch("/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userEmail }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("OTP sent to your email. Please check your inbox.");

                // Switch to OTP entry state
                emailSection.style.display = "none";
                otpSection.style.display = "block";
                submitBtn.textContent = "Verify OTP";
                currentStep = "otp";
            } else {
                alert(data.message || "Something went wrong.");
            }
        } else if (currentStep === "otp") {
            const otp = otpInput.value.trim();
            if (!otp) {
                alert("Please enter the OTP.");
                return;
            }

            // Send OTP verification request
            const response = await fetch("/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userEmail, otp }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("OTP verified successfully! Redirecting...");
                window.location.href = "/profile"; // Redirect to profile
            } else {
                alert(data.message || "Invalid OTP.");
            }
        }
    });
});
