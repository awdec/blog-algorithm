<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>质数</center></h1>

即：素数。

## 哥德巴赫猜想

任意两个大于 $2$ 的偶数都可以拆分成两个质数之和。

## 波利尼亚克猜想

对任意正整数 $k$，存在无穷多对素数 $(p,p+2k)$，使得：

$$p\ \text{is prime}\ \land\ p+2k\ \text{is prime}$$

## 质数距离：

$[1,n]$ 中的质数数量 $\pi(n)\sim \dfrac{n}{\ln n}$，即相邻质数距离约为 $O(\ln n)$。

## 素性测试

即：判断一个数是否是质数。

### 试除法：

$a\mid n\rightarrow p_a\mid n$，其中 $p_a$ 是 $a$ 的质因子。

那么只需要考虑 $x$ 的质因子，质数筛预处理 $O(\sqrt n)$ 范围内的质数，时间复杂度 $O(\frac{\sqrt n}{\ln n})$。

### Miller-Rabin

概率性素性测试，时间复杂度：$O(k\log n)$，其中 $k$ 是随机的轮数，$n$ 是待测试的数值。

```cpp
int mul(int x, int y,
        int mod) { // 若测试的数值域在 long long 范围内相乘的结果可用 __int128
                   // 储存，若测试的数值域超过 long
                   // long，只能使用“龟速乘”，总时间复杂度：O(klog^2n)
    // int res = 0;
    // for (; y; y >>= 1) {
    //     if (y & 1)
    //         res = (res + x) % mod;
    //     x = (x + x) % mod;
    // }
    // return res;
    return x * y % mod;
}

int qz(int x, int y, int mod) {
    int res = 1;
    for (; y; y >>= 1) {
        if (y & 1)
            res = mul(res, x, mod);
        x = mul(x, x, mod);
    }
    return res;
}

bool is_prime(int n) {
    if (n < 4) {
        return n == 2 || n == 3;
    }
    if (n % 2 == 0) {
        return 0;
    }
    int s = 0;
    int d = n - 1;
    while (d % 2 == 0) {
        d /= 2;
        s++;
    }
    vector<int> p = {2, 7, 61}; // int32
    // int64
    // vector<int> p = {2, 325, 9375, 28178, 450775, 9780504, 1795265022};
    // int128 直接随 k 次吧
    for (auto u : p) {
        int a = (u % (n - 2)) + 2;
        int x = qz(a, d, n);
        if (x == 1 || x == n - 1) {
            continue;
        }
        for (int i = 1; i < s; i++) {
            x = mul(x, x, n);
            if (x == n - 1) {
                break;
            }
        }
        if (x != n - 1) {
            return 0;
        }
    }
    return 1;
}
```

## 质因数分解

根据唯一分解定理：$n=\prod p_i^{\alpha_i}$，质因数分解即为求 $\{p_i\mid \alpha_i>0\}$。

### 试除法

> $\ge \sqrt n$ 的质因数最多只有一个。

枚举 $<\sqrt n$ 的所有质数，试除，时间复杂度：$O(\frac{\sqrt n}{\ln n}+\log n)$。

### Pollard-Rho

概率性质因数分解，需要结合 Miller-Rabin，时间复杂度：$O(n^{\frac{1}{4}})$。

```cpp
struct Pollard_Rho {
    // Miller-Rabin

    int abs(int x) { // int128 不能调用 abs 库函数
        if (x < 0)
            return -x;
        return x;
    }

    int pollard_rho(int x) {
        int s = 0, t = 0;
        int c = rand() % (x - 1) + 1;
        int goal = 1, val = 1, temp;
        for (goal = 1;; goal *= 2, s = t, val = 1) {
            for (int step = 1; step <= goal; step++) {
                t = (t * t + c) % x;
                val = val * abs(t - s) % x;
                if (step % 127 == 0) {
                    temp = __gcd(val, x);
                    if (temp > 1)
                        return temp;
                }
            }
            temp = __gcd(val, x);
            if (temp > 1)
                return temp;
        }
    }
    vector<int> res;
    void fac(int x) {
        if (x < 2)
            return;
        if (check(x)) {
            res.push_back(x);
            return;
        }
        int p = x;
        while (p >= x)
            p = pollard_rho(x);
        while (x % p == 0)
            x /= p;
        fac(x), fac(p);
    }
    vector<int> divide(int x) {
        vector<int> tmp;
        res.swap(tmp);
        fac(x);
        return res;
    }
};
```

## 质数筛：

### 挨氏筛

从 $2$ 开始，不断用 $p$ 标记 $i\times p$，$\sum \dfrac{1}{p_i}\sim \ln\ln n$，时间复杂度：$O(n\ln\ln n)$。

但是有很多常数优化：
- 只标记奇数，具体而言，只标记 $(2i+1)p$
- 只标记 $\ge p^2$
- 使用 `bitset` 替代标记数组

```cpp
void ai(int n) {
    not_prime[0] = not_prime[1] = 1;
    for (int i = 4; i <= n; i += 2)
        not_prime[i] = 1;
    for (int i = 3; i <= n / i; i++) {
        if (not_prime[i])
            continue;
        for (int j = i * i; j <= n; j += 2 * i)
            not_prime[j] = 1;
    }
}
```

实现较好的常数较小的挨氏筛会比欧拉筛效率更高，实测【洛谷】评测环境下，$10^8$ 的挨氏筛 300ms，欧拉筛 900ms。

### 欧拉筛

仅用 $x$ 的最小质因子标记 $x$，时间复杂度：$O(n)$，但是由于常数问题，在大数据范围下效率可能不如挨氏筛。

```cpp
void euler(int n) {
    fill(is_prime + 2, is_prime + n + 1, 1);
    for (int i = 2; i <= n; ++i) {
        if (is_prime[i]) {
            prime.push_back(i);
        }
        for (auto u : prime) {
            if (i * u > n)
                break;
            is_prime[i * u] = 0;
            if (i % u == 0) {
                break;
            }
        }
    }
}
```

### min_25 筛

使用 `min_25` 筛求解 $[1,n]$ 中质数数量，时间复杂度：$O(\frac{n^{\frac{3}{4}}}{\log n})$。

```cpp
int count_pi(int n) {
    int len = 0, lim, lenp = 0;
    auto get_index = [&](int x) -> int {
        if (x <= lim)
            return x;
        else
            return len - n / x + 1;
    };
    lim = sqrt(n);
    vector<int> a(lim << 2), g(lim << 2);
    for (int i = 1; i <= n; i = a[len] + 1) {
        a[++len] = n / (n / i);
        g[len] = a[len] - 1;
    }
    for (int i = 2; i <= lim; ++i) {
        if (g[i] != g[i - 1]) {
            ++lenp;
            for (int j = len; a[j] >= 1ll * i * i; --j)
                g[j] = g[j] - g[get_index(a[j] / i)] + lenp - 1;
        }
    }
    return g[len];
}
```

### Meissel-Lehmer

Meissel-Lehmer 是专门用于计算 $[1,n]$ 中质数数量的特殊筛法。

这里仅记录模板，仅供参考，时间复杂度：$O(\frac{n^{\frac{2}{3}}}{\log^2n})$。

```cpp
i64 count_pi(i64 N) {
    if (N <= 1)
        return 0;
    int v = sqrt(N + 0.5);
    int n_4 = sqrt(v + 0.5);
    int T = min((int)sqrt(n_4) * 2, n_4);
    int K = pow(N, 0.625) / log(N) * 2;
    K = max(K, v);
    K = min<i64>(K, N);
    int B = N / K;
    B = N / (N / B);
    B = min<i64>(N / (N / B), K);

    vector<i64> l(v + 1);
    vector<int> s(K + 1);
    vector<bool> e(K + 1);
    vector<int> w(K + 1);
    for (int i = 1; i <= v; ++i)
        l[i] = N / i - 1;
    for (int i = 1; i <= v; ++i)
        s[i] = i - 1;

    const auto div = [](i64 n, int d) -> int { return double(n) / d; };
    int p;
    for (p = 2; p <= T; ++p)
        if (s[p] != s[p - 1]) {
            i64 M = N / p;
            int t = v / p, t0 = s[p - 1];
            for (int i = 1; i <= t; ++i)
                l[i] -= l[i * p] - t0;
            for (int i = t + 1; i <= v; ++i)
                l[i] -= s[div(M, i)] - t0;
            for (int i = v, j = t; j >= p; --j)
                for (int l = j * p; i >= l; --i)
                    s[i] -= s[j] - t0;
            for (int i = p * p; i <= K; i += p)
                e[i] = 1;
        }
    e[1] = 1;
    int cnt = 1;
    vector<int> roughs(B + 1);
    for (int i = 1; i <= B; ++i)
        if (!e[i])
            roughs[cnt++] = i;
    roughs[cnt] = 0x7fffffff;
    for (int i = 1; i <= K; ++i)
        w[i] = e[i] + w[i - 1];
    for (int i = 1; i <= K; ++i)
        s[i] = w[i] - w[i - (i & -i)];

    const auto query = [&](int x) -> int {
        int sum = x;
        while (x)
            sum -= s[x], x ^= x & -x;
        return sum;
    };
    const auto add = [&](int x) -> void {
        e[x] = 1;
        while (x <= K)
            ++s[x], x += x & -x;
    };
    cnt = 1;
    for (; p <= n_4; ++p)
        if (!e[p]) {
            i64 q = i64(p) * p, M = N / p;
            while (cnt < q)
                w[cnt] = query(cnt), cnt++;
            int t1 = B / p, t2 = min<i64>(B, M / q), t0 = query(p - 1);
            int id = 1, i = 1;
            for (; i <= t1; i = roughs[++id])
                l[i] -= l[i * p] - t0;
            for (; i <= t2; i = roughs[++id])
                l[i] -= query(div(M, i)) - t0;
            for (; i <= B; i = roughs[++id])
                l[i] -= w[div(M, i)] - t0;
            for (int i = q; i <= K; i += p)
                if (!e[i])
                    add(i);
        }
    while (cnt <= v)
        w[cnt] = query(cnt), cnt++;

    vector<int> primes;
    primes.push_back(1);
    for (int i = 2; i <= v; ++i)
        if (!e[i])
            primes.push_back(i);
    l[1] += i64(w[v] + w[n_4] - 1) * (w[v] - w[n_4]) / 2;
    for (int i = w[n_4] + 1; i <= w[B]; ++i)
        l[1] -= l[primes[i]];
    for (int i = w[B] + 1; i <= w[v]; ++i)
        l[1] -= query(N / primes[i]);
    for (int i = w[n_4] + 1; i <= w[v]; ++i) {
        int q = primes[i];
        i64 M = N / q;
        int e = w[M / q];
        if (e <= i)
            break;
        l[1] += e - i;
        i64 t = 0;
        int m = w[sqrt(M + 0.5)];
        for (int k = i + 1; k <= m; ++k)
            t += w[div(M, primes[k])];
        l[1] += 2 * t - (i + m) * (m - i);
    }
    return l[1];
}
```