<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>整体二分</center></h1>

整体二分是一种优秀的离线算法。对于可二分答案的问题，我们可以采用整体二分的方法处理多组询问。整体二分的思想非常巧妙，能够替代很多复杂的数据结构，代码也十分好写，是考场上的一大利器。

整体二分一般用于多次询问的问题。并且每次的询问都可以用二分答案的方式求解。

整体二分简单来说就是直接对于所有询问整体上二分一个答案。然后把询问按照是大于还是小于等于当前二分的答案划分到两个集合里去就行了。最后到二分答案的边界时，属于当前集合的询问的答案就是这个边界。

优化时间复杂度的本质是：多组询问共用一次 `check` 计算。

时间复杂度：$O(n\log mT(n))$，因为每个询问最坏会递归 $O(\log n)$ 次，总共产生 $O(n\log m)$ 的 `check`，其中 $O(T(n))$ 表示 `check` 的时间复杂度。

因为整体二分离线的特性，所以在部分情况下，可以使用更低的空间复杂度。

```cpp
void solve(int ql, int qr, int L, int R, int al, int ar) {
    if (ql > qr){
        for (int i = al; i <= ar; i++) // 加上 [L, R] 的贡献
        return;
    }
    if (al > ar)
        return;
    if (L == R) {
        for (int i = ql; i <= qr; i++)
            ans[Q[i].id] = L;
        for (int i = al; i <= ar; i++) // 加上 [L, R] 的贡献
        return;
    }
    int mid = L + R >> 1, cnt1 = 0, cnt2 = 0, ret1 = 0, ret2 = 0;

    for (int i = al; i <= ar; i++) {
        if (/* a[i] 信息 <= mid */) {
            update(a[i].id, 1);
        }
        if (/* a[i] 信息 <= mid */) {
            a1[++ret1] = a[i];
        } else {
            a2[++ret2] = a[i];
        }
    }
    for (int i = ql; i <= qr; i++) {
        if (/* Q[i] 的答案在 [l, mid] */) {
            Q1[++cnt1] = Q[i];
        } else {
            Q2[++cnt2] = Q[i];
        }
    }

    for (int i = al; i <= ar; i++)
        if (/* a[i] 信息 <= mid */)
            update(a[i].id, -1); // 把 [l, mid] 的贡献删去


    for (int i = 1; i <= cnt1; i++)
        Q[ql + i - 1] = Q1[i];
    for (int i = 1; i <= cnt2; i++)
        Q[ql + i - 1 + cnt1] = Q2[i];
    for (int i = 1; i <= ret1; i++)
        a[al + i - 1] = a1[i];
    for (int i = 1; i <= ret2; i++)
        a[al + i - 1 + ret1] = a2[i];

    solve(ql, ql + cnt1 - 1, L, mid, al, al + ret1 - 1);
    // 保证递归 [mid+1, R] 时 [l, mid] 的贡献都算了一遍
    solve(ql + cnt1, qr, mid + 1, R, al + ret1, ar);
}
```

## 扩展

有一种情况是，如果询问中同时带修，那么部分情况下，整体二分需要能够把修改的贡献在询问中减掉，然后递归。

例如带修的区间第 $k$ 大。