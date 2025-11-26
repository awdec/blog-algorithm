<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>Dirichlet 前缀和</center></h1>

对于 $a_i$，求解 $b_i=\sum\limits_{k\mid i}a_k$

$k\mid i$，相当于 $k$ 的质因子的指数是 $i$ 的质因子的指数的子集偏序。

仿照挨氏筛，时间复杂度：$O(n\ln\ln n)$，且常数很小。

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

Dirichlet 后缀和：

对于 $a_i$，求解 $b_i=\sum\limits_{i\mid k}a_k$

稍微变形一下：

```cpp
bitset<N> not_prime;
not_prime[1] = 1;
for (int i = 2; i <= n; i++) {
    if (not_prime[i])
        continue;
    for (int j = i; j <= n; j += i) {
        a[j / i] += a[j];
        not_prime[j] = 1;
    }
}
```