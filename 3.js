/**
 * PassPulse — Password Generator & Checker
 * Generate secure passwords and analyze password strength.
 */

// ── Generator elements ──
const lengthSlider = document.querySelector(".pass-length input"),
options = document.querySelectorAll(".option input"),
copyIcon = document.querySelector(".copy-btn"),
passwordInput = document.querySelector(".generator-section .input-box input"),
passIndicator = document.querySelector(".gen-indicator"),
generateBtn = document.querySelector(".generate-btn"),
genStrengthText = document.querySelector(".gen-strength-text");

// ── Checker elements ──
const checkPasswordInput = document.getElementById("check-password"),
toggleVisBtn = document.querySelector(".toggle-vis"),
checkIndicator = document.querySelector(".check-indicator"),
checkStrengthText = document.querySelector(".check-strength-text"),
alertBox = document.querySelector(".alert-box"),
alertIcon = document.querySelector(".alert-icon"),
alertMessage = document.querySelector(".alert-message"),
checkTipsList = document.querySelector(".check-tips"),
checkBtn = document.querySelector(".check-btn");

const characters = {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    symbols: "^!$%&|[](){}:;.,*+-#@<>~"
};

const COMMON_PASSWORDS = ["password", "123456", "12345678", "qwerty", "abc123", "letmein", "welcome", "admin", "iloveyou"];

const ALERTS = {
    weak: {
        icon: "warning",
        title: "Weak password! Your account is at high risk.",
        desc: "This password is easy to guess. Use a longer mix of letters, numbers, and symbols."
    },
    medium: {
        icon: "error_outline",
        title: "Medium strength — could be better.",
        desc: "Add more length and character variety to make it harder to crack."
    },
    strong: {
        icon: "verified",
        title: "Strong password! Well done.",
        desc: "This password has good length and complexity. Keep it private and unique."
    },
    empty: {
        icon: "info",
        title: "Type a password above to see strength and tips.",
        desc: ""
    }
};

// ── Password Generator ──
const generatePassword = () => {
    let staticPassword = "",
    randomPassword = "",
    excludeDuplicate = false,
    passLength = lengthSlider.value;

    options.forEach(option => {
        if (option.checked) {
            if (option.id !== "exc-duplicate" && option.id !== "spaces") {
                staticPassword += characters[option.id];
            } else if (option.id === "spaces") {
                staticPassword += `  ${staticPassword}  `;
            } else {
                excludeDuplicate = true;
            }
        }
    });

    for (let i = 0; i < passLength; i++) {
        let randomChar = staticPassword[Math.floor(Math.random() * staticPassword.length)];
        if (excludeDuplicate) {
            !randomPassword.includes(randomChar) || randomChar == " " ? randomPassword += randomChar : i--;
        } else {
            randomPassword += randomChar;
        }
    }
    passwordInput.value = randomPassword;
};

const upadatePassIndicator = () => {
    const level = lengthSlider.value <= 8 ? "weak" : lengthSlider.value <= 16 ? "medium" : "strong";
    passIndicator.id = level;
    genStrengthText.textContent = level;
    genStrengthText.className = "strength-text gen-strength-text " + level;
};

const updateSlider = () => {
    document.querySelector(".pass-length span").innerText = lengthSlider.value;
    generatePassword();
    upadatePassIndicator();
};

const copyPassword = () => {
    if (!passwordInput.value) return;
    navigator.clipboard.writeText(passwordInput.value);
    copyIcon.innerText = "check";
    copyIcon.style.color = "#34d399";
    setTimeout(() => {
        copyIcon.innerText = "content_copy";
        copyIcon.style.color = "";
    }, 1500);
};

// ── Password Checker ──
const analyzePassword = (password) => {
    const tips = [
        { label: "At least 8 characters", pass: password.length >= 8 },
        { label: "12+ characters (recommended)", pass: password.length >= 12 },
        { label: "Lowercase letter (a-z)", pass: /[a-z]/.test(password) },
        { label: "Uppercase letter (A-Z)", pass: /[A-Z]/.test(password) },
        { label: "Number (0-9)", pass: /[0-9]/.test(password) },
        { label: "Special symbol (!@#$…)", pass: /[^a-zA-Z0-9\s]/.test(password) },
        { label: "No common words (password, qwerty…)", pass: !COMMON_PASSWORDS.some(w => password.toLowerCase().includes(w)) },
        { label: "No repeated characters only", pass: !/^(.)\1{3,}$/.test(password) }
    ];

    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 2;
    if (password.length >= 16) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 2;
    if (COMMON_PASSWORDS.some(w => password.toLowerCase().includes(w))) score -= 3;
    if (/^(.)\1+$/.test(password)) score = 0;

    let level = "weak";
    if (score >= 8) level = "strong";
    else if (score >= 5) level = "medium";

    return { level, score, tips };
};

const setBodyBackground = (level) => {
    document.body.classList.remove("bg-weak", "bg-medium", "bg-strong", "bg-neutral");
    if (!level || level === "empty") {
        document.body.classList.add("bg-neutral");
    } else {
        document.body.classList.add("bg-" + level);
    }
};

const renderCheckerUI = (password) => {
    if (!password) {
        checkIndicator.id = "";
        checkStrengthText.textContent = "—";
        checkStrengthText.className = "strength-text check-strength-text";
        alertBox.className = "alert-box neutral";
        alertIcon.textContent = ALERTS.empty.icon;
        alertMessage.textContent = ALERTS.empty.title;
        checkTipsList.innerHTML = "";
        setBodyBackground("empty");
        return;
    }

    const { level, tips } = analyzePassword(password);
    const alert = ALERTS[level];

    checkIndicator.id = level;
    checkStrengthText.textContent = level;
    checkStrengthText.className = "strength-text check-strength-text " + level;

    alertBox.className = "alert-box " + level;
    alertIcon.textContent = alert.icon;
    alertMessage.innerHTML = `<strong>${alert.title}</strong>${alert.desc ? "<br>" + alert.desc : ""}`;

    checkTipsList.innerHTML = tips.map(tip => `
        <li class="${tip.pass ? "pass" : "fail"}">
            <span class="material-symbols-rounded">${tip.pass ? "check_circle" : "cancel"}</span>
            ${tip.label}
        </li>
    `).join("");

    setBodyBackground(level);
};

const checkPassword = () => {
    renderCheckerUI(checkPasswordInput.value.trim());
};

const toggleVisibility = () => {
    const isHidden = checkPasswordInput.type === "password";
    checkPasswordInput.type = isHidden ? "text" : "password";
    toggleVisBtn.textContent = isHidden ? "visibility_off" : "visibility";
};

// ── Event listeners ──
copyIcon.addEventListener("click", copyPassword);
lengthSlider.addEventListener("input", updateSlider);
generateBtn.addEventListener("click", generatePassword);
checkBtn.addEventListener("click", checkPassword);
toggleVisBtn.addEventListener("click", toggleVisibility);

checkPasswordInput.addEventListener("input", () => {
    if (checkPasswordInput.value.trim()) {
        checkPassword();
    } else {
        renderCheckerUI("");
    }
});

checkPasswordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkPassword();
});

// Init
updateSlider();
setBodyBackground("empty");
