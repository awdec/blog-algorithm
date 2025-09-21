<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>筛法</center></h1>

## 整除分块

又叫数论分块。

$\lfloor\dfrac{n}{i}\rfloor$ 只有 $O(\sqrt n)$ 种数值，不同数值之间连续，且容易计算：$[l_i,r_i]\rightarrow\lfloor\dfrac{n}{l_i}\rfloor,r_i=\lfloor\dfrac{n}{\lfloor\frac{n}{i}\rfloor}\rfloor,l_i=r_{i-1}+1$

对于求和式：$S(n)=\sum\limits_{i=1}^n f(i)g(\lfloor\dfrac{n}{i}\rfloor)$，根据整除分块可得：$S(n)=\sum\limits_{i=1}^{m} g(l_i)\sum\limits_{j=l_i}^{r_i} f(j)$，其中 $m=O(\sqrt n)$，总时间复杂度：$O(\sqrt n T(n))$，其中 $T(n)$ 为计算 $f(n)$ 前缀和的时间复杂度。

```cpp
for (int i = 2, j; i <= n; i = j + 1) {
    j = n / (n / i);
    // 求 [i, j] 的贡献
}
```

### 多维整除分块

形如：

$$\sum\limits_{i=1}^n \sum\limits_{j=1}^m F_j(\lfloor\dfrac{a_j}{i}\rfloor)$$

此时，分块区间 $l_i=\min\{\lfloor\dfrac{a_j}{i}\rfloor\}$。

容易发现每个 $a_j$ 产生 $O(\sqrt a_j)$ 个区间，总时间复杂度为：$O(m\sqrt n)$，但是区间有相同部分，常数较小。

```cpp
for (int i = 1; i <= m; i++)
    maxn = max(maxn, a[i]);
for (int i = 2, j; i <= maxn;i i = j + 1) {
    j = maxn;
    for (int k = 1; k <= m; k++) {
        j = min(j, a[k] / (a[k] / i));
    }
    // 求 [i, j] 的贡献
}
```

### 二次整除分块

形如：

$$\sum\limits_{i=1}^n\lfloor\dfrac{n}{i^2}\rfloor$$

时间复杂度：$O(\sqrt[3]{n})$

```cpp
for (int i = 1, j; i <= m; i = j + 1) {
    auto now = n / (i * i);
    j = sqrtl(n / now);
   	// 求 [i, j] 的贡献
}
```



## 杜教筛

杜教筛用于求解一些积性函数前缀和：$S(n)=\sum\limits_{i=1}^n f(i)$。

构造积性函数 $g(n)$。

$$\sum\limits_{i=1}^n (f*g)(n)=\\\sum\limits_{i=1}^n\sum\limits_{d\mid i}f(d)g(\frac{i}{d})=\\\sum\limits_{i=1}^ng(d)S(\lfloor\frac{n}{d}\rfloor)$$

特别地：

$$g(1)S(n)=\sum\limits_{i=1}^n (f*g)(n)-\sum\limits_{i=2}^ng(d)S(\lfloor\frac{n}{d}\rfloor)$$

令 $T(n)$ 为求解 $S(n)$ 的时间复杂度，结合整除分块，那么：

$$T(n)=H(n)+\sum\limits_{d\mid n}^n G(d)T(d)$$

预处理 $S(1)\dots S(m)$，时间复杂度：$O(m+\frac{n}{\sqrt m})$，$m=n^{\frac{2}{3}}$ 时最优，为：$O(n^{\frac{2}{3}})$。

递归过程中状态需要记忆化，通常使用哈希表维护。

特别地，若求一次 $S(n)$，容易发现状态只有 $O(\sqrt n)$ 个，分为 $[1,\sqrt n]$ 和 $(\sqrt n,n]$ 分别储存即可。


```cpp
int sum_euler(int n) {
    if (n <= 2e6)
        return euler[n];
    if (mem1.count(n))
        return mem1[n];
    int res = (1 + n) * n / 2;
    for (int i = 2, j; i <= n;) {
        j = n / (n / i);
        res -= (j - i + 1) * sum1(n / i);
        i = j + 1;
    }
    return mem1[n] = res;
}
int sum_mu(int n) {
    if (n <= 2e6)
        return mu[n];
    if (mem2.count(n))
        return mem2[n];
    int res = 1;
    for (int i = 2, j; i <= n;) {
        j = n / (n / i);
        res -= (j - i + 1) * sum2(n / i);
        i = j + 1;
    }
    return mem2[n] = res;
}
```

## min_25 筛