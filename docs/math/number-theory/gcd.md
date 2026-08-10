<h1><center>Gcd</center></h1>

下文，若不做特殊说明，均令 $x<y$。

## 一般的 gcd 求法

### 辗转相除法（欧几里得算法）

$\gcd(x,y)=\gcd(y\bmod x,x)$。

单次询问时间复杂度：$O(\log n)$。

记忆化，预处理时空复杂度：$O(n^2)$，单次询问时间复杂度：$O(1)$。


### 更相减损术 + Stein

- $x\equiv y\equiv 0\pmod 2\rightarrow\gcd(x,y)=2\times \gcd(\frac{x}{2},\frac{y}{2})$。
- $x\equiv y\equiv 1\pmod 2\rightarrow\gcd(x,y)=\gcd(y-x,x)$，此时 $y-x\not\equiv x\pmod 2$。
- $x\bmod 2=0,y\bmod 2=1\rightarrow\gcd(x,y)=\gcd(\frac{x}{2},y)$
- $x\bmod 2=1,y\bmod 2=0\rightarrow\gcd(x,y)=\gcd(x,\frac{y}{2})$

时间复杂度：$O(\log n)$。

优势是只涉及减和除以 $2$ 两种操作，在二进制意义下，除以 $2$ 可以视作右移一位。

对于有符号整数，应先用更宽的有符号类型取得绝对值，再转换为无符号整数执行减法和移位。下面的实现返回 `uint64_t`，因为 $\gcd(\text{INT\_MIN},0)=2^{31}$，该结果无法用 32 位 `int` 表示。

在高精度意义下，时间复杂度为 $O(\log^2n)$，优于辗转相除法，且容易实现（高精度取模是 $O(\log^2n)$ 的，所以高精度意义下的辗转相除法是 $O(\log^3n)$ 的）。

注：但是由于其和二进制相关的特性，使用二进制相关操作实现时，常数非常小，实测效果优于后文中实现不好的“根号分治”gcd。

实现如下：

:::details 点击展开代码
```cpp
uint64_t gcd(int a, int b) {
    auto magnitude = [](int x) -> uint64_t {
        return x < 0 ? uint64_t(-int64_t(x)) : uint64_t(x);
    };
    uint64_t x = magnitude(a), y = magnitude(b);
    if (!x || !y)
        return x | y;
    int az = __builtin_ctzll(x);
    int bz = __builtin_ctzll(y);
    int z = min(az, bz);
    x >>= az, y >>= bz;
    while (x != y) {
        if (x > y)
            swap(x, y);
        y -= x;
        y >>= __builtin_ctzll(y);
    }
    return x << z;
}
```
:::

## 基于值域的 gcd 求法

令 $x,y\in[1,v]$。

### 分解质因数

令 $\omega(n)$ 表示 $n$ 的不同素因子个数，$\Omega(n)$ 表示计入重数后的素因子个数。例如 $12=2^2\times3$，则 $\omega(12)=2$、$\Omega(12)=3$。

线性筛预处理 $[1,v]$ 质数，枚举倍数预处理 $[1,v]$ 所有质因子及其指数，并存储其每一个质因子幂次的值。

求 $\gcd(x,y)$ 时，遍历 $x,y$ 质因子，对指数取 $\min$，其质因子幂次可以直接获取值。

当前方法对每个不同素因子只保存一组“素因子、指数”，因此预处理时空复杂度为 $O(\sum\limits_{i=1}^v\omega(i))$。一次询问合并 $x,y$ 的两组分解，时间复杂度为 $O(\omega(x)+\omega(y))$；最坏情况应写成 $O(\max_{t\le v}\omega(t))$，而不是 $O(\omega(v))$。


### “根号分治”

> 引理：$x=abc$，$a\le b\le c\le \sqrt n$ 或 $a\le b\le \sqrt n, c>\sqrt n\land v \in \mathbb P$。

求出 $[1,v]$ 所有数的 $a,b,c$ 分解。

具体求解过程为：
- $x=1,a=b=c=1$
- $x\in\mathbb P,a=b=1,c=x$
- $x>1\land x\not\in\mathbb P,\{a,b,c\}=\{pa_{\frac{x}{p}},b_{\frac{x}{p}},c_{\frac{x}{p}}\}$，其中 $p\mid x\land p\in [2,x)$，一般选取 $x$ 的最小质因子即可。

使用线性筛可以 $O(n)$ 预处理。

求 $\gcd(x,y)$ 时，依次令

$$
g_1=\gcd(a_x,y),\qquad
g_2=\gcd\left(b_x,\frac{y}{g_1}\right),\qquad
g_3=\gcd\left(c_x,\frac{y}{g_1g_2}\right),
$$

则 $\gcd(x,y)=g_1g_2g_3$。计算后一项前必须同时从 $y$ 中除去前面已经统计的因子，第三项的分母不能漏掉 $g_1$。

对于后三式，容易分讨：
- $y\le \sqrt n$，通过预处理 $[1,\sqrt v]$ 内的 $\gcd$，调用即可。
- $y> \sqrt n \land x\le \sqrt n$，$\gcd(x,y)=\gcd(x,y\bmod x)$，此时 $x\le \sqrt n,y\bmod x\le\sqrt n$，调用即可。
- $y> \sqrt n\land x> \sqrt n$，可得 $x\in\mathbb P\lor y\in\mathbb P$
  - $x\mid y\rightarrow \gcd(x,y)=x$
  - $x\nmid y\rightarrow \gcd(x,y)=1$

综上，预处理时空复杂度：$O(v)$，单次询问时间复杂度：$O(1)$。

:::details 点击展开代码
```cpp
void primes(int n) {
    is_prime.set();
    is_prime[0] = is_prime[1] = 0;
    for (int i = 4; i <= n; i += 2) {
        is_prime[i] = 0;
        minn[i] = 2;
    }
    for (int i = 3; i <= n / i; i++) {
        if (!is_prime[i])
            continue;
        for (int j = i * i; j <= n; j += 2 * i) {
            if (is_prime[j])
                minn[j] = i;
            is_prime[j] = 0;
        }
    }
    for (int i = 2; i <= n; i++)
        if (is_prime[i])
            minn[i] = i;

    x1[1] = x2[1] = x3[1] = 1;
    for (int i = 2; i <= n; i++) {
        if (is_prime[i]) {
            x1[i] = x2[i] = 1;
            x3[i] = i;
        } else {
            int now = i / minn[i];
            tmp[0] = x1[now] * minn[i];
            tmp[1] = x2[now];
            tmp[2] = x3[now];
            sort(tmp, tmp + 3);
            x1[i] = tmp[0], x2[i] = tmp[1], x3[i] = tmp[2];
        }
    }

    for (int i = 1; i <= sqt; i++) {
        res[i][0] = res[0][i] = i;
        for (int j = 1; j <= i; j++) {
            res[i][j] = res[j][i] = res[j][i % j];
        }
    }
}
int calc(int x, int y) {
    while (1) {
        if (x > y)
            swap(x, y);
        else if (y <= sqt)
            return res[x][y];
        else if (x <= sqt) {
            int z = y % x;
            y = x, x = z;
        } else if (y % x == 0)
            return x;
        else
            return 1;
    }
}
int gcd(int x, int y) {
    int a = calc(x1[x], y);
    int b = calc(x2[x], y / a);
    int c = calc(x3[x], y / a / b);
    return a * b * c;
}
```
:::

但是事实上，容易发现，这里把 $x$ 分解成了三个整数 $a,b,c$，还需要 `if-else` 分支。

实际上常数和“质因数分解”求法大概差两倍，更大的优势是空间严格线性。（虽然就算空间，在 $v\le 10^6$ 时，$O(\sum \omega(i))$ 和 $O(v)$ 也只差了大概两倍）

## gcd 的势能均摊

### 连续求 gcd 的均摊

欧几里得算法的一次迭代未必让新的较大数减半，但连续两次迭代后，较大数一定至少减半，因此单次 $\gcd$ 的迭代次数为 $O(\log V)$，其中 $V$ 是两个参数的最大值。

连续计算多个数的 gcd 时，可以使用势能分析。令当前累计答案依次为 $G_0,G_1,\dots,G_k$，计算 $G_i=\gcd(G_{i-1},a_i)$ 时，第一次取模计 $O(1)$，后续迭代次数可由 $G_{i-1}$ 到 $G_i$ 的缩小量控制。所有缩小量在整段过程中望远镜相消，因此总时间为 $O(k+\log V)$，而不是对每次操作都独立估计为 $O(\log V)$。

在通常把定长整数 gcd 视为常数时间操作的模型下，标准线段树 `build` 只访问 $O(n)$ 个节点并在每个内部节点合并一次，因此建树时间和空间均为 $O(n)$，区间询问为 $O(\log n)$。静态 ST 表则需要 $O(n\log n)$ 的预处理时间和空间，但区间 gcd 询问为 $O(1)$。

### 区间 gcd 的均摊

因为 gcd 相当于对质因子幂指数取 $\min$，所以每次减少最少 $\times \frac{1}{2}$，所以 $[i,i],...,[i,n]$ 这 $O(n)$ 个区间的 $\gcd$ 只会有 $O(\log n)$ 种取值，且是连续的。

从后向前，$i$ 从 $i+1$ 继承答案，那么就可以 $O(n\log n)$ 地处理出所有 $O(n\log n)$ 段本质不同区间 $\gcd$。
