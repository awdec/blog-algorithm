<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>基础-多项式全家桶</center></h1>

仅含【洛谷】紫以下多项式。

## FFT

## NTT

常见 NTT 模数及原根：
- $65537=2^{16}+1,g=3$
- $998244353=119\times 2^{23}+1,g=3$
- $1004535809=479\times 2^{21}+1,g=3$
- $4179340454199820289=29\times 2^{57}+1,g=3$
- $167772161=5\times 2^{25}+1,g=3$

```cpp
void init(int n) { // 预处理 n 不小于到卷积后的最高位的 2 的幂次
    for (int mid = 1; mid < n; mid <<= 1) {
        gg[mid << 1] = qz(G, (mod - 1) / (mid << 1));
        inv_gg[mid << 1] = qz(inv_G, (mod - 1) / (mid << 1));
    }
}
void ntt(vector<int> &a, int sign, int tot) {
    for (int i = 0; i < tot; i++)
        if (i < rev[i])
            swap(a[i], a[rev[i]]);
    for (int mid = 1; mid < tot; mid <<= 1) {
        int g1 = ~sign ? gg[mid << 1] : inv_gg[mid << 1];
        for (int i = 0; i < tot; i += (mid << 1)) {
            int gk = 1;
            for (int j = 0; j < mid; j++, gk = gk * g1 % mod) {
                int x = a[i + j], y = gk * a[i + j + mid] % mod;
                a[i + j] = (x + y) % mod, a[i + j + mid] = (x - y + mod) % mod;
            }
        }
    }
    if (sign == -1) {
        int inv = qz(tot, mod - 2);
        for (int i = 0; i < tot; i++)
            a[i] = a[i] * inv % mod;
    }
}
```

## 多项式乘法

```cpp
vector<int> mul(vector<int> a, vector<int> b) {
    int tot = 0, bit = 0;
    int n = a.size(), m = b.size();
    while ((1 << bit) <= n - 1 + m - 1)
        bit++;
    tot = 1 << bit;
    a.resize(tot), b.resize(tot);
    vector<int> c(tot);
    for (int i = 0; i < tot; i++)
        rev[i] = (rev[i >> 1] >> 1) | ((i & 1) * (tot >> 1));
    ntt(a, 1, tot), ntt(b, 1, tot);
    for (int i = 0; i < tot; i++)
        c[i] = a[i] * b[i] % mod;
    ntt(c, -1, tot);
    c.resize(n + m - 1);
    return c;
}
```

## 任意模数多项式乘法

做一次多项式乘法的值域是 $nV^2$，所以任意模数多项式乘法并不是真正的任意模数，只是基于值域实现了先计算后取模的多项式乘法。

一种朴素实现是三模数 NTT，需要 $9$ 次 DFT，常数较大。

具体实现为选取三个不同的 NTT 模数，进行三次 NTT，得到同余方程组，根据 Garner 表示出最终的系数，再取模。

这里仅提供使用的三个 NTT 模数。

```cpp
const int mod[3] = {998244353, 469762049, 1004535809},
          inv_G[3] = {332748118, 156587350, 334845270}, G = 3;
```

拆系数 FFT，需要 $4$ 次 DFT，常数较小。

## 多项式乘法逆

时间复杂度：$O(n\log n)$。

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
            b[i] = (2ll - A[i] * B[i] % mod + mod) * B[i] % mod;
        ntt(b, -1, tot);
        b.resize(len);
    }
    b.resize(n);
    return b;
}
```

## 多项式开根

保证 $a_0=1$：

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
            A[i] = A[i] * B[i] % mod;
        ntt(A, -1, tot);
        for (int i = 0; i < len; i++)
            b[i] = (b[i] + A[i]) * inv_2 % mod;
    }
    b.resize(n);
    return b;
}
```

保证 $a_0$ 是模意义下的二次剩余，$a_0\ne 0$，其它部分完全一致，区别在于求解 $a_0$ 的二次剩余。

```cpp
int I_mul_I;
struct Complex {
    int real, imag;
    Complex(int real = 0, int imag = 0) : real(real), imag(imag) {}
    bool operator==(const Complex &x) const {
        return x.real == real && x.imag == imag;
    }
    Complex operator*(const Complex &x) const {
        return Complex((x.real * real + I_mul_I * x.imag % mod * imag) % mod,
                       (x.imag * real + x.real * imag) % mod);
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
    while (!a || check((a * a + mod - n) % mod))
        a = rand() % mod;
    I_mul_I = (a * a + mod - n) % mod;
    return qz(Complex(a, 1), mod + 1 >> 1).real;
}

```

## 多项式除法

```cpp
pair<vector<int>, vector<int>> divide(vector<int> a, vector<int> b) {
    int n = a.size(), m = b.size();
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

## 多项式 ln

保证 $a_0=1$。

```cpp
vector<int> ln(vector<int> &a) {
    int n = a.size();
    vector<int> A(n - 1);
    for (int i = 1; i < n; i++)
        A[i - 1] = a[i] * i % mod;
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
        A[i] = A[i] * B[i] % mod;
    ntt(A, -1, tot);

    vector<int> b(n);
    for (int i = 1; i < n; i++)
        b[i] = A[i - 1] * iv[i] % mod; // i 的逆元
    return b;
}
```

## 多项式 exp

保证 $a_0=0$。

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

## 多项式幂

特殊处理 $0^0 = 1$


保证 $a_0=1$。

$a_0=1$ 时，应用 ln + exp，可以先将模数 $k$ 对 $mod$ 取模。

快速幂，时间复杂度：$O(n\log^2 n)$。

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
                res[i] = res[i] * x[i] % mod;
            }
            ntt(res, -1, tot), res.resize(n);
        }
        for (int i = 0; i < tot; i++) {
            x[i] = x[i] * x[i] % mod;
        }
        ntt(x, -1, tot), x.resize(n);
    }
    return res;
}
```

ln + exp，时间复杂度：$O(n\log n)$。

```cpp
vector<int> qz(vector<int> &a, int k) {
    auto A = ln(a);
    int n = a.size();
    for (int i = 0; i < n; i++)
        A[i] = A[i] * k % mod;
    return exp(A);
}
```

不保证 $a_0=1$。

特殊处理，$a_0=0$，此时多项式幂没有常数项，最低位 $\times k\ge n$ 多项式幂系数即为全 $0$。

本质和 $a_0=1$ 是一样的，只要把 $a$ 提取一个因式，使得 $b(x)\times a'(x)=a(x),a'_0=1$，对 $b(x),a'(x)$ 分别做多项式幂即可。

注：容易发现 $b(x)$ 只有一个非零系数项，$b(x)^k$ 的 $k$ 对 $\varphi(mod)$ 取模，$a'(x)^k$ 的 $k$ 对 $mod$ 取模，因为 $b(x)$ 相当于是常数项，指数应用欧拉定理取模。

因为本质还是 $a_0=1$ 时的多项式幂，所以代码略。

## 拉格朗日插值

$n$ 个不同点，可以确定一个 $n-1$ 次多项式。

拉格朗日插值 $O(n^2)$ 根据 $n$ 个坐标求 $f(k)$。

插值公式：

$$f(k)=\sum\limits_{i=0}^n y_i\prod\limits_{i\ne j}\frac{k-x_j}{x_i-x_j}$$

按照公式计算即可。


```cpp
int f(vector<int> &x, vector<int> &y, int k) {
    int n = x.size();
    int ans = 0;
    for (int i = 0; i < n; i++) {
        int fz = y[i], fm = 1;
        for (int j = 0; j < n; j++) {
            if (i == j)
                continue;
            fz = fz * (k - x[j]) % mod;
            fm = fm * (x[i] - x[j]) % mod;
        }
        ans = (ans + fz * qz(fm, mod - 2) % mod) % mod;
    }
    if (ans < 0)
        ans += mod;
    return ans;
}
```


特别地，若给定的坐标连续，可以 $O(n)$ 求 $f(k)$。

具体而言，若给定 $(i,f(i)),i\in[0,n],S = \prod\limits_{i=0}^n (k-i)$：

$$f(k)=\sum\limits_{i=0}^n f(i)\times S\times (k-i)^{-1}\times (i!\times (n-i)!)^{-1}$$

预处理逆元即可 $O(n)$ 求解。