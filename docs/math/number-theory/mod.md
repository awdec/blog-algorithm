<h1><center>同余</center></h1>

## 扩展欧几里得算法

用于求解 $ax+by=\gcd(a,b)$ 的一组可行解。

$$ax_1+by_1=\gcd(a,b)=\gcd(b\bmod a,a)=(b\bmod a)x_2+ay_2$$

将上式展开：

$$ax_1+by_1=(b-\lfloor\frac{b}{a}\rfloor\times a)x_2+ay_2$$

因为只要求找到一组合法解，所以可以构造：

$$\begin{cases}
    y_1=x_2\\x_1=y_2-\lfloor\frac{b}{a}\rfloor\times x_2
\end{cases}$$

所以，在辗转相除法求解 $\gcd(a,b)$ 的时候，递归迭代 $x,y$ 即可得到一组构造解。

递归边界是 $\gcd(0,a)$，此时 $0\times x+a\times y=\gcd(0,a)=a$。

解得：$y=1,x\in \mathbb Z$，但是根据不同的 $x$ 的取值，迭代结果的值域也是不同的，可以证明当 $x=0$ 时，迭代结果的值的绝对值是不超过 $\max(a,b)$ 的。

感性地理解，每次 $x_1=y_2-\lfloor\frac{b}{a}\rfloor\times x_2$ 累乘了 $\lfloor\frac{b}{a}\rfloor$，那么最终就会不超过 $\max(a,b)$ 因为是一路乘上去的，$y_2-\lfloor\frac{b}{a}\rfloor\times x_2$ 不会使绝对值变大。

那么，$x=z\neq 0$，结果值域可以近似认为扩大了 $z$ 倍。

所以取 $x=0,y=1$ 反代即可。 

上述过程只是求出了 $ax+by=\gcd(a,b)$ 的一组特解。

:::details 点击展开代码
```cpp
void exgcd(int a, int b, int &x, int &y) {
    int t;
    if (!b) {
        x = 1, y = 0;
    } else {
        exgcd(b, a % b, x, y);
        t = x;
        x = y;
        y = t - (a / b) * y;
    }
}
```
:::

考虑通解：

因为 $x$ 确定时，$y$ 的解是唯一的，所以我们考虑 $x$ 的通解，$y$ 同理。

已知 $ax'+by'=\gcd(a,b)$，令 $x=x'+\delta\rightarrow a(x'+\delta)+by'=\gcd(a,b)$

$\delta$ 合法，当且仅当 $y'$ 有解，可得：$by'=\gcd(a,b)-a(x'+\delta)$，那么 $b\mid \gcd(a,b)-a(x'+\delta)$。

用 $ax'+by'$ 替换 $\gcd(a,b)$ 整理式子可得：$b\mid a\delta$。

所以 $b\mid a\delta$ 等价于 $\dfrac{b}{\gcd(a,b)}\mid\delta$，即 $\delta$ 必须是 $\dfrac{b}{\gcd(a,b)}$ 的整数倍。

综上，原方程关于 $x$ 的通解为：$x\equiv x'\pmod {\frac{b}{\gcd(a,b)}}$。

$y$ 同理，可得 $y\equiv y'\pmod {\frac{a}{\gcd(a,b)}}$。

### 求解二元一次方程整数解

> 裴蜀引理：$ax+by=c$ 有整数解当且仅当 $\gcd(a,b)\mid c$。

> 广义裴蜀引理：$\sum\limits_{i=1}^n a_ix_i=d$ 有整数解当且仅当 $\gcd(a_1,\dots,a_n)\mid d$

根据「裴蜀引理」，二元一次方程 $ax+by=c$ 若有解，则可以表示成：

$$ax+by=\frac{c}{\gcd(a,b)}\times \gcd(a,b)$$

使用 exgcd 求出 $ax+by=\gcd(a,b)$ 的一组特解，乘以 $\frac{c}{\gcd(a,b)}$ 得到 $ax+by=c$ 的一组特解：$x',y'$。

$a(x'+d)+b(y'-e)=c\Rightarrow ad=be\Rightarrow \frac{a}{\gcd(a,b)} d = \frac{b}{\gcd(a,b)} e\Rightarrow d = t\times \frac{b}{\gcd(a,b)}, e = t\times \frac{a}{\gcd(a,b)}$

代入原方程，可得：

原方程的通解为：$\begin{cases}
    x=x'+t\times \dfrac{b}{\gcd(a,b)}\\
    y=y'-t\times \dfrac{a}{\gcd(a,b)}
\end{cases}$

### 求解线性同余方程

对于线性同余方程 $ax\equiv b\pmod c$，可以改写成 $ax+cy=b$ 的形式，看作二元一次方程求整数解即可。

:::details 点击展开代码
```cpp
int tyfc(int a, int b, int c) {
    b %= c;
    int x, y;
    if (b % gcd(a, c))
        return -1;
    exgcd(a, c, x, y);
    int g = gcd(a, c);
    x *= b / g;
    c /= g;
    x = (x % c + c) % c;
    return x;
}
```
:::

## 欧拉定理

$$a^{\varphi(b)}\equiv 1\pmod b,\gcd(a,b)=1$$

> 费马小定理：$a^{p-1}\equiv 1\pmod p$，其中 $p\in\mathbb P$ 且 $p\nmid a$。

费马小定理是欧拉定理在 $b\in\mathbb P$ 时的特殊情况。

## 扩展欧拉定理

$$a^b\equiv\begin{cases}a^{b\bmod\varphi(m)}&\gcd(a,m)=1\\a^b&\gcd(a,m)\ne 1,b<\varphi(m)\\a^{(b\bmod\varphi(m))+\varphi(m)}&\gcd(a,m)\ne 1,b\ge \varphi(m)\end{cases}\pmod m$$

用于大指数取模。

### 欧拉降幂

求 $a^{a^{a^{.^{.^{.}}}}}\bmod m$ 时，需要随模数递归计算指数。只有在 $\gcd(a,m)=1$ 时，才能直接将指数对 $\varphi(m)$ 取模；若不互质，则必须使用上方扩展欧拉定理，并额外判断原指数是否已经达到 $\varphi(m)$，不能无条件只保留指数模 $\varphi(m)$ 的结果。

结论是一个数自取 $O(\log n)$ 次 $\varphi(n)$ 就会降到 $1$。

简单证明：
- $\varphi(x),x>2$ 是偶数
- $\varphi(x)\le\frac{x}{2},x\bmod 2=0$

所以至少是两次缩小一半规模。

## 卢卡斯定理

对于质模数 $p$，有 $\dbinom{n}{m}\equiv\dbinom{\lfloor\frac{n}{p}\rfloor}{\lfloor\frac{m}{p}\rfloor}\times\dbinom{n\bmod p}{m\bmod p}\pmod p$，规定 $n<m,\dbinom{n}{m}=0$。

Lucas 定理揭示了，组合数 $\dbinom{n}{m}$ 对质数取模的结果等价于其 $n,m$ 在 $p$ 进制意义下每一位的 $\dbinom{n_i}{m_i}\bmod p$ 之积。

即：$\prod\limits_{i=1}^{\infty}\dbinom{n_i}{m_i}\bmod p$。

对于 $\dbinom{x}{y},x,y<p$，预处理阶乘及其逆元，即可 $O(1)$ 询问。

所以时间复杂度：$O(\log_pn+p)$。

:::details 点击展开代码
```cpp
int C(int x, int y, int mod) {
    auto calc = [](int x, int y, int mod) -> int {
        if (x < y)
            return 0;
        if (x == 0 || y == 0)
            return 1;
        return 1LL * fac[x] * inv[y] % mod * inv[x - y] % mod;
    };
    if (x < y)
        return 0;
    int res = 1;
    while (x || y) {
        int X = x % mod, Y = y % mod;
        res = 1LL * res * calc(X, Y, mod) % mod;
        x /= mod;
        y /= mod;
    }
    return res;
}
```
:::

## 扩展卢卡斯定理

若模数不为质数，令 $m=\prod\limits_{i=1}^sp_i^{a_i}$。

根据 crt，等价于求解 $\begin{cases}\dbinom{n}{k}\equiv r_1&\pmod {p_1^{a_1}}\\\dbinom{n}{k}\equiv r_2&\pmod {p_2^{a_2}}\\ &\vdots\\\dbinom{n}{k}\equiv r_s&\pmod {p_s^{a_s}}\end{cases}$。

考虑求解 $\dbinom{n}{k}\bmod p^{a}$：

$$\dbinom{n}{k}=\dfrac{n!}{k!(n-k)!}$$

令 $v_p(n)$ 表示 $n$ 的质因数分解中质因子 $p$ 的指数，$w_p(n)$ 表示 $n$ 除尽 $p$ 后的值。

则原式可以写成 $p^{v_p(n!)-v_p(k!)-v_p((n-k)!)}\times \dfrac{w_p(n!)}{w_p(k!)w_p((n-k)!)}$。

此时，问题转换成求 $v_p(n)\bmod p^a$ 和 $w_p(n)\bmod p^a$。

所以 exlucas 本质是解决了阶乘对质数幂取模的问题。

> Wilson 定理：$(p-1)!\equiv -1\pmod p,p\in\mathbb P$。
> 
> 推广：$\prod\limits_{1\le i\le m,i\perp m} i\equiv ±1\pmod m$。
>
> 推论：$\prod\limits_{1\le i\le p^a,i\perp p^a} i\equiv \begin{cases}1 & p=2\land a\ge 3\\-1 & \text{otherwise}\end{cases}\pmod {p^a}$。特别地，模 $4$ 时完整单位块积为 $-1$。

对于 $p$：

$w_p(n!)\equiv (-1)^{\lfloor\frac{n}{p}\rfloor}\times (n\bmod p)!\times w_p(\lfloor\frac{n}{p}\rfloor!)\pmod p$

可以发现，实际上 lucas 就是模数为 $p$ 的特殊情况。

对于 $p^a$：

令 $U_{p^a}=\prod\limits_{1\le i\le p^a,i\perp p^a}i$ 表示一个完整单位块的乘积，则

$$
w_p(n!)\equiv U_{p^a}^{\lfloor n/p^a\rfloor}
\times \prod\limits_{1\le i\le n\bmod p^a,i\perp p^a}i
\times w_p(\lfloor n/p\rfloor!)\pmod {p^a}.
$$

不能把 $U_{p^a}$ 无条件写成 $-1$：当 $p=2,a\ge3$ 时它等于 $1$，只有模 $4$ 等情形才为 $-1$。

预处理 $\prod\limits_{1\le i\le (n\bmod p^a),i\perp p^a}i$，递归求解，容易得到时间复杂度：预处理 $O(p^a)$，单次询问 $O(\log_pn)$。

下方模板在每次调用 `C` 时重置全局计数 `nn`，并由 `init` 覆盖当前质数幂范围内的 `mem`。数组容量必须大于最大的 $p^a$；代码中的模乘使用 `1LL` 作为中间量，若把模数类型扩展到 `long long`，则应相应改用 `__int128`。


:::details 点击展开代码
```cpp
int phi(int x, int y) { return x / y * (y - 1); }
int nn, a[N], b[N];
int mod[N], mem[N];
int intchina() {
    int i, prod = 1, s = 0;
    for (i = 1; i <= nn; i++)
        prod = 1LL * prod * a[i];
    for (i = 1; i <= nn; i++) {
        int t = qz(prod / a[i], phi(a[i], mod[i]) - 1, a[i]);
        s = (s + 1LL * b[i] * (prod / a[i]) % prod * t) % prod;
    }
    return s;
}
int n, m, p;

void init(int p, int mod) {
    int i;
    mem[0] = 1;
    for (i = 1; i <= mod; i++) {
        mem[i] = mem[i - 1];
        if (i % p)
            mem[i] = 1LL * mem[i] * i % mod;
    }
}
int l(int x, int p) {
    int res = p, ans = 0;
    while (res <= x) {
        ans += x / res;
        if (res > x / p)
            break;
        res *= p;
    }
    return ans;
}
int g(int x, int mod) {
    int res = qz(mem[mod], x / mod, mod);
    return 1LL * res * mem[x % mod] % mod;
}
int f(int x, int p, int mod) {
    if (x <= 1)
        return 1;
    return 1LL * f(x / p, p, mod) * g(x, mod) % mod;
}
int C(int n, int m, int p) {
    if (n < m)
        return 0;
    nn = 0;
    for (int i = 2; i <= p / i; i++) {
        int res = 1;
        while (p % i == 0) {
            res *= i;
            p /= i;
        }
        if (res > 1) {
            a[++nn] = res;
            mod[nn] = i;
        }
    }
    if (p > 1) {
        a[++nn] = p;
        mod[nn] = p;
    }
    for (int i = 1; i <= nn; i++) {
        int base = l(n, mod[i]) - l(m, mod[i]) - l(n - m, mod[i]);
        int aa = qz(mod[i], base, a[i]);
        int res1, res2;
        init(mod[i], a[i]);
        res1 = f(n, mod[i], a[i]),
        res2 = 1LL * f(m, mod[i], a[i]) * f(n - m, mod[i], a[i]) % a[i];
        aa = 1LL * aa * res1 % a[i];
        aa = 1LL * aa * qz(res2, (a[i] - a[i] / mod[i]) - 1, a[i]) % a[i];
        b[i] = aa;
    }
    return intchina();
}
```
:::

## BSGS

bsgs 用于求解指数同余方程，即：

$$a^x\equiv b\pmod c,\gcd(a,c)=1$$

其基本原理是任意一个 $[0,n]$ 的整数都可以表示成 $ak+b$，其中 $a\in [0,\lfloor\frac{n-1}{k}\rfloor],b\in[0,k)$。

枚举 $a$，$b$ 的待选项只有 $k$ 个，预处理 $b$，那么求解的时间复杂度即为 $O(\lfloor\frac{n-1}{k}\rfloor+k)$，$k=\sqrt n$ 时，取到近似最优解，时间复杂度：$O(\sqrt n)$。

具体到原问题中，首先确定 $n$，根据鸽巢原理，易得 $\exists x<c, a^x\equiv a^c\pmod c$，所以，若 $a^x\equiv b\pmod c$ 在 $[0,c)$ 中无解，那么就无解。

$a^{A\sqrt c+B}\equiv b\pmod c\rightarrow a^{A\sqrt c}\times a^B\equiv b\pmod c$。

当 $\gcd(a,c)=1$，即 $a^{A\sqrt c}\bmod c$ 存在逆元时，$a^B\equiv(a^{A\sqrt c})^{-1}\times b\pmod c$。

预处理 $a^0,...,a^{\sqrt n-1}$，查询求解 $B$ 即可。

所以可以发现，bsgs 建立在 $\gcd(a,m)=1$ 的前提上。

有求逆元和 `map` 询问的存在，时间复杂度：$O(\sqrt n\log n)$。

小优化：

考虑将 $a^{A\sqrt c+B}$ 写成 $a^{A\sqrt c + \sqrt c-B'}$ 的形式，那么可以将原式写成 $a^{A\sqrt c -B'}\equiv b\pmod c\rightarrow a^{A\sqrt c}\equiv b\times a^{B'}\pmod c,A\in[1,\lfloor\frac{n-1}{k}\rfloor+1]$。

预处理 $b\times a^{B'}$，若将 `hashmap` 的时间复杂度视作 $O(1)$，则时间复杂度为：$O(\sqrt n)$。

省去了求逆元的时间复杂度。（但是上式仍建立在逆元存在的基础上）

或者实际上本质上是求 $O(\sqrt n)$ 个元素的逆元，朴素也可以做到 $O(\sqrt n +\log n)$ 求解。

:::details 点击展开代码
```cpp
struct BSGS {
    unordered_map<int, int> mp;
    int bsgs(int a, int b, int p) {
        if (b == 1)
            return 0;
        b %= p;
        int sqt = ceil(sqrt(p));
        int A = b;
        mp.clear();
        for (int i = 0; i < sqt; i++) {
            mp[A] = i;
            A = 1LL * A * a % p;
        }
        int base = qz(a, sqt, p);
        A = 1;
        for (int i = 1; i <= sqt; i++) {
            A = 1LL * A * base % p;
            if (mp.count(A))
                return i * sqt - mp[A];
        }
        return -1;
    }
};
```
:::


## 扩展 BSGS

用于求解：

$$a^x\equiv b\pmod c,\gcd(a,c)\ne 1$$

因为 $\gcd(a,c)\neq 1$ 逆元不存在，不能使用 bsgs 求解。

若 $\gcd(a,c)\neq 1$，根据 exgcd 原同余方程可以写作 $\frac{a}{\gcd(a,c)}\times a^{x-1}\equiv\frac{b}{\gcd(a,c)}\pmod {\frac{c}{\gcd(a,c)}}$，其中 $\gcd(\frac{a}{\gcd(a,c)},\frac{c}{\gcd(a,c)})=1$，所以逆元存在，可以将问题转换成 $a^{x-1}\equiv b'\pmod {c'}$ 的子问题，依次类推，直到 $\gcd(a,c')=1$ 为止。

此时，原式为：$\frac{a^{y}}{A}\times a^{x-y}\equiv\frac{b}{A}\pmod {\frac{c}{A}}$。

采用 bsgs 求解后，$x+y$ 即为原同余方程的解，注意此时解的范围是 $[y,+∞)$，所以要特殊判断 $[0,y)$ 是否存在解。

时间复杂度：$O(\sqrt n+\log n)$ 与 bsgs 相同。

:::details 点击展开代码
```cpp
struct ExBSGS {
    int exbsgs(int a, int b, int c) {
        int sqt, base, i, A = 1;
        hashmap.clear();
        for (int i = 0; i < 32; i++) {
            if (A % c == b)
                return i;
            A = 1LL * A * a % c;
        }
        int d = 1, cnt = 0;
        while (gcd(a, c) != 1) {
            int g = gcd(a, c);
            if (b % g != 0)
                return -1;
            b /= g;
            c /= g;
            d = 1LL * d * (a / g) % c;
            cnt++;
        }
        sqt = ceil(sqrt(c));
        A = b;
        for (int i = 0; i < sqt; i++) {
            hashmap[A] = i;
            A = 1LL * A * a % c;
        }
        base = qz(a, sqt, c);
        A = 1LL * d * base % c;
        for (int i = 1; i <= sqt; i++) {
            auto it = hashmap.find(A);
            if (it != hashmap.end())
                return i * sqt - it->second + cnt;
            A = 1LL * A * base % c;
        }
        return -1;
    }
    int calc(int b, int n, int p) {
        b %= p, n %= p;
        if (n == 1 || p == 1)
            return 0;
        if (b == 0 && n != 0)
            return -1;
        return exbsgs(b, n, p);
    }
};
```
:::


### 离散对数

对于模数 $m$，若 $m$ 存在原根，设 $g$ 是模 $m$ 的一个原根，则 $g$ 的幂只枚举模 $m$ 的单位群：

$$
x\in[0,\varphi(m))\longleftrightarrow
g^x\bmod m\in(\mathbb Z/m\mathbb Z)^\times.
$$

因此，只有满足 $\gcd(b,m)=1$ 的剩余类 $b$ 才存在以 $g$ 为底的离散对数；$0$ 和其他非单位元不在原根幂的枚举范围内。满足 $g^x\equiv b\pmod m$ 的 $x\bmod\varphi(m)$ 称为 $b$ 关于 $g$ 的离散对数。

存在原根的正整数模数恰为 $1,2,4,p^k,2p^k$，其中 $p$ 是奇质数。特别地，模 $4$ 存在原根，而 $2^k$ 仅在 $k\ge3$ 时不存在原根。

记作 $x=\text{ind}_gb$，形如对数形式。

所以求解底数是原根时的特殊指数同余方程，可以使用 bsgs 解决。

### 模数为质数的 N 次剩余

对于 $x^{a}\equiv b\pmod p,p\in\mathbb P$。

当 $b=0$ 且 $a>0$ 时应直接特判，此时 $x=0$。当 $b\ne0$ 时，解 $x$ 也必为单位，可以取原根 $g$ 并令 $x=g^c$，原式化为 $(g^a)^c\equiv b\pmod p$，再使用 BSGS 求解相应的离散对数。


### 一般意义下的 N 次剩余

对于合数模数，可以先分解为 $m=\prod p_i^{a_i}$，分别求解模各个质数幂的同余式，再使用中国剩余定理合并。奇质数幂存在原根，模 $2$ 和模 $4$ 也存在原根；但原根方法仍只直接处理单位元。若 $x$ 或右端点不是单位元，必须先单独处理其 $p$ 进赋值，不能直接对非单位元取离散对数。

特别地，$2^k$ 在 $k\ge3$ 时没有原根，其单位群也不是循环群，不能直接套用单个原根下的 BSGS 转换，需要使用针对 $2$ 的幂模数的结构或其他算法。

## 中国剩余定理

用于求解线性同余方程组 $\begin{cases}x\equiv r_1\pmod {m_1}\\x\equiv r_2\pmod {m_2}\\\ \ \ \ \vdots\\x\equiv r_k\pmod {m_k}\end{cases}$，其中 $m_i$ 两两互质。

令 $M=\prod\limits_{i=1}^k m_i,\frac{M}{m_i}\times \frac{M}{m_i}^{-1}\equiv 1\pmod {m_i},c_i=\frac{M}{m_i}\times (\frac{M}{m_i})^{-1}\bmod M$。

则原同余方程组的解为 $x\equiv\sum\limits_{i=1}^k r_i\times c_i\pmod M$。

可以证明，线性同余方程组在模意义下解唯一，所以上述解即为原方程组的唯一解。

时间复杂度：$O(k\log n)$。

注：若不保证模数为质数，仅保证两两互质，那么可以使用欧拉定理预处理欧拉函数求逆元。或直接使用 exgcd 求解逆元。

实现时还必须保证 $M=\prod m_i$ 能放入所选整数类型，并使用更宽类型计算 $M$ 和 $r_i\frac{M}{m_i}c_i$。下方模板用 `__int128` 检查中间结果；若最终模数超过当前 `int` 的范围则返回 `-2`。若把求逆步骤改成费马小定理 $a^{m_i-2}$，还必须额外保证对应的 $m_i$ 是质数；仅有两两互质并不够。

:::details 点击展开代码
```cpp
struct CRT {
    int intchina(vector<int> &r, vector<int> &mod, int n) {
        int M = 1;
        for (int i = 1; i <= n; i++) {
            __int128 nxt = (__int128)M * mod[i];
            if (nxt > numeric_limits<int>::max())
                return -2;
            M = (int)nxt;
        }
        int ans = 0;
        for (int i = 1; i <= n; i++) {
            if (mod[i] == 1)
                continue;
            int now = M / mod[i];
            int inv = qz(now % mod[i], phi[mod[i]] - 1, mod[i]);
            ans = (ans + (__int128)r[i] * now % M * inv) % M;
        }
        return ans;
    }
};
```
:::

### garner 算法

若 $a$ 满足如下线性方程组，且 $a<\prod\limits_{i=1}^k p_i$

$$\begin{cases}a\equiv a_1\pmod {p_1}\\a\equiv a_2\pmod {p_2}\\\ \ \ \ \ \vdots\\ a\equiv a_k\pmod {p_k}\end{cases}$$

我们可以用以下形式的式子（称作 $a$ 的混合基数表示）表示 $a$：

$$a=x_1+x_2p_1+x_3p_1p_2+...+x_kp_1...p_{k-1}$$

garner 算法用来计算系数 $x_1,...,x_k$。

令 $r_{i,j}$ 为 $p_i$ 在模 $p_j$ 意义下的逆：

$$p_i\times r_{i,j}\equiv 1\pmod {p_j}$$

把 $a$ 代入我们得到的第一个方程：

$$a_1\equiv x_1\pmod {p_1}$$

代入第二个方程得出：

$$a_2\equiv x_1+x_2p_1\pmod {p_2}$$

方程两边减 $x_1$，除 $p_1$ 后得：

$$a_x-x_1\equiv x_2p_1\pmod {p_2}$$

$$(a_2-x_1)r_{1,2}\equiv x_2\pmod {p_2}$$

$$x_2\equiv(a_2-x_1)r_{1,2}\pmod {p_2}$$										

类似地，我们可以得到：

$$x_k=(...((a_k-x_1)r_{1,k}-x_2)r_{2,k}-\dots)r_{k-1,k}\bmod {p_k}$$

时间复杂度：$O(k^2\log p)$。

下方代码用 $p_j-2$ 次幂计算逆元，因此除了模数两两互质外，还要求每个 `mod[j]` 都是质数。若允许合数模数，应改用 exgcd 求逆。混合基数的累积乘积和最终答案同样可能溢出；模板返回 `-2` 表示结果已经超出当前 `int` 的可表示范围。

三模数 NTT 实现的任意模数 NTT 就是这个原理。

:::details 点击展开代码
```cpp
int Garner(vector<int> &r, vector<int> &mod, int n) {
    vector<int> x(n + 1);
    vector<vector<int>> iv(n + 1, vector<int>(n + 1));
    for (int i = 1; i <= n; i++) {
        for (int j = i + 1; j <= n; j++) {
            iv[i][j] = qz(mod[i], mod[j] - 2, mod[j]);
        }
    }
    for (int i = 1; i <= n; i++) {
        x[i] = r[i];
        for (int j = 1; j < i; j++) {
            x[i] = (__int128)iv[j][i] * (x[i] - x[j]) % mod[i];
            if (x[i] < 0)
                x[i] += mod[i];
        }
    }
    int res = x[1];
    int now = 1;
    for (int i = 2; i <= n; i++) {
        __int128 nxt = (__int128)now * mod[i - 1];
        if (nxt > numeric_limits<int>::max())
            return -2;
        now = (int)nxt;
        nxt = (__int128)res + (__int128)now * x[i];
        if (nxt > numeric_limits<int>::max())
            return -2;
        res = (int)nxt;
    }
    return res;
}
```
:::


## 扩展中国剩余定理

用于求解线性同余方程组 $\begin{cases}x\equiv r_1\pmod {m_1}\\x\equiv r_2\pmod {m_2}\\\ \ \ \ \vdots\\x\equiv r_k\pmod {m_k}\end{cases}$，其中 $m_i$ 不一定满足两两互质。

对于两个同余方程 $x\equiv r_1\pmod {m_1},x\equiv r_2\pmod {m_2}$。

写成二元一次方程的形式：

$$x+b_1m_1=r_1,x+b_2m_2=r_2\rightarrow r_1-b_1m_1=r_2-b_2m_2$$

$b_1,b_2$ 需要求解，$r_1,r_2,m_1,m_2$ 均为常数，所以原式可以写成 $m_1b_1-m_2b_2=r_1-r_2$ 的二元一次方程。

使用 exgcd 求解即可。

注意会出现 $\gcd(m_1,m_2)\nmid (r_1-r_2)$ 时无解的情况。

将解出的 $b_1$ 或 $b_2$ 代回原式，可得：

$$x'=r_1-b_1m_1 \equiv r_1\pmod {m_1}\equiv r_2\pmod {m_2}\rightarrow x\equiv x' \pmod {\text{lcm}(m_1,m_2)}$$

至此，成功将两个同余方程合并成了一个同余方程。

依次类推，合并 $k-1$ 次，即可得到最后的同余式。

实际上此处 crt 和 excrt 讨论的都是 $x$ 系数为 $1$ 的同余式，其在模意义下已经是确定的常数了。

对于一般的同余方程 $ax\equiv b\pmod c$，可以使用 exgcd 先求出 $x$ 的同余式通解，再使用上述规则求解即可。

时间复杂度：$O(k\log n)$。

合并后的模数会逐步变成最小公倍数，也可能超过整数范围。下方模板使用 `__int128` 计算新的模数和余数；无解返回 `-1`，结果模数超出当前 `int` 范围则返回 `-2`。若连最终最小公倍数都超过 64 位，仅扩大中间乘法仍不够，需要使用大整数或改变输出约定。

:::details 点击展开代码
```cpp
int eyyc(int a, int b, int c) {
    int g = gcd(a, b);
    if (c % g)
        return -1;
    int x, y;
    exgcd(a, b, x, y);
    b /= g;
    x = ((__int128)x * (c / g) % b + b) % b;
    return x;
}
struct ExCRT {
    int intchina(vector<int> &r, vector<int> &mod, int n) {
        int R = r[1], M = mod[1];
        for (int i = 2; i <= n; i++) {
            int rhs = ((__int128)R - r[i]) % mod[i];
            int x = eyyc(M, mod[i], rhs); // b 取正值，保证求解得到的一定是非负值
            if (x == -1)
                return -1;
            __int128 nxtM = (__int128)M / gcd(M, mod[i]) * mod[i];
            if (nxtM > numeric_limits<int>::max())
                return -2;
            __int128 nxtR = (__int128)R - (__int128)x * M;
            nxtR %= nxtM;
            if (nxtR < 0)
                nxtR += nxtM;
            R = (int)nxtR;
            M = (int)nxtM;
        }
        return R;
    }
};
```
:::


## 同余最短路：

同余最短路用于求解模意义下从 $x$ 到 $y$ 的最短路。


例如给定正整数 $a_1,\dots,a_n$，研究 $\sum\limits_{i=1}^na_ix_i$（$x_i\ge0$）在每个剩余类中能够表示的最小值。若不限定剩余类或正下界，“能表示的最小非负整数”恒为 $0$，因为可以令所有 $x_i=0$，因而不是一个有意义的问题。

若选中任一 $a_i$，则最终的数都可以通过剩下的 $n-1$ 个数和调整 $a_i$ 的系数得到。

即可以关于 $a_i$ 划分成 $a_i$ 的同余类。

在每个同余类中求出最小可达值 `dist[r]` 后，可以判断给定整数是否可表示，也可以求给定下界 $L>0$ 之后的最小可达值。对于模数 $m=a_i$ 的剩余类 $r$，不小于 $L$ 的最小候选值是

$$
dist[r]+\max\left(0,\left\lceil\frac{L-dist[r]}{m}\right\rceil\right)m,
$$

再对所有可达剩余类取最小值即可。

在模意义下，多一个 $a_j$ 相当于在 $x$ 和 $(x+a_j)\bmod a_i$ 之间建了一条权值为 $a_j$ 的边，从 $0$ 出发到 $x\in[0,a_i)$ 的最短路即为同余类中能表示的最小值。

### 转圈法求解同余最短路问题：

本质是：$xa\equiv c\pmod m,\gcd(a,m)\mid c$。

所以对于不同的 $x$ 可以划分成 $\gcd(a,m)$ 和同余类，在每个同余类内部正向转移跑完全背包，因为是模意义下，所以要跑两轮。

转移 $dp(x)+a\rightarrow dp((x+a)\bmod m)$。从 $x$ 开始走 $k=\frac{m}{\gcd(a,m)}$ 步可以更新完 $x$ 能更新的点，那么从 $i$ 开始走 $2k$ 步，也就是“多走一圈”，就相当于从 $i$ 所在的剩余类中的每个点都走了 $k$ 步，也就可以更新完这个剩余类中的每个点。

时间复杂度：$O(nm)$。
