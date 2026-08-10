<h1><center>取模运算</center></h1>

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

本节统一使用 $p$ 表示逆元所在的模数。下方 `Barrett` 结构体内部的成员 `m` 以及 `init`、`inv` 的参数 `mod` 均取值为 $p$，只是局部命名不同，并不表示其他模数。调用顺序必须是先执行 `barret.init(p)`，再执行逆元表的 `init(p)`。

该方法只处理质数模数 $p$，查询参数必须先规范化到 $1\le x<p$；$x\equiv0\pmod p$ 时逆元不存在。理论上取 $B=\lceil p^{1/3}\rceil$，预处理时间和空间为 $O(p/B+B^2)=O(p^{2/3})$，之后可以 $O(1)$ 查询逆元。

大致做法是利用 $x\cdot x^{-1}\equiv1\pmod p$。若能选择一个非零的 $u$，使 $v\equiv xu\pmod p$ 可以用绝对值较小的整数表示，就可以预处理 $v^{-1}$，并通过

$$
x^{-1}\equiv u\,v^{-1}\pmod p
$$

恢复 $x$ 的逆元。

具体地，将 $x$ 写成 $x=aB+b$，其中 $0\le b<B$，再寻找满足 $1\le |u|\le B$ 的 $u$，使 $aBu\bmod p$ 落在靠近 $0$ 或 $p$、长度为 $O(p/B)$ 的区间内。当 $B^3\ge p$ 时，有 $p/B\le B^2$，同时 $|bu|<B^2$，所以 $v=xu\bmod p$ 可以选取满足 $|v|<2B^2$ 的整数代表。预处理这些小范围整数的逆元后即可常数时间回答询问。

当前固定 `B = 300` 的实现必须满足以下前提：

- $p$ 是质数，并且 $B^3\ge p$。因此 `B = 300` 只能直接覆盖 $p\le 27\,000\,000$，不能覆盖常见的 $10^9$ 级模数。
- `res1`、`res2` 至少能访问到下标 $\lfloor p/B\rfloor$，`iv`、`_iv` 至少能访问到下标 $2B^2$，因此数组容量必须严格大于 $\max(\lfloor p/B\rfloor,2B^2)$。
- 当前 `iv` 的线性递推只适用于 $1\le i<p$。由于代码预处理到 $2B^2$，还需保证 $2B^2<p$；若不满足，应对该模数改用普通线性预处理、快速幂或扩展欧几里得算法。`B = 300` 时，这一条件是 $p>180\,000$。
- 所有送入快速取模的乘积都必须先在 `u64` 中计算，不能先以 32 位 `int` 相乘再隐式转换。当前代码涉及的中间量上界约为 $p(p+B)$；它必须能放入 `u64`，与预计算倒数相乘后的结果必须能放入 `u128`。若项目中的 `int` 是普通 32 位类型，应在每个乘法前显式转换为 `u64`。

因此，在不增加其他回退分支时，固定 `B = 300` 的这一模板实际上只适用于满足 $180\,000<p\le27\,000\,000$ 的质数模数，并要求上述数组容量和整数位宽条件同时成立。

下方 Barrett 实现使用 `u32 m` 保存模数、`u64 A` 保存待约简整数、`u128` 保存预计算倒数及乘积。它不是任意范围的取模：当前没有额外的商修正步骤，因此调用 `div(A)` 时应保证 $0\le A<2^{96}/m$，同时保证商 $\lfloor A/m\rfloor$ 能放入 `u32`，并保证 `A\times ivm` 不会溢出 `u128`。在本节的固定参数范围内，送入 `calc` 的中间量满足 $A<p(p+B)$，因而满足这些条件。

模数 $m=0$ 会导致初始化除零，必须禁止；模数 $m=1$ 没有逆元问题。当前模板已注明不处理 $m=2$，因此质模 $p=2$ 应直接特判：唯一非零剩余类 $1$ 的逆元仍为 $1$。其他不满足范围条件的小质数也应走普通逆元算法，而不是进入本模板。


:::details 点击展开代码
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
:::
