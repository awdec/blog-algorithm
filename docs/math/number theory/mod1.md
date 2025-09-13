<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>模</center></h1>

由于“同余”的篇幅过大，模意义的一些基础概念单开一页。

## 阶：

若正整数 $m,a$，满足 $\gcd(a,m)=1$，则使得 $a^n\equiv 1 \pmod m$ 的最小正整数 $n$ 称为 $a$ 模 $m$ 的阶，记作 $\delta_m(a)$。

### 性质
- $a^0,a^1,\dots,a^{\delta-1}$ 在模 $m$ 意义下两两不同
- $a^{\gamma}\equiv a^{\gamma'}\pmod m\Leftrightarrow \gamma\equiv\gamma'\pmod \delta$
- $\delta\mid\varphi(m)$

## 逆元：

若正整数 $m,a,b$，满足 $ab\equiv 1\pmod m$，则称 $a,b$ 互为逆元。

### 求解

> $\gcd(a,m)=1\Leftrightarrow \exists\ b,\ ab\equiv 1\pmod m$

求解逆元等价于解同余方程 $ax\equiv 1\pmod m$，使用 exgcd 求解即可，逆元存在定理也等价于裴蜀引理。

时间复杂度：$O(\log n)$。

### 预处理 $n$ 个数的逆元

#### 预处理 $1\sim n$ 模质数 $p$ 的逆元：

$i^{-1}\equiv (p-\lfloor\dfrac{p}{i}\rfloor)\times (p\bmod i)^{-1}\pmod p$

线性递推即可，$O(n)$。

注：若 $p$ 不为质数，$1\sim n$ 中可能会存在 $i$ 不存在 $i^{-1}$，那么无法递推。

#### 预处理任意 $n$ 个数模质数 $p$ 的逆元：

令 $S\equiv \prod\limits_{i=1}^n a_i\pmod p$，使用 exgcd/费马小定理结合快速幂 求解 $S^{-1}$。

$(\prod\limits_{i=1}^m a_i)^{-1}=(\prod\limits_{i=1}^{m+1} a_i)^{-1}\times a_{m+1}$，反向递推可得每一个前缀积的逆元。

$$a_x^{-1}=(\prod\limits_{i=1}^{x-1}a_i)\times (\prod\limits_{i=1}^x a_i)^{-1}$$

时间复杂度：$O(n+\log p)$。

通常使用这种方式预处理阶乘和阶乘的逆元 $O(1)$ 询问组合数。

### $O(1)$ 在线逆元

科技。

预处理时间复杂度：$O(p^{\frac{2}{3}})$，在线 $O(1)$ 询问逆元。

大致做法是，对于 $x^{-1}\equiv 1\pmod p$，若能选择一个 $u$ 使得 $xu\pmod p$ 的值较小，那么可以 $O(v)$ 预处理，$O(1)$ 询问 $xu$ 的逆元，那么 $x^{-1}\equiv (xu)^{-1}\times u\pmod p$。

考虑分块，$x=at+b$，令 $t=p^{\frac{1}{3}},u\le p^{\frac{1}{3}}$，那么 $bu\le p^{\frac{2}{3}}$，为了均衡，$atu$ 模意义下的值域范围也要是 $O(p^{\frac{2}{3}})$，$bu$ 一定是 $[0,p^{\frac{2}{3}}]$，那么 $atu$ 可以是 $[p-p^{\frac{2}{3}},p+p^{\frac{2}{3}}]$。

可以证明这样对于上述范围下的 $ut$ 的 $a$ 一定存在。

枚举 $u\in[1,p^\frac{1}{3}]$，找到 $a$ 满足 $a\times tu\in[p-p^{\frac{2}{3}},p)\lor [0,p^{\frac{2}{3}}]$，因为 $tu$ 在枚举 $u$ 时是定值，这个 $a$ 可以直接通过除法得到。


```cpp
const int N = (1 << 21) | 1;
const int B = 300; // 需要满足 B^3 >= mod
int res1[N], res2[N], iv[N], _iv[N];
struct Barrett {
    enum { s = 96 };
    static constexpr u128 s2 = u128(1) << s;
    u32 m;
    u128 ivm;
    void init(u32 m_) { m = (m_), ivm = ((s2 - 1) / m + 1); }
    u32 div(u64 a) const { return a * ivm >> s; }
    u32 calc(u64 a) const { return a - u64(div(a)) * m; }
} barret; // 顺带实现了 barrett 快速取模，不能处理模数为 2 的情况
void init(int mod) {
    int lim = mod / B;
    int _lim = -lim + mod;
    for (int u = 1; u <= B; u++) {
        int d = u * B;
        int a = 0;
        for (int i = 0; i <= lim; i++) {
            if (a <= lim) {
                res1[i] = u;
            } else if (a >= _lim) {
                res1[i] = -u;
            } else {
                int r = (_lim - a - 1) / d;
                a += r * d;
                i += r;
            }
            a += d;
            if (a >= mod)
                a -= mod;
        }
    }

    for (int a = 0; a <= lim; a++)
        res2[a] = barret.calc((a * B) * (res1[a] + mod));

    iv[1] = 1;

    for (int i = 2; i < 2 * B * B + 1; i++)
        iv[i] = barret.calc(iv[mod % i] * (mod - mod / i));

    for (int i = 1; i < 2 * B * B + 1; i++)
        _iv[i] = mod - iv[i];
}
int inv(int x, int mod) {
    if (mod < B)
        return iv[x];
    int a = x / B, b = x % B;
    int u = res1[a];
    int v = (res2[a] + b * u);
    if (v < 0)
        return barret.calc((u + mod) * _iv[-v]);
    return barret.calc((u + mod) * iv[v]);
}
barret.init(p);
init(p);
```