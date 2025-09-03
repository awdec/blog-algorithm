<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>cdq 分治</center></h1>

cdq 分治是用于解决二维偏序的分治算法（因为 N 维偏序可以通过排序钦定第一维的顺序，所以 N 维偏序等价于求新序列的 N-1 维偏序）。

对于序列 $(a,b)$ 的二维偏序 $(a_i,b_i)\preccurlyeq(a_j,b_j)$，分为三部分统计：
- $[l,mid],i,j\in[l,mid]$，递归左区间
- $[mid+1,r],i,j\in[mid+1,r]$，递归右区间
- $i\in[l,mid],j\in[mid+1,r]$，遍历左/右区间，使用数据结构维护另一个区间的贡献

```cpp
void cdq(int l, int r) {
    if (l >= r) {
        return;
    }
    int mid = l + r >> 1;
    cdq(l, mid);
    cdq(mid + 1, r);

    int now = l;
    for (int i = mid + 1; i <= r; i++) {
        while (now <= mid && a[now].a <= a[i].a) {
            // 第一维 已升序，维护 第二维 的贡献
            now++;
        }
        // 计算 i 的答案
    }
    for (int i = l; i < now; i++) // 删除 [l, now] 的贡献

    // 归并 第一维 升序
    int cnt = 0;
    now = mid + 1;
    for (int i = l; i <= mid; i++) {
        while (now <= r && a[now].a <= a[i].a) {
            A[++cnt] = a[now];
            now++;
        }
        A[++cnt] = a[i];
    }
    while (now <= r) {
        A[++cnt] = a[now];
        now++;
    }
    for (int i = 1; i <= cnt; i++)
        a[l - 1 + i] = A[i];
}
```


理论上对每一维嵌套 cdq 分治可以 $O(n\log^{N-1}nT(n))$ 解决 N 维偏序，其中 $T(n)$ 是数据结构的时间复杂度，通常为 $O(\log n)$。但是算法竞赛的一般情况下，$O(n\log^3n)$ 与小常数 $O(n^2)$ 就已相差无几，$O(n\log^4n)$ 更是几乎跑不过 $O(n^2)$。