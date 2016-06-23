# Pressure Tables

Tetris meets multiplication tables. The tables fall down the screen and you
must pick the answer before they reach the bottom. Each time you get 100 points
the difficulty level increases and the next multiplication problem drops faster.

#### Refactor
* get rid of object literals - they add redundant complexity when inside angularJS module
* how to generate questions - have questionMaker pick both table (from options) and digit
* more elegant redo (last question after getting wrong answer) method
* unified method for writing text of various sizes to different points on screen
