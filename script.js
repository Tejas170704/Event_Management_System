// Data State
let events = JSON.parse(localStorage.getItem("eventsManagerData")) || [];

// DOM Elements
const form = document.getElementById("event-form");
const listContainer = document.getElementById("event-list");
const toastContainer = document.getElementById("toast-container");
const imageInput = document.getElementById("eventImage");
const imagePreview = document.getElementById("imagePreview");

let uploadedImageBase64 = null;

// Handle Image Upload
imageInput.addEventListener("change", function (e) {
    const file = e.target.files[0];

    if (file) {
        // Limit size to 2MB
        if (file.size > 2 * 1024 * 1024) {
            showToast("Image too large. Please select a file under 2MB.");
            this.value = "";
            imagePreview.style.display = "none";
            imagePreview.src = "";
            uploadedImageBase64 = null;
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            uploadedImageBase64 = event.target.result;
            imagePreview.src = uploadedImageBase64;
            imagePreview.style.display = "block";
        };
        reader.readAsDataURL(file);
    } else {
        uploadedImageBase64 = null;
        imagePreview.style.display = "none";
        imagePreview.src = "";
    }
});

// Show toast message
function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Escape HTML to prevent XSS
function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

// Save to localStorage
function saveData() {
    localStorage.setItem("eventsManagerData", JSON.stringify(events));
}

// Render events
function renderEvents() {
    listContainer.innerHTML = "";

    if (events.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <svg style="width:48px;height:48px;margin-bottom:10px;color:#9ca3af;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p>No events found. Add your first event to get started!</p>
            </div>
        `;
        return;
    }

    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedEvents.forEach((event) => {
        const dateObj = new Date(event.date);
        const formattedDate = dateObj.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });

        const eventEl = document.createElement("div");
        eventEl.className = "event-item";

        const imageHtml = event.image
            ? `<img src="${event.image}" alt="Event Image" class="event-image">`
            : "";

        eventEl.innerHTML = `
            ${imageHtml}
            <div class="event-info">
                <div class="event-header">
                    <h3>${escapeHTML(event.name)}</h3>
                    <button class="delete-btn" onclick="deleteEvent('${event.id}')">Delete</button>
                </div>
                <div class="event-meta">
                    <span>📅 ${formattedDate}</span>
                    <span>📍 ${escapeHTML(event.location)}</span>
                </div>
                ${event.description ? `<p class="event-desc">${escapeHTML(event.description)}</p>` : ""}
            </div>
        `;

        listContainer.appendChild(eventEl);
    });
}

// Form submit
form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("eventName").value.trim();
    const date = document.getElementById("eventDate").value;
    const location = document.getElementById("eventLocation").value.trim();
    const description = document.getElementById("eventDesc").value.trim();

    if (!name || !date || !location) {
        showToast("Please fill in all required fields.");
        return;
    }

    const newEvent = {
        id: generateId(),
        name,
        date,
        location,
        description,
        image: uploadedImageBase64,
    };

    events.push(newEvent);
    saveData();
    renderEvents();
    form.reset();

    uploadedImageBase64 = null;
    imagePreview.style.display = "none";
    imagePreview.src = "";

    showToast("Event added successfully!");
});

// Delete event
window.deleteEvent = function (id) {
    events = events.filter((event) => event.id !== id);
    saveData();
    renderEvents();
    showToast("Event deleted.");
};

// Initial render
renderEvents();