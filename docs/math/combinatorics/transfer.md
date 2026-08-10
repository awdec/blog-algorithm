<h1><center>反演</center></h1>

反演主要用于替换组合式求和，重点在于推式子，原理暂略。

## 二项式反演

形式 $0$：

$$g(n)=\sum\limits_{i=0}^n(-1)^i\dbinom{n}{i}f(i)\Leftrightarrow f(n)=\sum\limits_{i=0}^n(-1)^i\dbinom{n}{i}g(i)$$

形式 $1$：

$$g(n)=\sum\limits_{i=0}^n\dbinom{n}{i}f(i)\Leftrightarrow f(n)=\sum\limits_{i=0}^n(-1)^{n-i}\dbinom{n}{i}g(i)$$

形式 $2$：

$$g(n)=\sum\limits_{i=n}^∞\dbinom{i}{n}f(i)\Leftrightarrow f(n)=\sum\limits_{i=n}^∞(-1)^{i-n}\dbinom{i}{n}g(i)$$

这里默认数列具有有限支撑，即存在 $N$ 使得 $i>N$ 时 $f(i)=0$，从而两个看似无限的和实际都是有限和。令

$$
F(x)=\sum\limits_{i=0}^Nf(i)x^i,\qquad
G(x)=\sum\limits_{i=0}^Ng(i)x^i,
$$

则正变换等价于 $G(x)=F(1+x)$，代入 $x-1$ 即得到逆变换。若用于真正的无限数列，必须另外保证相关级数收敛且允许交换求和次序；仅写成普通形式幂级数并不会自动使每个系数中的无限和有定义，还需要局部有限性或相应的拓扑收敛条件。

## 欧拉反演

Euler 函数恒等式为

$$
n=\sum\limits_{d\mid n}\varphi(d).
$$

对其使用 Möbius 反演，可得对应的反演式

$$
\varphi(n)=\sum\limits_{d\mid n}\mu(d)\frac{n}{d}
=n\sum\limits_{d\mid n}\frac{\mu(d)}{d}.
$$

因此这一节是 Möbius 反演在 Euler 函数上的特殊应用，而不是另一种独立的通用反演。

## 莫比乌斯反演

$$g(n)=\sum\limits_{d\mid n} f(d)\Leftrightarrow f(n)=\sum\limits_{d\mid n}\mu(d)g(\frac{n}{d})$$

特殊地，$\sum\limits_{d\mid n}\mu(d)=[n=1]$

更特殊地，$\sum\limits_{d\mid\gcd(i,j)}\mu(d)=[\gcd(i,j)=1]$

## 子集反演

以下 $S,T$ 均为同一个有限全集 $U$ 的子集。对子集方向求和时，有

$$
g(S)=\sum\limits_{T\subseteq S}f(T)
\Leftrightarrow
f(S)=\sum\limits_{T\subseteq S}(-1)^{|S|-|T|}g(T).
$$

另一组是对超集方向求和：

$$
g(S)=\sum\limits_{S\subseteq T\subseteq U}f(T)
\Leftrightarrow
f(S)=\sum\limits_{S\subseteq T\subseteq U}(-1)^{|T|-|S|}g(T).
$$

两组公式方向不同，第二组不能仅由第一组的前提推出。

## 单位根反演

设 $m\ge1$，并在域 $K$ 上运算。要求 $m$ 在 $K$ 中可逆，且 $K$ 中存在一个 $m$ 次本原单位根 $\omega_m$。在复数域中可以取 $\omega_m=e^{2\pi i/m}$；在素域 $\mathbb F_p$ 中使用时，常见条件是 $m\mid(p-1)$，此时本原单位根和 $m^{-1}$ 都存在。

$$\dfrac{1}{m}\sum\limits_{i=0}^{m-1}(\omega_m)^{i\times d}=[m\mid d]$$

扩展到 $d\equiv k\pmod m$ 的情况：

$$\dfrac{1}{m}\sum\limits_{i=0}^{m-1}\omega_m^{i\times (d-k)}=[d\equiv k\pmod m]$$

把这个形式放到多项式上：对于多项式 $f(x)=\sum\limits_{i=0}^n a_ix^i$，求所有下标模 $m$ 同余于 $k$ 的系数之和。

$$
\begin{aligned}
\sum\limits_{i=0}^n a_i[i\equiv k\pmod m]
&=\sum\limits_{i=0}^n a_i\frac{1}{m}
\sum\limits_{j=0}^{m-1}\omega_m^{j(i-k)}\\
&=\frac{1}{m}\sum\limits_{j=0}^{m-1}\omega_m^{-jk}
\sum\limits_{i=0}^n a_i(\omega_m^j)^i\\
&=\frac{1}{m}\sum\limits_{j=0}^{m-1}\omega_m^{-jk}f(\omega_m^j).
\end{aligned}
$$

时间复杂度：$O(mT(n))$，其中 $T(n)$ 表示多项式单点求值的时间复杂度。

## 斯特林反演

$$f(n)=\sum\limits_{i=0}^n\begin{Bmatrix}
    n\\i
\end{Bmatrix} g(i)\Leftrightarrow g(n)=\sum\limits_{i=0}^n(-1)^{n-i}\begin{bmatrix}
    n\\i
\end{bmatrix}f(i)$$
