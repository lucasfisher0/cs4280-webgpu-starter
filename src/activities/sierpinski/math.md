# Chaos game math for the Sierpinski gasket

## Setup

Take a triangle with corners (the same ones the code uses):

$$
V_0 = (-1, -1), \quad V_1 = (0, 1), \quad V_2 = (1, -1)
$$

and a starting point $P_0 = (0, 0)$.

## The rule

For $i = 0, 1, 2, \dots, n-1$:

1. Pick a corner $V_k$ at random, with $k \in \{0, 1, 2\}$ and each corner equally likely.
2. Move halfway toward it:

$$
P_{i+1} = \frac{P_i + V_k}{2}
$$

3. Plot $P_{i+1}$.

