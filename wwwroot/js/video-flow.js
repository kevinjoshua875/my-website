(function () {

    let video, choices, backBtn, screenFlash;
    let selectedAnswer = null;
    let mainVideoPlayed = false;
    let undoAvailable = false;

    let config = {};

    // Add click sound
    const clickSound = new Audio("/sounds/click.mp3"); // <-- put your click sound file here
    clickSound.volume = 0.5; // optional: adjust volume

    window.initVideo = function (options) {
        config = options;

        video = document.getElementById("lessonVideo");
        choices = document.getElementById("choices");
        backBtn = document.getElementById("backBtn");
        screenFlash = document.getElementById("screenFlash");

        playMainVideo();

        // Unmute on first interaction
        document.addEventListener("click", () => {
            video.muted = false;
        }, { once: true });

        // Show choices 5 seconds before video ends
        video.addEventListener("timeupdate", onTimeUpdate);

        // Handle video end
        video.addEventListener("ended", onVideoEnded);

        // Play click sound on all buttons
        const allButtons = document.querySelectorAll("button, .choice-btn");
        allButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                clickSound.currentTime = 0; // rewind for quick successive clicks
                clickSound.play().catch(() => { }); // ignore if blocked
            });
        });
    };

    function onTimeUpdate() {
        if (mainVideoPlayed || selectedAnswer !== null) return;

        if (video.duration && (video.duration - video.currentTime <= 5)) {
            choices.style.display = "block";
            mainVideoPlayed = true;
        }
    }

    function onVideoEnded() {
        if ((selectedAnswer === true || selectedAnswer === false) && config.nextUrl) {
            window.location.href = config.nextUrl;
        }
    }

    window.selectAnswer = function (isCorrect) {
        if (selectedAnswer !== null) return;

        selectedAnswer = isCorrect;

        const buttons = choices.querySelectorAll(".choice-btn");
        buttons.forEach(btn => btn.disabled = true);

        flashScreen(isCorrect ? "correct" : "wrong");

        undoAvailable = true;
        backBtn.innerHTML = "↩ UNDO";

        setTimeout(() => {
            choices.style.display = "none";

            video.src = isCorrect ? config.correctVideo : config.wrongVideo;
            video.currentTime = 0;
            video.play();

        }, 700);
    };

    function flashScreen(type) {
        if (!screenFlash) return;

        screenFlash.className = `screen-flash ${type} show`;

        setTimeout(() => {
            screenFlash.classList.remove("show", "correct", "wrong");
        }, 400);
    }

    window.handleBack = function () {
        if (undoAvailable) {
            resetToMain();
            return;
        }
        history.back();
    };

    function playMainVideo() {
        mainVideoPlayed = false;
        selectedAnswer = null;

        video.src = config.mainVideo;
        video.currentTime = 0;
        video.play().catch(() => { });
    }

    function resetToMain() {
        selectedAnswer = null;
        mainVideoPlayed = false;
        undoAvailable = false;

        backBtn.innerHTML = "⬅ BACK";

        const buttons = choices.querySelectorAll(".choice-btn");
        buttons.forEach(btn => btn.disabled = false);

        choices.style.display = "none";
        playMainVideo();
    }

})();
