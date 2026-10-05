document.addEventListener("DOMContentLoaded", function () {

    const setup = document.getElementById("setup");
    const gameArea = document.getElementById("gameArea");

    const board = document.getElementById("board");
    const cells = document.querySelectorAll(".cell");

    const letter1Input = document.getElementById("letter1");
    const letter2Input = document.getElementById("letter2");

    const startBtn = document.getElementById("startBtn");
    const restartBtn = document.getElementById("restartBtn");
    const changeLettersBtn = document.getElementById("changeLettersBtn");
    const undoBtn = document.getElementById("undoBtn");

    const errorMessage = document.getElementById("errorMessage");
    const status = document.getElementById("status");

    const player1 = document.getElementById("player1");
    const player2 = document.getElementById("player2");

    const player1Label = document.getElementById("player1Label");
    const player2Label = document.getElementById("player2Label");

    const score1Element = document.getElementById("score1");
    const score2Element = document.getElementById("score2");


    /* =========================
       GAME VARIABLES
    ========================= */

    let letter1 = "";
    let letter2 = "";

    let currentPlayer = 1;
    let gameActive = false;

    let boardState = [
        "", "", "",
        "", "", "",
        "", "", ""
    ];

    let moveHistory = [];

    let score1 = 0;
    let score2 = 0;


    const wins = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],

        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],

        [0, 4, 8],
        [2, 4, 6]
    ];


    /* =========================
       START GAME
    ========================= */

    startBtn.addEventListener("click", function () {

        const p1 = letter1Input.value.trim().toUpperCase();
        const p2 = letter2Input.value.trim().toUpperCase();

        if (p1 === "" || p2 === "") {

            errorMessage.textContent =
                "Please enter a letter for both players.";

            return;
        }

        if (!/^[A-Z]$/.test(p1) || !/^[A-Z]$/.test(p2)) {

            errorMessage.textContent =
                "Please choose letters from A to Z.";

            return;
        }

        if (p1 === p2) {

            errorMessage.textContent =
                "Please choose two different letters.";

            return;
        }

        letter1 = p1;
        letter2 = p2;

        player1Label.textContent =
            "PLAYER 1 • " + letter1;

        player2Label.textContent =
            "PLAYER 2 • " + letter2;

        score1 = 0;
        score2 = 0;

        score1Element.textContent = "";
        score2Element.textContent = "";

        errorMessage.textContent = "";

        setup.style.display = "none";
        gameArea.style.display = "block";

        newRound();
    });


    /* =========================
       NEW ROUND
    ========================= */

    function newRound() {

        boardState = [
            "", "", "",
            "", "", "",
            "", "", ""
        ];

        moveHistory = [];

        currentPlayer = 1;
        gameActive = true;

        cells.forEach(function (cell) {

            cell.textContent = "";

            cell.classList.remove(
                "p1",
                "p2",
                "winner"
            );
        });

        updatePlayer();
        updateStatus();
    }


    /* =========================
       UPDATE PLAYER
    ========================= */

    function updatePlayer() {

        player1.classList.toggle(
            "active",
            currentPlayer === 1
        );

        player2.classList.toggle(
            "active",
            currentPlayer === 2
        );
    }


    /* =========================
       UPDATE STATUS
    ========================= */

    function updateStatus() {

        const currentLetter =
            currentPlayer === 1
                ? letter1
                : letter2;

        status.textContent =
            "Player " + currentLetter + "'s Turn";
    }


    /* ==================================================
       IMPORTANT MOBILE BOARD HANDLER

       We DON'T rely on which cell receives the tap.

       We calculate the tapped cell ourselves from
       the X/Y coordinates.
    ================================================== */

    board.addEventListener(
        "pointerup",
        function (event) {

            if (!gameActive) {
                return;
            }

            /*
             * Get the exact board position
             */

            const rect = board.getBoundingClientRect();

            const x =
                event.clientX - rect.left;

            const y =
                event.clientY - rect.top;


            /*
             * Ignore taps outside the board
             */

            if (
                x < 0 ||
                y < 0 ||
                x > rect.width ||
                y > rect.height
            ) {
                return;
            }


            /*
             * Calculate which column and row
             * was tapped.
             */

            const columnWidth =
                rect.width / 3;

            const rowHeight =
                rect.height / 3;


            let column =
                Math.floor(x / columnWidth);

            let row =
                Math.floor(y / rowHeight);


            /*
             * Safety correction for edge taps
             */

            if (column > 2) {
                column = 2;
            }

            if (row > 2) {
                row = 2;
            }


            /*
             * Convert row + column to
             * board index.
             *
             * 0 1 2
             * 3 4 5
             * 6 7 8
             */

            const index =
                row * 3 + column;


            /*
             * DEBUG-SAFE:
             * Make sure index is valid.
             */

            if (
                index < 0 ||
                index > 8
            ) {
                return;
            }


            /*
             * Cell already occupied
             */

            if (boardState[index] !== "") {
                return;
            }


            /*
             * Current player's letter
             */

            const currentLetter =
                currentPlayer === 1
                    ? letter1
                    : letter2;


            /*
             * Save move
             */

            moveHistory.push({
                index: index,
                player: currentPlayer
            });


            /*
             * Save board
             */

            boardState[index] =
                currentLetter;


            /*
             * Display letter
             */

            cells[index].textContent =
                currentLetter;


            /*
             * Apply player style
             */

            if (currentPlayer === 1) {

                cells[index].classList.add("p1");

            } else {

                cells[index].classList.add("p2");
            }


            /*
             * Check winner / draw
             */

            checkGame();

        },
        { passive: true }
    );


    /* =========================
       CHECK GAME
    ========================= */

    function checkGame() {

        let winnerCombo = null;


        for (let i = 0; i < wins.length; i++) {

            const combo = wins[i];

            const a = combo[0];
            const b = combo[1];
            const c = combo[2];


            if (
                boardState[a] !== "" &&
                boardState[a] === boardState[b] &&
                boardState[a] === boardState[c]
            ) {

                winnerCombo = combo;

                break;
            }
        }


        /* WIN */

        if (winnerCombo) {

            gameActive = false;


            winnerCombo.forEach(function (index) {

                cells[index].classList.add("winner");

            });


            if (currentPlayer === 1) {

                score1++;

                score1Element.textContent =
                    score1;

            } else {

                score2++;

                score2Element.textContent =
                    score2;
            }


            const winnerLetter =
                currentPlayer === 1
                    ? letter1
                    : letter2;


            status.textContent =
                "Player " +
                winnerLetter +
                " Wins!";

            return;
        }


        /* DRAW */

        if (
            boardState.every(function (value) {
                return value !== "";
            })
        ) {

            gameActive = false;

            status.textContent =
                "It's a Draw!";

            return;
        }


        /* NEXT PLAYER */

        currentPlayer =
            currentPlayer === 1
                ? 2
                : 1;


        updatePlayer();
        updateStatus();
    }


    /* =========================
       UNDO
    ========================= */

    undoBtn.addEventListener(
        "click",
        function () {

            if (moveHistory.length === 0) {

                status.textContent =
                    "Nothing to undo";

                return;
            }


            const lastMove =
                moveHistory.pop();


            const index =
                lastMove.index;


            boardState[index] = "";

            cells[index].textContent = "";


            cells[index].classList.remove(
                "p1",
                "p2",
                "winner"
            );


            cells.forEach(function (cell) {

                cell.classList.remove("winner");

            });


            currentPlayer =
                lastMove.player;


            gameActive = true;

            updatePlayer();
            updateStatus();
        }
    );


    /* =========================
       RESTART
    ========================= */

    restartBtn.addEventListener(
        "click",
        function () {

            newRound();
        }
    );


    /* =========================
       CHANGE LETTERS
    ========================= */

    changeLettersBtn.addEventListener(
        "click",
        function () {

            gameArea.style.display = "none";

            setup.style.display = "block";

            letter1Input.value = letter1;
            letter2Input.value = letter2;

            errorMessage.textContent = "";
        }
    );


    /* =========================
       ENTER KEY
    ========================= */

    letter1Input.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                letter2Input.focus();
            }
        }
    );


    letter2Input.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                startBtn.click();
            }
        }
    );

});
