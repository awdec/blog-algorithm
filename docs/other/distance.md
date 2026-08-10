<h1><center>范数</center></h1>


|距离|范数符号|公式|
|---|---|---|
|曼哈顿距离|$L^1$| $\lvert x_1-x_2\rvert+\lvert y_1-y_2\rvert$ |
|欧几里得距离|$L^2$| $\sqrt{(x_1-x_2)^2+(y_1-y_2)^2}$ |
|切比雪夫距离|$L^\infty$| $\max(\lvert x_1-x_2\rvert,\lvert y_1-y_2\rvert)$ |


将点 $(x,y)$ 变换为 $(u,v)=(x+y,x-y)$ 后，原坐标系中的曼哈顿距离等于新坐标系中的切比雪夫距离：

$$
|\Delta x|+|\Delta y|=\max(|\Delta u|,|\Delta v|).
$$

反过来，将点 $(x,y)$ 变换为

$$
(u,v)=\left(\frac{x+y}{2},\frac{x-y}{2}\right)
$$

后，原坐标系中的切比雪夫距离等于新坐标系中的曼哈顿距离：

$$
\max(|\Delta x|,|\Delta y|)=|\Delta u|+|\Delta v|.
$$

上述第二个变换在实数坐标中始终成立；若要求变换后的坐标仍为整数，则必须满足 $x\equiv y\pmod 2$。等价地，从 $(u,v)$ 逆变换回整数点时，需要 $u\equiv v\pmod 2$。若不满足同奇偶条件，可以直接保存倍增后的坐标 $(x+y,x-y)$，此时

$$
|\Delta u|+|\Delta v|=2\max(|\Delta x|,|\Delta y|),
$$

从而避免使用半整数。
