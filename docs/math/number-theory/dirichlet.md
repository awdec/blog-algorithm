<h1><center>Dirichlet 前缀和</center></h1>

对于 $a_i$，求解 $b_i=\sum\limits_{k\mid i}a_k$

$k\mid i$，相当于 $k$ 的质因子的指数是 $i$ 的质因子的指数的子集偏序。

仿照挨氏筛，时间复杂度：$O(n\ln\ln n)$，且常数很小。

:::details 点击展开代码
```cpp
bitset<N> not_prime;
not_prime[1] = 1;
for (int i = 2; i <= n; i++) {
    if (not_prime[i])
        continue;
    for (int j = i; j <= n; j += i) {
        a[j] += a[j / i];
        not_prime[j] = 1;
    }
}
```
:::

Dirichlet 后缀和：

对于 $a_i$，求解 $b_i=\sum\limits_{i\mid k}a_k$

稍微变形一下。对于同一个质数 $i$，必须按倍数从大到小更新，使较高次幂和较大倍数的贡献先进入 `a[j]`，再继续传递到 `a[j / i]`；若从小到大更新，后加入 `a[j]` 的贡献将无法继续向下传递。

:::details 点击展开代码
```cpp
bitset<N> not_prime;
not_prime[1] = 1;
for (int i = 2; i <= n; i++) {
    if (not_prime[i])
        continue;
    for (int j = n / i * i; j >= i; j -= i) {
        a[j / i] += a[j];
        not_prime[j] = 1;
    }
}
```
:::
