<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>反演</center></h1>

反演主要用于替换组合式求和，重点在于推式子，原理暂略。

## 二项式反演

形式 $0$：

$$g(n)=\sum\limits_{i=0}^n(-1)^i\dbinom{n}{i}f(i)\Leftrightarrow f(n)=\sum\limits_{i=0}^n(-1)^i\dbinom{n}{i}g(i)$$

形式 $1$：

$$g(n)=\sum\limits_{i=0}^n\dbinom{n}{i}f(i)\Leftrightarrow f(n)=\sum\limits_{i=0}^n(-1)^{n-i}\dbinom{n}{i}g(i)$$

形式 $2$：

$$g(n)=\sum\limits_{i=n}^∞\dbinom{i}{n}f(i)\Leftrightarrow f(n)=\sum\limits_{i=n}^∞(-1)^{i-n}\dbinom{i}{n}g(i)$$

## 欧拉反演

$$n=\sum\limits_{d\mid n}\varphi(d)$$

## 莫比乌斯反演

$$g(n)=\sum\limits_{d\mid n} f(d)\Leftrightarrow f(n)=\sum\limits_{d\mid n}\mu(d)g(\frac{n}{d})$$

特殊地，$\sum\limits_{d\mid n}\mu(d)=[n=1]$

更特殊地，$\sum\limits_{d\mid\gcd(i,j)}\mu(d)=[\gcd(i,j)=1]$

## 子集反演

$$g(S) = \sum\limits_{T\subseteq S} f(T)$$

可得反演式：

$$f(S)=\sum\limits_{T\subseteq S}(-1)^{|S|-|T|}g(T)$$

以及：

$$f(T)=\sum\limits_{T\subseteq S}(-1)^{|S|-|T|}g(S)$$

## 单位根反演

$$\dfrac{1}{m}\sum\limits_{i=0}^{m-1}(\omega_m)^{i\times d}=[m\mid d]$$

扩展到 $d\bmod m=k$ 的情况：

$$\dfrac{1}{m}\sum\limits_{i=0}^{m-1}\omega_m^{i\times (d-k)}=[d\bmod m=k]$$

把这个形式放到多项式上：对于多项式：$f(x)=\sum\limits_{i=0}^n a_ix^i$，求其所有下标同余 $m$ 的系数之和。

$$\sum\limits_{i=0}^n a_i[i\bmod m=k]=\sum\limits_{i=0}^n a_i\dfrac{1}{m}\sum\limits_{j=0}^{m-1}\omega_m^{j\times (i-k)}\\=\dfrac{1}{m}\sum\limits_{i=0}^{m-1}\omega_m^{-ik}\sum\limits_{j=0}^n a_j(\omega_m^i)^j=\dfrac{1}{m}\sum\limits_{i=0}^{m-1}\omega_m^{-ik} f(\omega_m^i)$$

时间复杂度：$O(mT(n))$，其中 $T(n)$ 表示多项式单点求值的时间复杂度。

## 斯特林反演

$$f(n)=\sum\limits_{i=0}^n\begin{Bmatrix}
    n\\i
\end{Bmatrix} g(i)\Leftrightarrow g(n)=\sum\limits_{i=0}^n(-1)^{n-i}\begin{bmatrix}
    n\\i
\end{bmatrix}f(i)$$