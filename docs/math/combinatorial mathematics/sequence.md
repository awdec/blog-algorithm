<style>
 body {
  font-family: "楷体"
}
</style>

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
- $k\ge 0\rightarrow f_n\mid f_{nk}$
- $f_a\mid f_b\Leftrightarrow a\mid b$
- $\gcd(f(a),f(b))=f_{\gcd(a,b)}$

### 模意义下的周期性

> 令模数为 $m$，斐波那契数列的最小正周期不超过 $6m$。

模数较小时暴力枚举求周期即可。

> 斐波那契数列模 $2$ 的最小正周期是 $3$，模 $5$ 的最小正周期是 $20$。

> 对于奇素数 $p\equiv 1,4\pmod 5$，$p-1$ 是斐波那契数列模 $p$ 的周期。

> 对于奇素数 $p\equiv 2,3\pmod 5$，$2p+2$ 是斐波那契数列模 $p$ 的周期。

> 对于素数 $p$，$M$ 是斐波那契数列模 $p^{k-1}$ 的周期，等价于 $M\times p$ 是斐波那契数列 $p^k$ 的周期。

根据以上规则，可以求出斐波那契数列模质数的周期，对于斐波那契数列模 $m$ 的周期，令 $m=\prod p_i^{a_i}$，先求出每一个质因子的周期 $M_i$，那么斐波那契数列模 $m$ 的周期为 $\text{lcm}(p_i^{a_i-1}M_i)$。

## 错位排列

定义错位排列表示 $p_i\ne i$ 的排列数量。

$$D_n=n!\sum\limits_{i=0}^n\dfrac{(-1)^k}{k!}$$

$$D_n=nD_{n-1}+(-1)^n$$

### 指数生成函数

$D(x)=\text{exp}(-\ln(1-x)-x)$

## 贝尔数

定义 $B_n$ 表示把大小为 $n$ 的集合划分成若干非空子集的方案数。

$$B_{n+1}=\sum\limits_{i=0}^n\dbinom{n}{i}B_i$$

$$B_n=\sum\limits_{i=0}^n\begin{Bmatrix}
    n\\i
\end{Bmatrix}$$

### 贝尔三角形

定义 $a_{n,m}=a_{n,m-1}+a_{n-1,m-1}$，则 $B_n=a_{n,1}$

### 指数生成函数

$B(x)=\text{exp}(e^x-1)$

## 欧拉数

定义 $E(n,m)$ 表示恰好 $m$ 个位置 $i$ 满足 $p_i>p_{i-1}$ 的排列。

### 递推式：

$$E(n,m)=\begin{cases}
    0 & m>n\lor n=0\\1 & m=0\\ (n-m)E(n-1,m-1)+(m+1)E(n-1,m)
\end{cases}$$

## 分拆数

定义 $p(n,k)$ 表示 $n=\sum\limits_{i=1}^k r_i,r_i\ge r_{i+1}$ 的 $r$ 的方案数。$p_n=\sum\limits_{i=1}^n p(n,i)$。 


分拆数增长率相对不大：
- $p_n\le 2\times 10^5,n\le 50$
- $p_n\le 10^6,n\le 60$
- $p_n\le 5\times 10^6,n\le 70$


普通生成函数：

$$P(x)=\prod\limits_{i=1}^∞(1-x^i)^{-1}=\text{exp}(\sum\limits_{i=1}^∞\ln(1-x^i))=\text{exp}(\sum\limits_{i=1}^∞-\sum\limits_{j=1}^∞\frac{x^{ij}}{j})=\text{exp}(-\sum\limits_{i=1}^∞\frac{d(i)x^i}{i})$$

其中 $d(i)$ 表示 $i$ 的因子数。


### 性质：

设 $p_n(k)$ 是最大部分为 $k$ 的 $n$ 的分拆数量，$q_n(k)$ 是恰好 $k$ 个部分的分拆数量。

$$p_n(k)=q_n(k)$$

根据此性质，求 $p(n)$ 时可以根据拆分出 $r_i$ 的大小根号分治，时间复杂度：$O(n\sqrt n)$。

设 $p_n^o$ 是把 $n$ 奇数个部分的分拆个数，设 $p_n^d$ 各部分不同的分拆数量。

$$p_n^o=p_n^d$$


### 五边形数定理：


对于 $P(X)$ 的展开，有：$P(X)=\varPhi(x)^{-1}$，其中 $\varPhi(x)=1-x-x^2+x^5+x^7-x^{12}-x^{15}+\dots$

令其第 $i$ 个非零项指数为 $p_i$，则 $p_i=\dfrac{3((-1)^{i-1}\lfloor\frac{i}{2}\rfloor)^2-((-1)^{i-1}\lfloor\frac{i}{2}\rfloor)}{2}$，$p_i$ 称为广义五边形数。

可以直接展开 $\varPhi(x)^{-1}$，截断 $x^n$，则 $[n]\varPhi(x)^{-1}=[n-1]\varPhi(x)^{-1}+[n-2]\varPhi(x)^{-1}-[n-5]\varPhi(x)^{-1}-[n-7]\varPhi(x)^{-1}+\dots$。

即：$[n]\varPhi(x)^{-1}=\sum\limits_{i=1}^∞[n-p_i]\varPhi(x)^{-1}$。

因为 $p_i$ 的值域是 $O(n^2)$ 级别的，所以递推的项数只有 $O(\sqrt n)$，时间复杂度：$O(n\sqrt n)$。