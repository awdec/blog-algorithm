<h1><center>基础-多项式全家桶</center></h1>

仅含【洛谷】紫以下多项式。

## FFT

设两多项式长度分别为 $n,m$，所需变换长度为不小于 $n+m-1$ 的最小的 $2$ 的幂 $L$。调用乘法前应先执行 `init(L)`；根表和 `rev` 按 $L$ 动态分配，不需要固定开到某个模数所支持的最大长度。

:::details 点击展开代码
```cpp
const ldb pi = acos(-1.0);
struct Complex {
    ldb x, y;
    Complex operator+(const Complex &t) const { return {x + t.x, y + t.y}; }
    Complex operator-(const Complex &t) const { return {x - t.x, y - t.y}; }
    Complex operator*(const Complex &t) const {
        return {x * t.x - y * t.y, x * t.y + y * t.x};
    }
};
vector<int> rev;
vector<array<Complex, 2>> g;
void init(int n) { // n 为预先确定的最大变换长度
    assert(n > 0 && (n & (n - 1)) == 0);
    rev.resize(n), g.resize(n);
    for (int mid = 1; mid < n; mid <<= 1) {
        g[mid][0] = Complex({cos(pi / mid), -sin(pi / mid)});
        g[mid][1] = Complex({cos(pi / mid), sin(pi / mid)});
    }
}
void fft(vector<Complex> &a, int sign, int tot) {
    assert((int)rev.size() >= tot && (int)g.size() >= tot);
    for (int i = 0; i < tot; i++)
        if (i < rev[i])
            swap(a[i], a[rev[i]]);

    for (int mid = 1; mid < tot; mid <<= 1) {
        auto w1 = g[mid][(sign + 1) / 2];
        for (int i = 0; i < tot; i += (mid << 1)) {
            auto wk = Complex({1, 0});
            for (int j = 0; j < mid; j++, wk = wk * w1) {
                auto x = a[i + j], y = wk * a[i + j + mid];
                a[i + j] = x + y, a[i + j + mid] = x - y;
            }
        }
    }
}
```
:::

## NTT

常见 NTT 模数及原根：
- $65537=2^{16}+1,g=3$
- $998244353=119\times 2^{23}+1,g=3$
- $1004535809=479\times 2^{21}+1,g=3$
- $4179340454199820289=29\times 2^{57}+1,g=3$
- $167772161=5\times 2^{25}+1,g=3$

NTT 的变换长度 $L$ 除了满足 $L\ge n+m-1$，还必须满足 $L\mid(mod-1)$。例如 $998244353$ 最多支持 $2^{23}$ 点 NTT，但实际容量仍应按程序中可能出现的最大变换长度分配；Newton 迭代等内部调用也要计入。下面的 `int` 模板适用于 $998244353$ 等 32 位模数；表中的 64 位模数需要使用 64 位存储和 `__int128` 或安全模乘，不能直接套用该模板。整数快速幂 `qz` 内的乘法也必须使用 64 位中间量。

:::details 点击展开代码
```cpp
vector<int> rev, g, inv_g;
void init(int n) { // n 为预先确定的最大变换长度
    assert(n > 0 && (n & (n - 1)) == 0 && (mod - 1) % n == 0);
    rev.resize(n), g.resize(n + 1), inv_g.resize(n + 1);
    for (int mid = 1; mid < n; mid <<= 1) {
        g[mid << 1] = qz(G, (mod - 1) / (mid << 1));
        inv_g[mid << 1] = qz(inv_G, (mod - 1) / (mid << 1));
    }
}
void ntt(vector<int> &a, int sign, int tot) {
    assert((int)rev.size() >= tot && (int)g.size() > tot);
    for (int i = 0; i < tot; i++)
        if (i < rev[i])
            swap(a[i], a[rev[i]]);
    for (int mid = 1; mid < tot; mid <<= 1) {
        int g1 = ~sign ? g[mid << 1] : inv_g[mid << 1];
        for (int i = 0; i < tot; i += (mid << 1)) {
            int gk = 1;
            for (int j = 0; j < mid; j++, gk = 1ll * gk * g1 % mod) {
                int x = a[i + j], y = 1ll * gk * a[i + j + mid] % mod;
                a[i + j] = (x + 1ll * y) % mod;
                a[i + j + mid] = (x - 1ll * y + mod) % mod;
            }
        }
    }
    if (sign == -1) {
        int inv = qz(tot, mod - 2);
        for (int i = 0; i < tot; i++)
            a[i] = 1ll * a[i] * inv % mod;
    }
}
```
:::

## 多项式乘法

:::details 点击展开代码
```cpp
vector<int> mul(vector<int> a, vector<int> b) {
    int tot = 0, bit = 0;
    int n = a.size(), m = b.size();
    while ((1 << bit) <= n - 1 + m - 1)
        bit++;
    tot = 1 << bit;
    assert((int)rev.size() >= tot && (int)g.size() > tot);
    a.resize(tot), b.resize(tot);
    vector<int> c(tot);
    for (int i = 0; i < tot; i++)
        rev[i] = (rev[i >> 1] >> 1) | ((i & 1) * (tot >> 1));
    ntt(a, 1, tot), ntt(b, 1, tot);
    for (int i = 0; i < tot; i++)
        c[i] = 1ll * a[i] * b[i] % mod;
    ntt(c, -1, tot);
    c.resize(n + m - 1);
    return c;
}
```
:::

FFT 处理多项式乘法时，特殊处理：

:::details 点击展开代码
```cpp
vector<int> mul(vector<int> a, vector<int> b) {
    vector<Complex> A(a.size()), B(b.size());
    for (int i = 0; i < A.size(); i++)
        A[i].x = a[i];
    for (int i = 0; i < B.size(); i++)
        B[i].x = b[i];

    int tot = 0, bit = 0;
    int n = A.size(), m = B.size();
    while ((1 << bit) <= n - 1 + m - 1)
        bit++;
    tot = 1 << bit;
    assert((int)rev.size() >= tot && (int)g.size() >= tot);
    A.resize(tot), B.resize(tot);
    for (int i = 0; i < tot; i++)
        rev[i] = (rev[i >> 1] >> 1) | ((i & 1) * (tot >> 1));
    fft(A, 1, tot), fft(B, 1, tot);
    for (int i = 0; i < tot; i++)
        A[i] = A[i] * B[i];
    fft(A, -1, tot);
    vector<int> c(n + m - 1);
    for (int i = 0; i < n + m - 1; i++)
        c[i] = (int)llround(A[i].x / tot);
    return c;
}
```
:::

这里假设输入系数为整数，且真实卷积系数与浮点计算结果的绝对误差小于 $0.5$，才能用 `llround` 唯一还原。若输入系数绝对值分别不超过 $A,B$，则单个卷积系数的绝对值至多为 $\min(n,m)AB$；上述返回类型还要求该值不超过 `int` 范围。长度或系数过大时应使用拆系数 FFT、NTT/CRT，不能把浮点舍入视为无条件精确。

## 任意模数多项式乘法

设两多项式的长度分别为 $n,m$，输入系数的绝对值不超过 $V$，则整数卷积的单个系数绝对值至多为 $B=\min(n,m)V^2$。所以“任意模数多项式乘法”并不是真正脱离值域限制，而是先借助若干 NTT 模数恢复整数卷积，再对目标模数取模。

一种朴素实现是三模数 NTT，需要 $9$ 次 DFT，常数较大。

具体实现为选取三个两两互质的 NTT 模数，进行三次 NTT，得到同余方程组，再用 CRT 或 Garner 算法合并。设组合模数为 $M$：若待恢复系数非负，需要 $M>B$；若允许负系数并采用中心剩余表示，则需要 $M>2B$，将大于 $M/2$ 的结果解释为负数后再对目标模数取模。

三个约 $10^9$ 的模数之积会超过 64 位整数范围，不能直接计算 `m1 * m2 * m3`。实现时应使用 `__int128`、安全模乘，或用 Garner 算法直接在目标模数下合并，并保证每一步乘法的中间类型足够宽。

这里仅提供使用的三个 NTT 模数。

:::details 点击展开代码
```cpp
const int mod[3] = {998244353, 469762049, 1004535809},
          inv_G[3] = {332748118, 156587350, 334845270}, G = 3;
```
:::

拆系数 FFT，需要 $4$ 次 DFT，常数较小。

## 多项式乘法逆

以下在素数模数 $mod$ 下计算 $a(x)^{-1}\bmod x^n$，要求 $a_0\ne0$。更一般地，常数项必须在系数环中可逆；代码中的 $a_0^{mod-2}$ 只适用于素数模数。

时间复杂度：$O(n\log n)$。

:::details 点击展开代码
```cpp
vector<int> inv(vector<int> &a) {
    int n = a.size();
    vector<int> A, B, b = {qz(a[0], mod - 2)};
    for (int len = 1, tot; len < (n << 1); len <<= 1) {
        tot = len << 1;
        A.resize(tot), B.resize(tot);
        for (int i = 0; i < len; i++) {
            A[i] = i < a.size() ? a[i] : 0, B[i] = i < b.size() ? b[i] : 0;
        }
        for (int i = 0; i < tot; i++)
            rev[i] = (rev[i >> 1] >> 1) | ((i & 1) * (tot >> 1));
        ntt(A, 1, tot), ntt(B, 1, tot);
        b.resize(tot);
        for (int i = 0; i < tot; i++)
            b[i] = (2ll - 1ll * A[i] * B[i] % mod + mod) * B[i] % mod;
        ntt(b, -1, tot);
        b.resize(len);
    }
    b.resize(n);
    return b;
}
```
:::

## 多项式开根

以下均在奇素数模数下计算 $b(x)^2\equiv a(x)\pmod{x^n}$，所有迭代结果都只保留前 $n$ 项。先保证 $a_0=1$，并选择 $b_0=1$ 这一支：

:::details 点击展开代码
```cpp
vector<int> sqrt(vector<int> &a) {
    int n = a.size();
    vector<int> A, B, b = {1};
    for (int len = 1, tot; len < (n << 1); len <<= 1) {
        tot = len << 1;
        A.resize(tot);
        for (int i = 0; i < len; i++)
            A[i] = i < a.size() ? a[i] : 0;
        b.resize(len);
        B = inv(b);
        B.resize(tot);
        for (int i = 0; i < tot; i++)
            rev[i] = (rev[i >> 1] >> 1) | ((i & 1) * (tot >> 1));
        ntt(A, 1, tot), ntt(B, 1, tot);
        for (int i = 0; i < tot; i++)
            A[i] = 1ll * A[i] * B[i] % mod;
        ntt(A, -1, tot);
        for (int i = 0; i < len; i++)
            b[i] = (1ll * b[i] + A[i]) * inv_2 % mod;
    }
    b.resize(n);
    return b;
}
```
:::

若 $a_0\ne0$ 且是模意义下的二次剩余，先用 Cipolla 等算法求一个根 $r$，再把 Newton 迭代的初值改为 `b = {r}`；选择 $r$ 或 $mod-r$ 会得到常数项不同的两支平方根。若 $a_0=0$，还需要先处理最低非零项的次数，不能直接套用这段迭代。

:::details 点击展开代码
```cpp
int I_mul_I;
struct Complex {
    int real, imag;
    Complex(int real = 0, int imag = 0) : real(real), imag(imag) {}
    bool operator==(const Complex &x) const {
        return x.real == real && x.imag == imag;
    }
    Complex operator*(const Complex &x) const {
        return Complex((1ll * x.real * real + 1ll * I_mul_I * x.imag % mod * imag) % mod,
                       (1ll * x.imag * real + 1ll * x.real * imag) % mod);
    }
};
Complex qz(Complex x, int y) {
    Complex res = 1;
    for (; y; y >>= 1) {
        if (y & 1)
            res = res * x;
        x = x * x;
    }
    return res;
}
bool check(int x) { return qz(x, mod - 1 >> 1) == 1; }
int solve(int n) { // 求解 n 的二次剩余
    if (!n)
        return 0;
    if (!check(n))
        return -1;
    int a = rand() % mod;
    while (!a || check((1ll * a * a + mod - n) % mod))
        a = rand() % mod;
    I_mul_I = (1ll * a * a + mod - n) % mod;
    return qz(Complex(a, 1), mod + 1 >> 1).real;
}

```
:::

## 多项式除法

以下假设系数数组已经去除无意义的高位零，且除式 $b(x)$ 非零；反转后用于求逆的常数项就是 $b(x)$ 的最高次项，因此它必须在模意义下可逆。当 $\deg a<\deg b$ 时，商为零、余数为 $a(x)$，应直接返回。

:::details 点击展开代码
```cpp
pair<vector<int>, vector<int>> divide(vector<int> a, vector<int> b) {
    int n = a.size(), m = b.size();
    if (n < m)
        return {{0}, a};
    auto ar = a, br = b;
    reverse(ar.begin(), ar.end());
    reverse(br.begin(), br.end());
    ar.resize(n - m + 1), br.resize(n - m + 1);
    auto now = inv(br);
    auto cr = mul(ar, now);
    cr.resize(n - m + 1);
    reverse(cr.begin(), cr.end());
    auto cur = subtract(a, mul(b, cr));
    return {cr, cur};
}
```
:::

## 多项式 ln

以下按 $\ln a(x)=\int a'(x)/a(x)\,dx$ 计算 $\ln a(x)\bmod x^n$。保证 $a_0=1$；在素数模数下还需 $n\le mod$，使积分中出现的 $1,2,\ldots,n-1$ 都可逆。

:::details 点击展开代码
```cpp
vector<int> ln(vector<int> &a) {
    int n = a.size();
    vector<int> A(n - 1);
    for (int i = 1; i < n; i++)
        A[i - 1] = 1ll * a[i] * i % mod;
    auto B = inv(a);

    int bit = 0;
    while ((1 << bit) < (n << 1))
        bit++;
    int tot = 1 << bit;
    A.resize(tot), B.resize(tot);
    for (int i = 0; i < tot; i++)
        rev[i] = (rev[i >> 1] >> 1) | ((i & 1) * (tot >> 1));

    ntt(A, 1, tot), ntt(B, 1, tot);
    for (int i = 0; i < tot; i++)
        A[i] = 1ll * A[i] * B[i] % mod;
    ntt(A, -1, tot);

    vector<int> b(n);
    for (int i = 1; i < n; i++)
        b[i] = 1ll * A[i - 1] * iv[i] % mod; // i 的逆元
    return b;
}
```
:::

## 多项式 exp

以下计算 $\exp(a(x))\bmod x^n$，并选择常数项为 $1$ 的形式幂级数解。保证 $a_0=0$；在素数模数下同样需要 $n\le mod$，使相关阶乘和积分分母可逆。

:::details 点击展开代码
```cpp
vector<int> exp(vector<int> &a) {
    int n = a.size();
    vector<int> b = {1}, A, B;
    for (int len = 1, tot; len < (n << 1); len <<= 1) {
        tot = len << 1;
        A.resize(tot);
        for (int i = 0; i < len; i++)
            A[i] = i < n ? a[i] : 0;
        b.resize(len);
        B = ln(b);
        b.resize(tot), B.resize(tot);
        for (int i = 0; i < tot; i++)
            rev[i] = (rev[i >> 1] >> 1) | ((i & 1) * (tot >> 1));
        ntt(b, 1, tot), ntt(A, 1, tot), ntt(B, 1, tot);
        for (int i = 0; i < tot; i++)
            b[i] = (1ll - B[i] + A[i] + mod) * b[i] % mod;
        ntt(b, -1, tot);
        b.resize(len);
    }
    b.resize(n);
    return b;
}
```
:::

## 多项式幂

以下约定 $0^0=1$，指数 $k$ 为非负整数，所有结果均截断至模 $x^n$。


先考虑 $a_0=1$。

在素数模数 $mod$ 下，若截断长度满足 $n\le mod$，可以使用

$$
a(x)^k=\exp(k\ln a(x))\pmod{x^n}.
$$

此时传给 `exp` 的标量 $k$ 可以对 $mod$ 取模。这依赖于次数低于模数、积分分母均可逆，不能作为任意特征和任意截断次数下的指数降模规则。

也可以直接快速幂，时间复杂度为 $O(M(n)\log k)=O(n\log n\log k)$；当 $k$ 的位数为 $O(\log n)$ 时可写成 $O(n\log^2 n)$。

:::details 点击展开代码
```cpp
vector<int> qz(vector<int> &a, int k) {
    int n = a.size();
    auto x = a;
    vector<int> res = {1};
    int bit = 1;
    while (bit < (n << 1))
        bit <<= 1;
    x.resize(bit), res.resize(bit);
    int tot = bit;
    for (int i = 0; i < tot; i++)
        rev[i] = (rev[i >> 1] >> 1) | ((i & 1) * (tot >> 1));
    for (; k; k >>= 1) {
        x.resize(tot), ntt(x, 1, tot);
        if (k & 1) {
            res.resize(tot), ntt(res, 1, tot);
            for (int i = 0; i < tot; i++) {
                res[i] = 1ll * res[i] * x[i] % mod;
            }
            ntt(res, -1, tot), res.resize(n);
        }
        for (int i = 0; i < tot; i++) {
            x[i] = 1ll * x[i] * x[i] % mod;
        }
        ntt(x, -1, tot), x.resize(n);
    }
    res.resize(n);
    return res;
}
```
:::

ln + exp，时间复杂度：$O(n\log n)$。

:::details 点击展开代码
```cpp
vector<int> qz(vector<int> &a, int k) {
    auto A = ln(a);
    int n = a.size();
    for (int i = 0; i < n; i++)
        A[i] = 1ll * A[i] * k % mod;
    return exp(A);
}
```
:::

一般情况下，设 $t$ 是 $a(x)$ 最低非零项的次数、该项系数为 $c$，则可以写成

$$
a(x)=x^t c\,b(x),\qquad b_0=1,
$$

从而

$$
a(x)^k=x^{tk}c^k b(x)^k\pmod{x^n}.
$$

必须先用**原始指数**判断 $tk$：若 $k>0$ 且 $tk\ge n$，结果为零；否则只需求 $b(x)^k\bmod x^{n-tk}$，乘上 $c^k$ 后整体右移 $tk$ 位。不能先对 $k$ 取模再计算次数平移。若 $a(x)$ 是零多项式，则 $k>0$ 时结果为零，$k=0$ 时按上述约定返回 $1$。

在素数模数 $mod$ 下，$c\ne0$ 时可用费马小定理将 $c^k$ 的指数对 $mod-1$ 取模；而使用 `ln + exp` 计算 $b(x)^k$ 时，只有在所需截断长度不超过 $mod$ 的前提下，标量 $k$ 才可对 $mod$ 取模。两处降模的对象和条件不同。对于合数模数，只有 $c$ 与模数互质时才能使用欧拉定理，形式对数与指数也不能直接沿用上述素数域模板。

## 拉格朗日插值

$n$ 个模意义下互不相同的点，可以确定一个不超过 $n-1$ 次的多项式。以下代码使用费马小定理求逆，因此假设模数为素数，且输入坐标已经规范化到 $[0,mod)$。

拉格朗日插值 $O(n^2)$ 根据 $n$ 个坐标求 $f(k)$。

插值公式：

$$f(k)=\sum\limits_{i=0}^{n-1} y_i\prod\limits_{\substack{0\le j<n\\j\ne i}}\frac{k-x_j}{x_i-x_j}$$

按照公式计算即可。


:::details 点击展开代码
```cpp
int f(vector<int> &x, vector<int> &y, int k) {
    int n = x.size();
    int ans = 0;
    for (int i = 0; i < n; i++) {
        int fz = y[i], fm = 1;
        for (int j = 0; j < n; j++) {
            if (i == j)
                continue;
            fz = 1ll * fz * (k - x[j] + mod) % mod;
            fm = 1ll * fm * (x[i] - x[j] + mod) % mod;
        }
        ans = (ans + 1ll * fz * qz(fm, mod - 2)) % mod;
    }
    if (ans < 0)
        ans += mod;
    return ans;
}
```
:::


特别地，若给定的坐标连续，可以 $O(n)$ 求 $f(k)$。

具体而言，若给定 $(i,f(i)),i\in[0,n]$，这些 $n+1$ 个采样点需要在模意义下互不相同，因此要求 $n<mod$。令 $S=\prod\limits_{j=0}^n(k-j)$，当 $k$ 不等于任一采样点时：

$$
f(k)=\sum\limits_{i=0}^n f(i)\frac{(-1)^{n-i}S}{(k-i)i!(n-i)!}.
$$

若 $k\equiv i\pmod{mod}$，上式会出现形式上的 $0/0$，应直接返回样本值 $f(i)$。也可以预处理

$$
pre_i=\prod\limits_{j=0}^{i-1}(k-j),\qquad
suf_i=\prod\limits_{j=i}^{n}(k-j),
$$

并统一使用

$$
f(k)=\sum\limits_{i=0}^n f(i)\,pre_i\,suf_{i+1}
\frac{(-1)^{n-i}}{i!(n-i)!},
$$

其中 $pre_0=suf_{n+1}=1$。预处理阶乘、逆阶乘以及前后缀积后即可 $O(n)$ 求解，该写法在查询点恰好是采样点时也不会除以零。
