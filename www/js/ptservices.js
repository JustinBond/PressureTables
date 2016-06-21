/*global angular*/
var mod = angular.module('ptservices', []);

mod.service('drillLogic', function ($log) {
    "use strict";
    $log.info("Begin drillLogic");
});

mod.service('graphics', function ($log, $interval, config) {
    "use strict";
    $log.info("Begin graphics");

    var canvas,
        bar,
        question;

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

    question = {
        height: null,
        width: null,
        context : null,
        font: config.defaultFontSize + "px Arial",
        fillStyle : "#0000FF",
        promise : null,

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
                oldPercent;

            time0 = new Date().getTime();

            this.clear(0);
            this.write(message, 0);
            oldPercent = 0;

            this.promise = $interval(function () {
                percent = 100 * (new Date().getTime() - time0) / duration;
                if (percent >= 100) {
                    percent = 100;
                    $interval.cancel(question.promise);
                }
                question.clear(oldPercent);
                question.write(message, percent);
                $log.debug("percent: " + percent);

                oldPercent = percent;
            }, 10, duration / config.frameLength);

            this.promise.then(function () {
                $log.debug("Clearing text at 100");
                question.clear(100);
                callback();
            });

            this.promise.catch(function () {
                $log.debug("Clearing text at 100");
                question.clear(100);
                callback();
            });
        }

    };

    this.init = function (height, width, context) {
        $log.debug("graphics.init: canvas dimensions:", height, width);
        canvas.init(context, height, width);
        bar.init(context, height, width);
        bar.draw(70);
        question.init(context, height, width);
        question.fall("7 x 8 =", 5000);
        //question.write("7 x 8 =", 30);
        //question.clear(30);
        //drawBox();
    };

});
