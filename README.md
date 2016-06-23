# Pressure Tables

Tetris meets multiplication tables. The tables fall down the screen and you
must pick the answer before they reach the bottom. Each time you get 100 points
the difficulty level increases and the next multiplication problem drops faster.

#### Bugs

* not clearing text after time runs out

#### Refactor
* object literals - add extra complexity when inside angularJS module
* how to generate questions - have questionMaker pick both table (from options) and digit
* more elegant redo method
* move "times-up" event into notification service
* unified method for writing text of various sizes to different points on screen
