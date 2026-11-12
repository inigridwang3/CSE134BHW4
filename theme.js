// Apply saved theme immediately before paint to prevent flashing
(function() {
    try {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            document.documentElement.setAttribute("data-theme", savedTheme);
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            document.documentElement.setAttribute("data-theme", "dark");
        }
    } catch (error) {
        console.warn("localStorage read failed:", error);
    }
})();

document.addEventListener("DOMContentLoaded", () => {
    // Enable JS indicator class on HTML root
    document.documentElement.classList.add("js");

    const headerNav = document.querySelector("header nav ul");
    if (!headerNav) return;

    // Create and insert the theme toggle button dynamically so it stays hidden if JS is disabled
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.className = "js-theme-toggle";
    button.setAttribute("type", "button");
    
    function updateButtonLabel() {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        button.textContent = currentTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
        button.setAttribute("aria-label", `Switch to ${currentTheme === "dark" ? "light" : "dark"} theme`);
    }

    updateButtonLabel();

    button.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";

        const applyThemeChange = () => {
            document.documentElement.setAttribute("data-theme", newTheme);
            updateButtonLabel();
            try {
                localStorage.setItem("theme", newTheme);
            } catch (error) {
                console.warn("localStorage write failed (storage blocked):", error);
            }
        };

        // Use View Transition API if supported and user does not prefer reduced motion
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!document.startViewTransition || prefersReducedMotion) {
            applyThemeChange();
        } else {
            document.startViewTransition(() => {
                applyThemeChange();
            });
        }
    });

    li.appendChild(button);
    headerNav.appendChild(li);
});
