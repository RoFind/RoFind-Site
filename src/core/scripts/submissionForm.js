// Sumission Form ahhhh
import * as RobloxApi from './api.js'

const popup = document.querySelector(".popup");
const form = popup.querySelector(".submission-form");

const gameSubmissionBtn = document.querySelector(".game_submission")

const ui = {
    iconPreview: form.querySelector("#submissions_game_preview"),
    gameName: form.querySelector("#submissions_game_name"),
    placeId: form.querySelector("input[type='number']"),
    checkPlace: form.querySelector("#checkplace"),
    verifyUser: form.querySelector("#sign_in_roblox"),
    openPopup: document.querySelector(".game_submission"),
    submitBtn: form.querySelector("#game_submission_submit"),
    cancelBtn: form.querySelector("#game_submission_cancel"),
};

async function checkPlaceId() {
    try {
        const place = await RobloxApi.getUniverseId(ui.placeid.value);
        const gameDetails = await RobloxApi.fetchGameDetails(place);

        submission_icon_preview.src = await RobloxApi.fetchThumbnail(place);
        submission_game_name.innerHTML = gameDetails.name;

        placeid.style.removeProperty('border-color');
        checkplace.disabled = true;
        checkplace.style.color = "grey";
    } catch (err) {
        console.error("Game Submission Error ->", placeid.value, err);
        placeid.style = "border-color: red;";
    }
}

// checkplace.addEventListener("click", async (e) => {
//     e.preventDefault();
// });


function openSumissionForm() {
    popup.style.display = "block";
}

// open_popup.addEventListener("click", () => {
// });

function verifyUser() {
    // TODO: Verify
    console.log("Verify User");
}

function submitSubmission() {
    // TODO: Submission
    console.log("Submission");
}

function cancelSubmission() {
    console.log(new Date().toLocaleString(), "User has cancelled submission.");
    ui.iconPreview.src = "https://placehold.co/150?text=Game+Icon";
    ui.gameName.textContent = "";
    ui.placeId.value = "";
    ui.checkPlace.disabled = false;
    ui.checkPlace.style.color = "white";
    popup.style.display = "none";
}

gameSubmissionBtn.addEventListener("click", () => {
    openSumissionForm()
});

ui.cancelBtn.addEventListener("click", () => {
    cancelSubmission()
});

ui.checkPlace.addEventListener("click", () => {
    checkPlaceId()
});