<style>
 body {
  font-family: "楷体"
}
</style>

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

在高精度意义下，时间复杂度为 $O(\log^2n)$，优于辗转相除法，且容易实现（高精度取模是 $O(\log^2n)$ 的，所以高精度意义下的辗转相除法是 $O(\log^3n)$ 的）。

注：但是由于其和二进制相关的特性，使用二进制相关操作实现时，常数非常小，实测效果优于后文中实现不好的“根号分治”gcd。

实现如下：

```cpp
int gcd(int a, int b) {
    if (!a | !b)
        return a | b;
    int az = __builtin_ctz(a);
    int bz = __builtin_ctz(b);
    int z = min(az, bz);
    a >>= az, b >>= bz;
    while (a != b) {
        int diff = b - a;
        az = __builtin_ctz(diff);
        b = min(a, b), a = abs(diff) >> az;
    }
    return a << z;
}
```

## 基于值域的 gcd 求法

令 $x,y\in[1,v]$。

### 分解质因数

令 $\pi(n)$ 表示 $n$ 的质因子数量。

线性筛预处理 $[1,v]$ 质数，枚举倍数预处理 $[1,v]$ 所有质因子及其指数，并存储其每一个质因子幂次的值。

求 $\gcd(x,y)$ 时，遍历 $x,y$ 质因子，对指数取 $\min$，其质因子幂次可以直接获取值。

综上，预处理时空复杂度：$O(\sum\limits_{i=1}^v \pi(i))$，单次询问时间复杂度：$O(\pi(v))$。


### “根号分治”

> 引理：$x=abc$，$a\le b\le c\le \sqrt n$ 或 $a\le b\le \sqrt n, c>\sqrt n\land v \in \mathbb P$。

求出 $[1,v]$ 所有数的 $a,b,c$ 分解。

具体求解过程为：
- $x=1,a=b=c=1$
- $x\in\mathbb P,a=b=1,c=x$
- $x>1\land x\not\in\mathbb P,\{a,b,c\}=\{pa_{\frac{x}{p}},b_{\frac{x}{p}},c_{\frac{x}{p}}\}$，其中 $p\mid x\land p\in [2,x)$，一般选取 $x$ 的最小质因子即可。

使用线性筛可以 $O(n)$ 预处理。

求 $\gcd(x,y)$ 时，$\gcd(x,y)=\gcd(a_x,y)\times \gcd(b_x,\frac{y}{\gcd(a_x,y)})\times \gcd(c_x,\frac{y}{\gcd(b_x,\frac{y}{\gcd(a_x,y)})})$。

对于后三式，容易分讨：
- $y\le \sqrt n$，通过预处理 $[1,\sqrt v]$ 内的 $\gcd$，调用即可。
- $y> \sqrt n \land x\le \sqrt n$，$\gcd(x,y)=\gcd(x,y\bmod x)$，此时 $x\le \sqrt n,y\bmod x\le\sqrt n$，调用即可。
- $y> \sqrt n\land x> \sqrt n$，可得 $x\in\mathbb P\lor y\in\mathbb P$
  - $x\mid y\rightarrow \gcd(x,y)=x$
  - $x\nmid y\rightarrow \gcd(x,y)=1$

综上，预处理时空复杂度：$O(v)$，单次询问时间复杂度：$O(1)$。

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

但是事实上，容易发现，这里把 $x$ 分解成了三个整数 $a,b,c$，还需要 `if-else` 分支。

实际上常数和“质因数分解”求法大概差两倍，更大的优势是空间严格线性。（虽然就算空间，在 $v\le 10^6$ 时，$O(\sum \pi(i))$ 和 $O(v)$ 也只差了大概两倍）

## gcd 的势能均摊

### 连续求 gcd 的均摊

$\gcd(x,y)=\gcd(y\bmod x,x)$ 的时间复杂度证明是基于 $y\bmod x$ 会至少缩小至一半，所以最多进行 $O(\log n)$ 次。

也就是时间复杂度是 $x,y$ 缩小的次数。

那么求解 $\gcd(x,y)$ 后，得到 $\gcd(0,x')$，认为操作次数为 $\log y+\log x-\log x'$。而后，若继续求 $\gcd(x',z)$，则第一次取模后，就会变成 $\gcd(z\bmod x',x')$，此时继续求解至 $\gcd(0,x'')$ 时，认为操作次数为 $\log x'+\log x'-\log x''$，总操作次数为 $\log y+\log x +\log x'-\log x''$，依次类推，若继续和其它数求 $\gcd$，易得最终操作次数近似为 $\log x+\log y$。

综上，对于多个数连续求 $\gcd$，时间复杂度仅为 $O(n+\log n)$ 而非 $O(n\log n)$。

由此得到的一个经典 trick 是：线段树维护区间 $\gcd$ 的时间复杂度是 $O(n\log n)$ 的，与 $\text{ST}$ 表维护区间 $\gcd$ 相同，且空间线性。

### 区间 gcd 的均摊

因为 gcd 相当于对质因子幂指数取 $\min$，所以每次减少最少 $\times \frac{1}{2}$，所以 $[i,i],...,[i,n]$ 这 $O(n)$ 个区间的 $\gcd$ 只会有 $O(\log n)$ 种取值，且是连续的。

从后向前，$i$ 从 $i+1$ 继承答案，那么就可以 $O(n\log n)$ 地处理出所有 $O(n\log n)$ 段本质不同区间 $\gcd$。