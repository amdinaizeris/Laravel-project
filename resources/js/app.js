

require("./bootstrap");

window.Vue = require("vue");



Vue.component(
    "example-component",
    require("./components/ExampleComponent.vue").default
);


let app = new Vue({
    el: "#app",
    data: {
        player1Wins: 0,
        player2Wins: 0,
        player1IsNext: true,
        player2IsComputer: true,
        boardData: Array(9).fill(null),
        winner: null
    },
    computed: {

        changeOpponentName: function() {
            return this.player2IsComputer ? "Kitas žaidėjas" : "Kompiuteris";
        },

        status: function() {
            let status;
            if (this.winner === null) {
                const letter = this.player1IsNext ? "X" : "O";
                status = "Kitas žaidėjas: " + letter;
            } else {
                status = this.winner + " Laimėjo žaidima!";
            }
            return status;
        },

        player2Name: function() {
            return this.player2IsComputer ? "Kompiuteris" : "Player 2";
        }
    },
    methods: {

        calculateWinner: function() {
            const lines = [
                [0, 1, 2],
                [3, 4, 5],
                [6, 7, 8],
                [0, 3, 6],
                [1, 4, 7],
                [2, 5, 8],
                [0, 4, 8],
                [2, 4, 6]
            ];


            for (let i = 0; i < lines.length; i++) {
                const [a, b, c] = lines[i];
                if (
                    this.boardData[a] &&
                    this.boardData[a] === this.boardData[b] &&
                    this.boardData[a] === this.boardData[c]
                ) {
                    this.winner = this.boardData[a];
                    if (this.boardData[a] === "X") this.player1Wins++;
                    else this.player2Wins++;
                    break;
                }
            }


            if (this.winner === null && !this.boardData.includes(null)) {
                this.winner = "Cat";
            }


            if (this.winner !== null) {
                axios
                    .post("/game/complete", {
                        won: this.winner === "X"
                    })
                    .then(function(response) {

                    })
                    .catch(function(error) {

                        if (error.response.status !== 401) console.log(error);

                    });
            }
        },

        clickSquare: function(i) {

            if (this.boardData[i] !== null || this.winner !== null) return;
            this.$set(this.boardData, i, this.player1IsNext ? "X" : "O");
            this.player1IsNext = !this.player1IsNext;
            this.calculateWinner();

            if (!this.player1IsNext && this.player2IsComputer)
                this.computerMove();
        },

        computerMove: function() {

            if (this.winner !== null) return;
            let i = Math.floor(Math.random() * 9);

            while (this.boardData[i] !== null) {
                i = Math.floor(Math.random() * 9);
            }
            this.clickSquare(i);
        },

        reset: function() {
            this.player1IsNext = Math.random() >= 0.5;
            this.boardData = Array(9).fill(null);
            this.winner = null;
            if (!this.player1IsNext && this.player2IsComputer)
                this.computerMove();
        },

        toggleComputer: function() {
            this.player2IsComputer = !this.player2IsComputer;
            this.reset();
            this.player1Wins = 0;
            this.player2Wins = 0;
        }
    }
});


let leaderboard = new Vue({
    el: "#leaderboard",
    data: { open: false, leaders: [] },
    methods: {

        toggleLeaderboard: function() {
            this.open = !this.open;
            if (this.open) {
                this.loadLeaders();
            }
        },

        loadLeaders: function() {
            axios
                .get("/leaders")
                .then(response => {
                    this.leaders = response.data.data;
                })
                .catch(error => {
                    console.log(error);
                });
        }
    },
    filters: {

        percentage: function(value) {
            return parseFloat(value).toFixed(2) + "%";
        }
    }
});
