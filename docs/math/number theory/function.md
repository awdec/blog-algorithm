<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>数论函数</center></h1>


## 积性函数

> 若 $f(1)=1,f(xy)=f(x)f(y),x\perp y$，则 $f(x)$ 是积性函数
>
> 若 $f(1)=1,f(xy)=f(x)f(y)$，则 $f(x)$ 是完全积性函数

若 $f(x)$ 和 $g(x)$ 均为积性函数，则以下函数也为积性函数：
$$h(x)=f(x^p)\\h(x)=f^p(x)\\h(x)=f(x)g(x)\\h(x)=\sum\limits_{d\mid x}f(d)g(\frac{x}{d})$$


- 若 $f(x)$ 是积性函数，则 $f(x)=\prod f(p_i^{k_i})$
- 若 $f(x)$ 是完全积性函数，则 $f(x)=\prod f(p_i^{k_i})=\prod f(p_i)^{k_i}$

## 常见积性函数

- 单位函数：$\epsilon(n)=[n=1]$
- 恒等函数：$\text{id}_k(n)=n^k$，$\text{id}_1(n)$ 通常简记作 $\text{id}(n)$
- 常数函数：$1(n)=1$
- 除数函数：$\sigma_k(n)=\sum\limits_{d\mid n}d^k$
- 欧拉函数：$\varphi(n)=\sum\limits_{i=1}^n[(i,n)=1]$
- 莫比乌斯函数：$\mu(n)=\begin{cases}
    1 & n=1 \\0 & \exists\ d>1,d^2\mid n\\(-1)^{\omega(n)},其中\ \omega(n)\ 表示\ n\ 的质因子数量
\end{cases}$
- 约数个数函数：$d(n)$，即 $\sigma_0(n)$
- 约数和函数：$\tau(n)$，即 $\sigma_1(n)$   

## 欧拉筛求积性函数

$f(x)=f(p_1^{k_1})\times \prod f(p_i^{k_i}),i>1$

令 $y=\prod p_i^{k_i}$，那么 $f(x)=f(p_1^{k_1})\times f(y)$

欧拉筛用 $x$ 的最小质因子标记 $x$，在欧拉筛的过程中，$y$ 已被标记，那么计算 $f(x)$ 时，欧拉筛可以保证 $f(y)$ 已被计算，若 $f(p_1^{k_1})$ 可以快速计算，即可快速得到 $f(x)$ 的值。

综上，可在 $O(nT(p^k))$ 时间内计算 $f(1)\dots f(n)$，其中 $T(p^k)$ 为计算 $f(p^k)$ 的时间复杂度。

使用埃氏筛筛出最小质因子后同样可求。

## 欧拉函数

### 公式

$\varphi(n)=n\prod(1-\frac{1}{p_i})$

### 欧拉定理

$a^{\varphi(m)}\equiv 1\pmod m,a\perp m$

### 费马小定理

$a^{p-1}\equiv 1\pmod p,a\nmid p,p\in\mathbb{P}$

不难发现，费马小定理是欧拉定理的特殊情况。

### 扩展欧拉定理

$a^b\equiv\begin{cases}
    a^{b\bmod\varphi(m)} & \gcd(a,m)=1\\a^b & \gcd(a,m)\neq 1,b<\varphi(m)\\a^{b\bmod\varphi(m)+\varphi(m)}& \gcd(a,m)\ne 1,b\ge\varphi(m)
\end{cases}\pmod p$

用于大指数取模。

### 欧拉降幂

求 $a^{a^{a^{.^{.^{.}}}}}\bmod m$，反复使用 exeuler，对指数不断$\mod\varphi(m)$。

结论是一个数自取 $O(\log n)$ 次 $\varphi(n)$ 就会降到 $1$。

简单证明：
- $\varphi(x),x\ne 2$ 是偶数
- $\varphi(x)\le\frac{x}{2},x\bmod 2=0$

所以至少是两次缩小一半规模。