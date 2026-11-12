document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const commentsInput = document.getElementById("comments");
    
    const nameError = document.getElementById("name-error");
    const emailError = document.getElementById("email-error");
    const commentsError = document.getElementById("comments-error");
    const commentsInfo = document.getElementById("comments-info");
    const errorSummary = document.getElementById("form-error-summary");
    const formErrorsInput = document.getElementById("form-errors-input");

    const fields = [nameInput, emailInput, commentsInput];
    let form_errors = [];

    // Specific guidance using Constraint Validation API
    function getCustomMessage(input) {
        input.setCustomValidity(""); // Clear previous state

        if (input.validity.valueMissing) {
            if (input === nameInput) return "Please enter your name.";
            if (input === emailInput) return "Please enter your email address.";
            if (input === commentsInput) return "Please enter your comments or message.";
        }
        if (input.validity.typeMismatch && input === emailInput) {
            return "Please enter a valid email address (e.g., name@example.com).";
        }
        if (input.validity.tooShort) {
            if (input === nameInput) return "Name must be at least 1 character.";
            if (input === commentsInput) return `Comments must be at least ${input.minLength} characters long (currently ${input.value.length}).`;
        }
        if (input.validity.tooLong) {
            return "Input exceeds the maximum allowed length.";
        }
        return "";
    }

    // Validate individual field
    function validateField(input, errorDiv) {
        const message = getCustomMessage(input);
        input.setCustomValidity(message);

        if (!input.validity.valid) {
            errorDiv.textContent = message;
            input.classList.add("invalid");
            input.classList.remove("valid");
        } else {
            errorDiv.textContent = "";
            input.classList.remove("invalid");
            input.classList.add("valid");
        }
        return input.validity.valid;
    }

    // Dynamic character counter and warning thresholds
    function updateCharCounter() {
        const maxLength = parseInt(commentsInput.getAttribute("maxlength"), 10) || 1000;
        const currentLength = commentsInput.value.length;
        const remaining = maxLength - currentLength;

        let infoText = `${remaining} characters remaining.`;
        commentsInfo.classList.remove("warning", "limit");

        if (remaining === 0) {
            infoText = "Character limit reached (1000/1000).";
            commentsInfo.classList.add("limit");
        } else if (remaining <= 50) {
            infoText = `Warning: only ${remaining} characters remaining.`;
            commentsInfo.classList.add("warning");
        }

        commentsInfo.textContent = infoText;
    }

    // Live input and blur event listeners
    fields.forEach(input => {
        const errorDiv = document.getElementById(`${input.id}-error`);
        
        input.addEventListener("input", () => {
            if (input === commentsInput) {
                updateCharCounter();
            }
            if (input.classList.contains("invalid") || input.value.length > 0) {
                validateField(input, errorDiv);
            }
        });

        input.addEventListener("blur", () => {
            validateField(input, errorDiv);
        });
    });

    // Capture failed submission validation events
    form.addEventListener("invalid", (event) => {
        event.preventDefault();
        const target = event.target;
        const errorDiv = document.getElementById(`${target.id}-error`);
        const message = getCustomMessage(target);
        
        target.setCustomValidity(message);
        errorDiv.textContent = message;
        target.classList.add("invalid");

        // Record error in form_errors array (without sensitive user info)
        form_errors.push({
            field: target.name,
            message: message
        });
    }, true);

    // Form submission handler
    form.addEventListener("submit", (event) => {
        form_errors = []; // Reset error history batch for this attempt
        let formIsValid = true;

        fields.forEach(input => {
            const errorDiv = document.getElementById(`${input.id}-error`);
            const isValid = validateField(input, errorDiv);
            if (!isValid) {
                formIsValid = false;
            }
        });

        if (!formIsValid) {
            event.preventDefault();
            errorSummary.textContent = "Please correct the highlighted errors before submitting.";
            
            const firstInvalid = fields.find(input => !input.validity.valid);
            if (firstInvalid) {
                firstInvalid.focus();
            }
        } else {
            errorSummary.textContent = "";
            // Serialize error history array into hidden field right before successful submission
            formErrorsInput.value = JSON.stringify(form_errors);
        }
    });

    // Initialize character counter state on page load
    updateCharCounter();
});
