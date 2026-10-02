
document.querySelectorAll(".contact-copy").forEach(button => {
    button.addEventListener("click", async () => {
        const email = button.dataset.email;
        const value = button.querySelector(".contact-value");

        await navigator.clipboard.writeText(email);

        const original = value.textContent;
        value.textContent = "Copied";

        setTimeout(() => {
            value.textContent = original;
        }, 1500);
    });
});
