/*global angular*/
var mod = angular.module('ptservices', []);

mod.service('questionMaker', function ($log) {
    "use strict";
    $log.info("Begin tables");

    var questionMaker,
        shuffle;

    /**
     * Randomize array element order in-place.
     * Using Durstenfeld shuffle algorithm.
     */
    shuffle = function (array) {
        var i,
            j,
            temp;

        for (i = array.length - 1; i > 0; i -= 1) {
            j = Math.floor(Math.random() * (i + 1));
            temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    };

    questionMaker = {

        queue : [],
        currentDigit : null,

        initQueue : function () {
            var i,
                queue;

            queue = [];
            for (i = 2; i < 13; i += 1) {
                queue.push(i);
            }
            for (i = 6; i < 10; i += 1) {
                queue.push(i);
            }
            this.queue = shuffle(queue);
        },

        getRandomDigit : function () {
            var digit;

            if (this.queue.length === 0) {
                this.initQueue();
            }
            digit = this.queue.pop();
            this.currentDigit = digit;
            return digit;
        },

        getEasyFakes : function (table, digit) {
            var answer,
                fakes,
                candidate;

            answer = table * digit;
            fakes = [];

            while (true) {
                candidate = Math.floor(Math.random() * (table * 14)) + 2;
                if (candidate / answer > 1.3 || candidate / answer < 0.7) {
                    if (fakes.indexOf(candidate) > -1) {
                        continue;
                    }
                    fakes.push(candidate);
                    if (fakes.length === 3) {
                        return fakes;
                    }
                }
            }
        },

        getHardFakes : function (table, digit) {
            var answer,
                fakes,
                candidate,
                i;

            answer = table * digit;
            fakes = [];


            candidate = Math.floor(Math.random() * 8 + answer - 4);
            for (i = candidate; i < candidate + 5; i += 1) {
                if (i === answer) {
                    continue;
                }
                fakes.push(i);
                if (fakes.length === 3) {
                    return fakes;
                }
            }
            $log.debug("Reached the end without enough fake answers");
            return fakes;
        },

        getFakeAnswers : function (table, digit) {
            var easy;

            easy = Math.random() > 0.5;
            if (easy) {
                $log.debug("Easy!");
                return this.getEasyFakes(table, digit);
            }
            return this.getHardFakes(table, digit);
        },

        create : function (table) {
            var question,
                options;

            $log.debug("Begin questionMaker.create()");

            question = {};
            question.x = this.getRandomDigit();
            question.y = table;
            question.text = question.x + " x " + question.y + " =";
            question.answer = question.x * question.y;
            options = this.getFakeAnswers(table, question.x);
            options.push(question.answer);
            //question.options = shuffleArray(options);
            options.sort(function (a, b) {
                return a - b;
            });
            question.options = options;
            $log.debug("Question is: " + JSON.stringify(question));
            return question;
        }
    };

    this.getQuestion = function (table) {
        return questionMaker.create(table);
    };

    this.redoQuestion = function () {
        questionMaker.queue.push(questionMaker.currentDigit);
    };
});

mod.service('drillLogic', function ($log, $timeout, config, questionMaker, graphics, Notification) {
    "use strict";
    $log.info("Begin drillLogic with drill");

    var drill;

    drill = {
        tables : null,
        answerTime : config.defaultTime,
        score : 0,
        level : 1,
        running : false,
        totalScore : 0,
        currentTable : null,

        setAnswerTime : function (level) {

            var base,
                exp;

            base = config.levelFactor;
            exp = level - 1;
            this.answerTime = config.defaultTime * (Math.pow(base, exp)).toFixed(2);
            $log.debug("answerTime is: " + this.answerTime);
        },

        getRandomTable : function () {
            return this.tables[Math.floor(Math.random() * this.tables.length)];
        },



        init : function (level, tables) {
            this.tables = tables;
            this.level = level;
            this.currentTable = null;
            this.score = 0;
            this.totalScore = 0;
            this.setAnswerTime(level);
        },

        question : function (callback) {
            $log.debug("Begin drill.run()");
            var table,
                question;

            //graphics.drawScore(this.score);
            if (this.currentTable === null) {
                table = this.getRandomTable();
                this.currentTable = table;
            } else {
                table = this.currentTable;
            }
            question = questionMaker.getQuestion(table);
            graphics.drawQuestion(question.text, this.answerTime, callback);
            return question;
        }
    };

    this.answer = function (correct) {
        $log.debug("Begin drillLogic.answer() with drill.score " + drill.score);
        graphics.clear();
        if (correct) {
            drill.score += config.answerPoints;
            drill.currentTable = null;

        } else {
            graphics.writeX();
            $timeout(function () {
                graphics.clearX();
            }, 150);
            questionMaker.redoQuestion();
            drill.score -= 2 * config.answerPoints;
            if (drill.score < 0) {
                drill.score = 0;
            }
        }
        if (drill.score >= 100) {
            drill.score = 0;
            drill.level += 1;
            Notification.notify("level-up");
            drill.setAnswerTime(drill.level);
        }
        graphics.next();
    };

    this.init = function (level, tables) {
        drill.init(level, tables);
        $log.debug("Drill is " + JSON.stringify(drill));
        // update score, getQuestion,
    };

    this.question = function (callback) {
        return drill.question(callback);
    };

    this.drawScore = function () {
        $log.debug("Begin drillLogic.drawScore() with drill.score: " + drill.score);
        graphics.drawScore(drill.score);
    };

    this.getTotalScore = function () {
        return (drill.level - 1) * 100 + drill.score;
    };
});

mod.service('graphics', function ($log, $interval, $rootScope, config) {
    "use strict";
    $log.info("Begin graphics");

    var canvas,
        bar,
        text;

    // this object has the properties needed for working with the HTML5 canvas
    canvas = {
        context : null,
        height : 0,
        width : 0,

        init : function (context, height, width) {
            this.height = height;
            this.width = width;
            this.context = context;
        },

        write : function (message) {
            var startX,
                startY,
                font,
                fontSize,
                percent;

            percent = 30;
            fontSize = 200;
            font = fontSize + "px Arial";

            startX = (this.width - config.barWidth) / 2 - 0.23 * fontSize * message.toString().length;
            startY = fontSize + (percent / 100) * (this.height - fontSize);
            //$log.debug("Writing " + message + " at: " + startX, startY);
            //$log.debug("font is: " + this.font);
            this.context.font = font;
            this.context.fillStyle = "#FF0000";
            canvas.context.fillText(message, startX, startY);
        },
        clear : function () {
            var width,
                height;

            width = this.width - config.barWidth;
            height = this.height;

            this.context.clearRect(0, 0, width, height);

        },

        clearX : function () {
            var startX,
                startY,
                width,
                height,
                percent,
                fontSize;

            percent = 30;
            fontSize = 200;
            startX = 0;
            startY = (percent / 100) * (this.height - fontSize - 5);
            width = this.width - config.barWidth;
            height = fontSize + 10;

            this.context.clearRect(startX, startY, width, height);
        }
    };

    bar = {
        height: 0,
        width: config.barWidth,
        startX: null,
        context: null,

        // draws the bar based on the percentage of the maximum height. The math
        // is a slightly tricky because (0, 0) is the upper left corner of the
        // canvas, so we have to draw it "down" from the top.
        draw : function (percent) {
            $log.debug("Begin bar.draw() with " + percent);
            var startY,
                barHeight;

            startY = this.height - percent * this.height / 100;
            barHeight = this.height - startY;
            canvas.context.fillStyle = "#008000";
            canvas.context.clearRect(this.startX, 0, this.width, this.height);
            canvas.context.fillRect(this.startX, startY, this.width, barHeight);

            //canvas.context.fillRect(this.loc.x, this.loc.y, this.width, this.height);

        },

        init : function (context, height, width) {
            this.context = context;
            this.height = height;
            this.startX = width - config.barWidth;
        }
    };

    text = {
        height: null,
        width: null,
        context : null,
        font: config.defaultFontSize + "px Arial",
        fillStyle : "#0000FF",
        promise : null,
        text : "foo",
        cancel : false,

        init : function (context, height, width) {
            this.context = context;
            this.height = height;
            this.width = width;
            this.cancel = false;
            $log.info("Begin with text " + JSON.stringify(text));
        },

        // Writes a message in the center of the screen at percent height
        // up or down
        write : function (message, percent) {
            var startX,
                startY;

            startX = (this.width - config.barWidth) / 2 - 0.15 * config.defaultFontSize * message.toString().length;
            startY = config.defaultFontSize + (percent / 100) * (this.height - config.defaultFontSize);
            //$log.debug("Writing " + message + " at: " + startX, startY);
            //$log.debug("font is: " + this.font);
            this.context.font = this.font;
            this.context.fillStyle = this.fillStyle;
            canvas.context.fillText(message, startX, startY);
        },

        clear : function (percent) {
            var startX,
                startY,
                width,
                height;

            startX = 0;
            startY = (percent / 100) * (this.height - config.defaultFontSize - 5);
            width = this.width - config.barWidth;
            height = config.defaultFontSize + 10;

            this.context.clearRect(startX, startY, width, height);
        },

        // animates the message as it falls from the top of the canvas to the
        // bottom
        fall : function (message, duration, callback) {
            $log.debug("Begin fall with " + message, duration);

            var percent,
                time0,
                oldPercent;

            time0 = new Date().getTime();

            this.clear(0);
            this.write(message, 0);
            oldPercent = 0;

            this.promise = $interval(function () {
                percent = 100 * (new Date().getTime() - time0) / duration;
                if (percent >= 100) {
                    $log.debug("times-up emitted");
                    percent = 100;
                    $rootScope.$emit("times-up");
                    $interval.cancel(text.promise);
                }
                text.clear(oldPercent);
                text.write(message, percent);
                //$log.debug("percent: " + percent);

                oldPercent = percent;
            }, config.frameLength, duration / config.frameLength);

            this.promise.then(function () {
                $log.debug("text.fall - promise.then");
                callback();
            });

            this.promise.catch(function () {
                $log.debug("text.fall - promise.catch");
                if (!text.cancel) {
                    callback();
                }
            });
        }
    };

    this.init = function (height, width, context) {
        $log.debug("graphics.init: canvas dimensions:", height, width);
        canvas.init(context, height, width);
        bar.init(context, height, width);
        text.init(context, height, width);
    };

    this.drawScore = function (percent) {
        bar.draw(percent);
    };

    this.drawQuestion = function (question, duration, callback) {
        text.fall(question, duration, callback);
    };

    this.next = function () {
        $interval.cancel(text.promise);
    };

    this.cancel = function () {
        $log.debug("Begin graphics.cancel()");
        text.cancel = true;
        $interval.cancel(text.promise);
    };

    this.writeX = function () {
        canvas.write("X");
    };

    this.clear = function () {
        canvas.clear();
    };
    this.clearX = function () {
        canvas.clearX();
    };
});

mod.service('Notification', ['$rootScope', '$log', function ($rootScope, $log) {
    "use strict";

    this.subscribe = function (scope, eventName, callback) {
        $log.debug("subscribing to notification: ", eventName);
        var handler = $rootScope.$on(eventName, callback);
        scope.$on('$destroy', handler);
    };

    this.notify = function (eventName) {
        $log.debug("emitting notification: ", eventName);
        $rootScope.$emit(eventName);
    };

}]);
