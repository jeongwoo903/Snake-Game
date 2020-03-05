var Game = Game || {};
var Keyboard = Keyboard || {};
var Component = Component || {};

// Keyboard 객체에 Keymap 리터럴 객체를 추가
Keyboard.Keymap = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
};

//ControllerEvent function
Keyboard.ControllerEvents = function () {

    // Setts
    var self = this;
    console.log(this);
    this.pressKey = null;
    this.keymap = Keyboard.Keymap;


    document.onkeydown = function (event) {
        self.pressKey = event.which;
    };

    this.getKey = function () {
        return this.keymap[this.pressKey];
    };
};

// stage funtion (canvas, configuration)
Component.Stage = function (canvas, conf) {

    this.keyEvent = new Keyboard.ControllerEvents();
    this.width = canvas.width;
    this.height = canvas.height;
    this.length = [];
    this.food = {};
    this.score = 0;
    this.direction = 'right';
    this.conf = {
        cw: 10, // snake setts 간의 간격? (잘 모르겠음)
        size: 5, // snake 길이
        fps: 1000 // 1초
    };

    if (typeof conf == 'object') {
        for (var key in conf) {
            if (conf.hasOwnProperty(key)) {
                this.conf[key] = conf[key];
                console.log(conf[key]);
            }
        }
    }
};

// stage funtion (canvas, configuration)
Component.Snake = function (canvas, conf) {

    this.stage = new Component.Stage(canvas, conf);

    // snake 초기화 값
    this.initSnake = () => {

        for (var i = 0; i < this.stage.conf.size; i++) {
            // snake가 처음 나타나는 위치
            this.stage.length.push({ x: i, y: 0 });
        }
    };

    // 음식 초기화 값
    this.initSnake();

    this.initFood = function () {
        // 음식을 snake가 가는 길에 놓기 위한 좌표값 설정
        this.stage.food = {
            x: Math.round(Math.random() * (this.stage.width - this.stage.conf.cw) / this.stage.conf.cw),
            y: Math.round(Math.random() * (this.stage.height - this.stage.conf.cw) / this.stage.conf.cw),
        };
    };

    this.initFood();
    // 재시작 할 시 값 초기화
    this.restart = function () {
        this.stage.length = [];
        this.stage.food = {};
        this.stage.score = 0;
        this.stage.direction = 'right';
        this.stage.keyEvent.pressKey = null;
        this.initSnake();
        this.initFood();
    };
};

Game.Draw = function (context, snake) {

    this.drawStage = function () {

        var keyPress = snake.stage.keyEvent.getKey();
        if (typeof (keyPress) != 'undefined') {
            snake.stage.direction = keyPress;
        }

        context.fillStyle = "#f9d371"; // snake, 음식 색상
        context.fillRect(0, 0, snake.stage.width, snake.stage.height); // 생성

        var nx = snake.stage.length[0].x;
        var ny = snake.stage.length[0].y;

        // keyCode에 따른 snake의 방향의 변화
        switch (snake.stage.direction) {
            case 'right':
                nx++;
                break;
            case 'left':
                nx--;
                break;
            case 'up':
                ny--;
                break;
            case 'down':
                ny++;
                break;
        }

        // 충돌 시 재시작
        // Check Collision
        if (this.collision(nx, ny) == true) {
            snake.restart();
            return;
        }

        // 뱀 음식 생성 로직
        if (nx == snake.stage.food.x && ny == snake.stage.food.y) {
            var tail = { x: nx, y: ny };
            snake.stage.score++;
            snake.initFood();
        } else {
            var tail = snake.stage.length.pop();
            tail.x = nx;
            tail.y = ny;
        }
        snake.stage.length.unshift(tail);

        // 뱀 그리기
        for (var i = 0; i < snake.stage.length.length; i++) {
            var cell = snake.stage.length[i];
            this.drawCell(cell.x, cell.y);
        }

        // 음식 그리기
        this.drawCell(snake.stage.food.x, snake.stage.food.y);

        // 스코어
        const score = document.querySelector(".score");
        score.innerHTML = `<p class="score">Score: ${snake.stage.score}</p>`;
    };


    this.drawCell = function (x, y) {
        context.fillStyle = '#ff5448';
        context.beginPath();
        context.arc((x * snake.stage.conf.cw + 6), (y * snake.stage.conf.cw + 6), 4, 0, 2 * Math.PI, false);
        context.fill();
    };

    // 벽과의 충돌 확인
    this.collision = function (nx, ny) {
        if (nx == -1 || nx == (snake.stage.width / snake.stage.conf.cw) || ny == -1 || ny == (snake.stage.height / snake.stage.conf.cw)) {
            return true;
        }
        return false;
    }
};

// 게임 시작
Game.Snake = function (elementId, conf) {

    var canvas = document.getElementById(elementId);
    var context = canvas.getContext("2d");
    var snake = new Component.Snake(canvas, conf);
    var gameDraw = new Game.Draw(context, snake);

    // 게임 interval
    setInterval(function () { gameDraw.drawStage(); }, snake.stage.conf.fps);
};

// window onload
window.onload = function () {
    var snake = new Game.Snake('stage', { fps: 100, size: 4 });
};