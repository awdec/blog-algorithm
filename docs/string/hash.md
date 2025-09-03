<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>Hash</center></h1>

此处 Hash 指​字符串哈希，只用来判断两个字符串是否相同。

字符串哈希，一般使用多项式哈希，将字符串 $s$ 映射到整数 $\sum s_i\times base^i$ 上。

## 单哈：

​将字符串 $s$ 映射到整数 $\sum s_i\times base^i\bmod  p$ 上。

​根据生日悖论，无论选取什么底数、模数，在随机不同数据 $\sqrt p$ 次后，每次都有约 $\frac{1}{2}$ 的概率冲突。

​一般情况下，询问次数在 $10^5\sim 10^6$ 之间，所以选取的模数若在 `int` 范围内，在询问约 $2^{16}=65363$ 次后，每次都有约 $\frac 1 2$ 的概率冲突。而若是选取 `long long` 范围内的模数，两数相乘的结果会超过 `long long`，需要使用 `int128`。

## 自然溢出：

​自然溢出是指使用 `unsigned long long` 进行运算，结果不小于 $2^{64}$ 时自动对 $2^{64}$ 取模。等价于使用 $2^{64}$ 做模数，在询问约 $2^{32}=4294967296$ 次后才会有约 $\frac 1 2$ 的概率冲突。且避免了 `int128`，并且运算速度较快。

但是由于模数的特殊性，非常容易构造哈希冲突。

## 双哈：

​将字符串 $s$ 映射到二元组 $(\sum s_i\times base_1^i\bmod  p_1,\sum s_i\times base_2^i\bmod  p_2)$ 上。

​底数是否选取不同影响不大。

​根据中国剩余定理，双哈冲突等价于单哈模数为 $\text{lcm}(p_1,p_2)$ 时冲突。

​所以在随机不同数据约 $\sqrt {\text{lcm}(p_1,p_2)}$ 次后，每次都有约 $\frac{1}{2}$ 的概率冲突。模数选取两个 `int` 范围内的 $\sqrt {\text{lcm}(p_1,p_2)}$ 远大于询问次数的整数即可避免随机情况下的哈希碰撞。所以算法竞赛中，在未知模数的情况下，双哈希完美。

​引入随机化，可以避免刻意攻击。

​最简单的是为每个字符随机映射一个权值而不是固定的 $s_i$，​在哈希开始前随机选取底数和模数也可。

```cpp
const int Base[4] = {3333, 13331, 131, 13331},
          mod[4] = {1610612741, 1061067769, (int)1e9 + 7, (int)1e9 + 9};
int m1 = 0, m2 = 1;
void init(int n) {
    base[0][0] = base[0][1] = 1;
    for (int i = 1; i <= n; i++) {
        base[i][0] = base[i - 1][0] * Base[m1] % mod[m1];
        base[i][1] = base[i - 1][1] * Base[m2] % mod[m2];
    }
}
void init(int a[], int n) {
    for (int i = 1; i <= n; i++) {
        sum[i][0] = (sum[i - 1][0] * Base[m1] + a[i]) % mod[m1];
        sum[i][1] = (sum[i - 1][1] * Base[m2] + a[i]) % mod[m2];
    }
}
u64 sum_hash(int l, int r) {
    int now = (sum[r][0] - sum[l - 1][0] * base[r - l + 1][0]) % mod[m1];
    int cur = (sum[r][1] - sum[l - 1][1] * base[r - l + 1][1]) % mod[m2];
    if (now < 0) // 注意负数不能 u64
        now += mod[m1];
    if (cur < 0)
        cur += mod[m2];
    return (1ull * now) << 32 | cur;
}
```
注：因为 `pair<int,int>` 是两个 `int`，若要使用 `map` 储存字符串的哈希值，将 `pair<int,int>` 压成 `long long` 后比较哈希值的常数会更小。