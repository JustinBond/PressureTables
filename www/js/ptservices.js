/*global angular*/
var mod = angular.module('ptservices', []);

mod.service('questionMaker', function ($log) {
    "use strict";
    $log.info("Begin tables");

    var shuffleArray,
        questionMaker;

    /**
    * Randomize array element order in-place.
    * Using Durstenfeld shuffle algorithm.
    */
    shuffleArray = function (array) {
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

        getRandomDigit : function () {
            return Math.floor(Math.random() * 8) + 2;
        },

        getEasyFakes : function (table, digit) {
            var answer,
                fakes,
                candidate;

            answer = table * digit;
            fakes = [];

            while (true) {
                candidate = Math.floor(Math.random() * 99) + 1;
                if (candidate / answer > 1.3 || candidate / answer < 0.7) {
                    fakes.push(candidate);
                    if (fakes.length === 3) {
                        return fakes;
                    }
                }
            }
        },

        // TODO: getHardFakes
        getHardFakes : function (table, digit) {
            return this.getEasyFakes(table, digit);
        },

        getFakeAnswers : function (table, digit, easy) {
            if (easy) {
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
            question.options = shuffleArray(options);
            $log.debug("Question is: " + JSON.stringify(question));
            return question;
        }
    };

    this.getQuestion = function (table) {
        return questionMaker.create(table);
    };
});

mod.service('drillLogic', function ($log, config, questionMaker, graphics) {
    "use strict";
    $log.info("Begin drillLogic");

    var drill,
        callback;

    drill = {
        tables : null,
        answerTime : config.defaultTime,
        score : 0,
        running : false,

        setAnswerTime : function (level) {

            var base,
                exp;

            base = config.levelFactor;
            exp = level;
            this.answerTime = config.defaultTime * (Math.pow(base, exp)).toFixed(2);
            $log.debug("answerTime is: " + this.answerTime);
        },

        getRandomTable : function () {
            return this.tables[Math.floor(Math.random() * this.tables.length)];
        },

        init : function (level, tables) {
            this.tables = tables;
            this.setAnswerTime(level);
        },

        run : function () {
            $log.debug("Begin drill.run()");
            var table,
                question;

            graphics.drawScore(this.score);
            table = this.getRandomTable();
            question = questionMaker.getQuestion(table);
            graphics.drawQuestion(question.text, this.answerTime, callback);

        }
    };

    this.answer = function (answer) {
        $log.debug("Answered: " + answer);
    };

    this.run = function (level, tables) {
        drill.init(level, tables);
        drill.run();
        // update score, getQuestion,
    };

    callback = function () {
        drill.run();
    };
});

mod.service('graphics', function ($log, $interval, config) {
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
            var startY,
                barHeight;

            startY = this.height - percent * this.height / 100;
            barHeight = this.height - startY;
            canvas.context.fillStyle = "#008000";
            canvas.context.clearRect(this.width, 0, this.width, this.height);
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

        text : "foo",

        init : function (context, height, width) {
            this.context = context;
            this.height = height;
            this.width = width;
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
            startY = (percent / 100) * (this.height - config.defaultFontSize);
            width = this.width - config.barWidth;
            height = config.defaultFontSize + 2;

            this.context.clearRect(startX, startY, width, height);
        },

        // animates the message as it falls from the top of the canvas to the
        // bottom
        fall : function (message, duration, callback) {
            $log.debug("Begin fall with " + message, duration);

            var percent,
                time0,
                oldPercent,
                promise;

            time0 = new Date().getTime();

            this.clear(0);
            this.write(message, 0);
            oldPercent = 0;

            promise = $interval(function () {
                percent = 100 * (new Date().getTime() - time0) / duration;
                if (percent >= 100) {
                    percent = 100;
                    $interval.cancel(promise);
                }
                text.clear(oldPercent);
                text.write(message, percent);
                //$log.debug("percent: " + percent);

                oldPercent = percent;
            }, config.frameLength, duration / config.frameLength);

            promise.then(function () {
                $log.debug("Clearing text at 100");
                text.clear(100);
                callback();
            });

            promise.catch(function () {
                $log.debug("Clearing text at 100");
                text.clear(100);
                callback();
            });

            return promise;
        }
    };

    this.init = function (height, width, context) {
        $log.debug("graphics.init: canvas dimensions:", height, width);
        canvas.init(context, height, width);
        bar.init(context, height, width);
        bar.draw(70);
        text.init(context, height, width);
        //text.fall("7 x 8 =", 5000);
    };

    this.drawScore = function (percent) {
        bar.draw(percent);
    };

    this.drawQuestion = function (question, duration, callback) {
        text.fall(question, duration, callback);
    };

});
