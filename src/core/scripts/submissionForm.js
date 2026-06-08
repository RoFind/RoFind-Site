import * as RobloxApi from './api.js';

const popup = document.querySelector(".popup");
const gameSubmissionBtn = document.querySelector(".game_submission");

const form = popup?.querySelector(".submission-form");

const ui = {
    iconPreview: form?.querySelector("#submissions_game_preview"),
    gameName: form?.querySelector("#submissions_game_name"),
    placeId: form?.querySelector("input[type='number']"),
    checkPlace: form?.querySelector("#checkplace"),
    verifyUser: form?.querySelector("#sign_in_roblox"),
    submitBtn: form?.querySelector("#game_submission_submit"),
    cancelBtn: form?.querySelector("#game_submission_cancel"),
};

async function checkPlaceId() {
    try {
        const universeId = await RobloxApi.getUniverseId(ui.placeId.value);
        const gameDetails = await RobloxApi.fetchGameDetails(universeId);
        const thumbnail = await RobloxApi.fetchThumbnail(universeId);

        ui.iconPreview.src = thumbnail;
        ui.gameName.textContent = gameDetails.name;
        ui.placeId.style.removeProperty('border-color');
        ui.checkPlace.disabled = true;
        ui.checkPlace.style.color = "grey";
    } catch (err) {
        console.error("Game Submission Error ->", ui.placeId.value, err);
        ui.placeId.style.borderColor = "red";
    }
}

function openSubmissionForm() {
    popup.style.display = "block";
}

function verifyUser() {
    console.log("Verify User");
}

function submitSubmission() {
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

gameSubmissionBtn?.addEventListener("click", openSubmissionForm);
ui.cancelBtn?.addEventListener("click", cancelSubmission);
ui.checkPlace?.addEventListener("click", checkPlaceId);
ui.verifyUser?.addEventListener("click", verifyUser);
ui.submitBtn?.addEventListener("click", submitSubmission);