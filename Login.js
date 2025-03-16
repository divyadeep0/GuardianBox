let generatedOTP = "";
async function sendOtp() {
    document.getElementById('otp').style.display = 'block';
    document.getElementById('verifyOtpBtn').style.display = 'block';
    document.getElementById('sendOtpBtn').style.display = 'none';
    document.querySelector('.change-phone-btn').style.display = 'block';
    const emailInput = document.getElementById("email");
    const usernameInput = document.getElementById("username");

    if (!emailInput || !usernameInput) {
        alert("Error: Email or Username field not found.");
        return;
    }

    const email = emailInput.value;
    const username = usernameInput.value;
    if (!email || !username) {
        alert("Please enter both username and email.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/send-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();
        if (data.success) {
            document.getElementById("otpField").style.display = "block";
            document.getElementById("verifyOtpBtn").style.display = "block";
            document.getElementById("sendOtpBtn").style.display = "none";
            document.querySelector(".change-phone-btn").style.display = "block";
            alert("OTP sent to your email!");
        } else {
            alert("Failed to send OTP. Try again.");
        }
    } catch (error) {
        console.error("Error sending OTP:", error);
    }
}
async function verifyOtp() {
    const email = document.getElementById("email").value;
    const otp = document.getElementById("otp").value;

    if (!email || !otp) {
        alert("Please enter both email and OTP.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp }),
        });

        const result = await response.json();

        if (result.success) {
            alert("Login Successful!");
            window.location.href = "SafetyGaurd.html"; 
        } else {
            alert("Invalid OTP! Please try again.");
        }
    } catch (error) {
        console.error("Error verifying OTP:", error);
        alert("An error occurred. Please try again later.");
    }
}


function resetForm() {
    document.getElementById("otpField").style.display = "none";
    document.getElementById("verifyOtpBtn").style.display = "none";
    document.getElementById("sendOtpBtn").style.display = "block";
    document.querySelector(".change-phone-btn").style.display = "none";
    document.getElementById("loginForm").reset();
}
console.log("Stored OTPs:", otpStorage);


