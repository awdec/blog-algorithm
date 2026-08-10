<h1><center>组合数列</center></h1>

## 组合数

$$\dbinom{n}{m}=\dbinom{n-1}{m}+\dbinom{n-1}{m-1}$$

$$\dbinom{n}{m}=\dbinom{n}{n-m}$$

$$\sum\limits_{i=0}^n\dbinom{n}{i}=2^n$$

$$\sum\limits_{i=1}^n i\dbinom{n}{i}=n2^{n-1}$$

$$\sum\limits_{i=0}^k\dbinom{n+i}{i}=\dbinom{n+k+1}{k}$$

$$\dbinom{n+1}{k+1}=\sum\limits_{i=0}^n\dbinom{i}{k}$$

$$\sum\limits_{i=0}^k\dbinom{n}{i}\dbinom{m}{k-i}=\dbinom{n+m}{k}$$

## 卡特兰数

$$H_n=\dfrac{\dbinom{2n}{n}}{n+1}$$

$$H_n=\begin{cases}
  \sum\limits_{i=1}^n H_{i-1}H_{n-i} n\ge 2\\ 1 & n=0,1
\end{cases}$$

$$H_n=\dfrac{4n-2}{n+1}H_{n-1}$$

$$H_n=\dbinom{2n}{n}-\dbinom{2n}{n-1}$$

## 斯特林数

### 第一类斯特林数

存在 $k$ 个置换环的大小为 $n$ 的置换：$\begin{bmatrix}
    n\\k
\end{bmatrix}$

约定 $\begin{bmatrix}0\\0\end{bmatrix}=1$；当 $n>0$ 时 $\begin{bmatrix}n\\0\end{bmatrix}=0$，当 $k<0$ 或 $k>n$ 时取 $0$。

#### 递推公式

$$\begin{bmatrix}
    n\\k
\end{bmatrix}=\begin{bmatrix}
    n-1\\k-1
\end{bmatrix}+(n-1)\times \begin{bmatrix}
    n-1\\k
\end{bmatrix}$$

#### 性质式

$$n!=\sum\limits_{i=0}^n\begin{bmatrix}
    n\\i
\end{bmatrix}$$

$$x^{\underline{n}}=\sum\limits_{i=0}^n\begin{bmatrix}
    n\\i 
\end{bmatrix}(-1)^{n-i} x^i$$

### 第二类斯特林数

$n$ 个有标号的球分配到 $k$ 个无标号的盒子的方案数：$\begin{Bmatrix}
    n\\k
\end{Bmatrix}$

约定 $\begin{Bmatrix}0\\0\end{Bmatrix}=1$；当 $n>0$ 时 $\begin{Bmatrix}n\\0\end{Bmatrix}=0$，当 $k<0$ 或 $k>n$ 时取 $0$。

#### 递推公式

$$\begin{Bmatrix}
    n\\k
\end{Bmatrix}=\begin{Bmatrix}
    n-1\\k-1
\end{Bmatrix}+k\times \begin{Bmatrix}
    n-1\\k
\end{Bmatrix}$$

#### 性质式

$$x^n=\sum\limits_{i=0}^n\begin{Bmatrix}
    n\\i
\end{Bmatrix}x^{\underline{i}}$$

特别地：

$$\sum\limits_{i=0}^n i^k=\sum\limits_{i=0}^k\begin{Bmatrix}
    k\\i
\end{Bmatrix}\dfrac{(n+1)^{\underline{i+1}}}{i+1}$$

## 斐波那契数列

定义  $f_i=\begin{cases}
    0 & i=0\\1 & i=1\\f_{i-1}+f_{i-2} & i\ge 2
\end{cases}$ 的数列为斐波那契数列。

### 通项公式：

$$f_n=\dfrac{(\frac{1+\sqrt 5}{2})^n-(\frac{1-\sqrt 5}{2})^n}{\sqrt 5}$$

若 $5$ 在给定模数模意义下存在二次剩余，结合二次剩余和逆元可在 $O(\log n)$ 时间求解 $f_n$。

注：常见模数 $10^9+7$ 和 $998244353$，对 $5$ 不存在二次剩余。$10^9+9$ 对 $5$ 存在二次剩余，解为：$383008016,616991993$。

### 倍增：

$$f_{2k}=f_k(2f_{k+1}-f_k),f_{2k+1}=f_{k+1}^2+f_k^2$$

根据奇偶性递推 $f_n$ 即可。

时间复杂度：$O(\log n)$，常数较小。

### 矩阵递推：

$$[f_{n-1},f_n]=[f_{n-2},f_{n-1}]\times\begin{bmatrix}0&1\\1&1\end{bmatrix}$$

令 $p=\begin{bmatrix}0&1\\1&1\end{bmatrix}$，$[f_n,f_{n+1}]=[f_0,f_1]\times p^n$

利用矩阵快速幂，可在 $O(2^3\times\log n)$ 的时间计算 $f_n$。

预处理 $2^i$ 矩阵，可将询问转换成向量乘矩阵，矩乘满足结合律，时间复杂度：$O(2^2\times\log n)$。

### 性质

- $f_{n-1}f_{n+1}-f_n^2=(-1)^n$
- $f_{n+k}=f_kf_{n+1}+f_{k-1}f_n$，特别地 $f_{2n}=f_n(f_{n+1}+f_{n-1})$
- $\gcd(f_a,f_b)=f_{\gcd(a,b)}$，其中 $a,b\ge 1$
- $n\ge 1,k\ge 0\rightarrow f_n\mid f_{nk}$
- 由 gcd 恒等式可得，当 $a\ge 3,b\ge 1$ 时，$f_a\mid f_b\Leftrightarrow a\mid b$；$a=1,2$ 时 $f_a=1$，会整除任意 $f_b$，上述等价关系不再普遍成立

### 模意义下的周期性

记斐波那契数列模 $m$ 的最小正周期为 $\pi(m)$。正整数 $T$ 是它的一个周期，当且仅当 $(f_T,f_{T+1})\equiv(0,1)\pmod m$。

> 令模数为 $m$，斐波那契数列的最小正周期不超过 $6m$。

模数较小时暴力枚举求周期即可。

> 斐波那契数列模 $2$ 的最小正周期是 $3$，模 $5$ 的最小正周期是 $20$。

> 对于奇素数 $p\equiv 1,4\pmod 5$，$p-1$ 是斐波那契数列模 $p$ 的周期。

> 对于奇素数 $p\equiv 2,3\pmod 5$，$2p+2$ 是斐波那契数列模 $p$ 的周期。

上面给出的是候选周期，不一定是最小周期。可以分解候选周期，并依次尝试约去质因子；使用 $(f_T,f_{T+1})\equiv(0,1)\pmod p$ 检验，得到 $\pi(p)$。

对于素数幂，若 $k\ge2$ 且 $M=\pi(p^{k-1})$，则 $pM$ 是模 $p^k$ 的一个候选周期，且

$$
M\mid\pi(p^k)\mid pM.
$$

因此 $\pi(p^k)$ 只能是 $M$ 或 $pM$。需要先检验 $M$ 在模 $p^k$ 下是否仍为周期，不能无条件认为最小周期每层都恰好乘 $p$。

令 $m=\prod p_i^{a_i}$，逐层求出每个最小周期 $\pi(p_i^{a_i})$ 后，根据中国剩余定理有

$$
\pi(m)=\mathop{\mathrm{lcm}}_i\pi(p_i^{a_i}).
$$

## 错位排列

定义 $D_n$ 表示满足 $p_i\ne i$ 的 $n$ 元排列数量，并约定 $D_0=1$。

$$D_n=n!\sum\limits_{i=0}^n\dfrac{(-1)^i}{i!}$$

$$D_n=nD_{n-1}+(-1)^n\quad(n\ge 1)$$

### 指数生成函数

$$D(x)=\sum\limits_{n\ge0}D_n\frac{x^n}{n!}=\text{exp}(-\ln(1-x)-x)$$

## 贝尔数

定义 $B_n$ 表示把大小为 $n$ 的集合划分成若干非空子集的方案数，并约定空集只有一种划分，即 $B_0=1$。

$$B_{n+1}=\sum\limits_{i=0}^n\dbinom{n}{i}B_i\quad(n\ge0)$$

$$B_n=\sum\limits_{i=0}^n\begin{Bmatrix}
    n\\i
\end{Bmatrix}\quad(n\ge0)$$

### 贝尔三角形

定义 $a_{0,0}=1$。对于 $n\ge1$，先令 $a_{n,0}=a_{n-1,n-1}$，再令

$$
a_{n,m}=a_{n,m-1}+a_{n-1,m-1}\quad(1\le m\le n),
$$

则 $B_n=a_{n,0}$。

### 指数生成函数

$$B(x)=\sum\limits_{n\ge0}B_n\frac{x^n}{n!}=\text{exp}(e^x-1)$$

## 欧拉数

定义 $E(n,m)$ 表示 $n$ 元排列中恰好有 $m$ 个上升位置的排列数量，即恰好有 $m$ 个 $i\in[1,n-1]$ 满足 $p_i<p_{i+1}$。

### 递推式：

$$E(n,m)=\begin{cases}
    1 & n=0\land m=0\\
    0 & m<0\lor(n=0\land m\ne0)\lor(n\ge1\land m\ge n)\\
    (n-m)E(n-1,m-1)+(m+1)E(n-1,m) & n\ge1,0\le m<n
\end{cases}$$

## 分拆数

定义 $p(n,k)$ 表示 $n=\sum\limits_{i=1}^k r_i$ 且 $r_1\ge r_2\ge\dots\ge r_k\ge1$ 的方案数。约定 $p(0,0)=1$，下标越界时取 $0$，则 $p_n=\sum\limits_{k=0}^n p(n,k)$，特别地 $p_0=1$。


分拆数增长率相对不大：
- $p_n\le 2\times 10^5,n\le 50$
- $p_n\le 10^6,n\le 60$
- $p_n\le 5\times 10^6,n\le 70$


普通生成函数：

$$
\begin{aligned}
P(x)
&=\sum\limits_{n=0}^\infty p_nx^n
=\prod\limits_{i=1}^\infty(1-x^i)^{-1}\\
&=\text{exp}\left(-\sum\limits_{i=1}^\infty\ln(1-x^i)\right)
=\text{exp}\left(\sum\limits_{i=1}^\infty\sum\limits_{j=1}^\infty\frac{x^{ij}}{j}\right)\\
&=\text{exp}\left(\sum\limits_{n=1}^\infty\frac{\sigma_1(n)}{n}x^n\right).
\end{aligned}
$$

其中 $\sigma_1(n)=\sum_{d\mid n}d$ 表示 $n$ 的正因数之和。


### 性质：

设 $p_n(k)$ 是最大部分为 $k$ 的 $n$ 的分拆数量，$q_n(k)$ 是恰好 $k$ 个部分的分拆数量。

$$p_n(k)=q_n(k)$$

根据此性质，求 $p(n)$ 时可以根据拆分出 $r_i$ 的大小根号分治，时间复杂度：$O(n\sqrt n)$。

设 $p_n^o$ 是把 $n$ 分拆成若干奇数部分的方案数，$p_n^d$ 是把 $n$ 分拆成若干互不相同部分的方案数。

$$p_n^o=p_n^d$$


### 五边形数定理：

Euler 五边形数定理给出

$$
\Phi(x)=\prod\limits_{i=1}^\infty(1-x^i)
=1+\sum\limits_{k=1}^\infty(-1)^k
\left(x^{k(3k-1)/2}+x^{k(3k+1)/2}\right).
$$

令

$$
g_k^- =\frac{k(3k-1)}2,\qquad
g_k^+ =\frac{k(3k+1)}2\quad(k\ge1),
$$

二者称为广义五边形数。其指数依次为 $1,2,5,7,12,15,\dots$，在 $\Phi(x)$ 中的符号按 $-,-,+,+,\dots$ 成对出现。

由于 $P(x)=\Phi(x)^{-1}$，比较 $P(x)\Phi(x)=1$ 的 $x^n$ 系数，并约定 $p_0=1$、$p_n=0\ (n<0)$，可得

$$
p_n=\sum\limits_{k=1}^\infty(-1)^{k-1}
\left(p_{n-g_k^-}+p_{n-g_k^+}\right).
$$

递推中的符号按 $+,+,-,-,\dots$ 成对出现。因为 $g_k^\pm=\Theta(k^2)$，对每个 $n$ 只有 $O(\sqrt n)$ 个有效项，计算 $p_0,\dots,p_n$ 的时间复杂度为 $O(n\sqrt n)$。
