# Pressure Tables

Timed practice of multiplication tables with increasing pressure

#### How to Play

1. Select which table(s) you want to practice, or all.
2. Select initial difficulty.
3. Start drilling.
4. Gain points for each correct answer
5. Lose points for each wrong answer
6. Lose points as time passes
7. Win when you reach 100
8. Difficulty increases one level
9. Can't go below 0.

#### State

1. tables
2. difficulty
3. score
4. time since last answer

#### Design decisions

1. **easy and intuitive** vs **hard**. Some multiple choices where the answer
can be easily guessed because none of the others are close. To develop number feel over
rote memorization. But the hard ones are needed to ensure that the tables actually are memorized.

#### TODO

1. Bug: running out of time doesn't cost you points
2. Red X or green checkmark feedback for answer
3. Increment level when you reach 100
4. make a "medium" style answer where the answers are in the overall range,
but not near the right answer. So for 2's table, answers would be 2 - 24, but
not within 4 or so points of the right answer.
