<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>树状数组</center></h1>

## 线性建树

​树上共有 $n$ 个节点，父节点比子节点编号大，树状数组上 $x$ 的父亲是 $x+lowbit(x)$，所以从小到大枚举节点，用当前节点更新父亲的值即可。

```cpp
void init(int n, vector<int> &a) {
    this->n = n;
    for (int i = 1; i <= n; i++) {
        tr[i] += a[i];
        int j = i + lowbit(i);
        if (j <= n)
            tr[j] += tr[i];
    }
}
```

​还有一个更简单的 $O(n)$ 建树，即根据树状数组管辖区间定义，$tr_x$ 表示 $[x-lowbit(x)+1,x]$ 的区间，所以预处理前缀和数组 $sum$，$tr_x=sum_x-sum_{x-lowbit(x)}$ 即可。

```cpp
void init(int n, vector<int> &sum) {
    this->n = n;
    for (int i = 1; i <= n; i++) {
        tr[i] += sum[i] - sum[i - lowbit(i)];
    }
}
```

## 树状数组倍增

​对于 $a_i\ge 0$，求最小的 $x$ 满足 $\sum\limits_{i=1}^xa_i>y$。

​从最高位开始，若这一位的管辖区间的 $sum$ 加上已经累计的 $res$ 后超过了 $y$，则考虑下一位，反之累计到 $res$ 中。最后累计过的所有位的或就是满足题意的最小 $x$。

​空间复杂度：$O(n)$。单次时间复杂度：$O(\log n)$。只能维护前缀。

```cpp
int ask(int v) {
    int now = 0;
    for (int i = 20; i >= 0; i--) {
        int cur = now + (1 << i);
        if (cur > n)
            continue;
        if (tr[cur] <= v) {
            now = cur;
            v -= tr[now];
        }
    }
    return now + 1;
}
```

## 树状数组维护区间加、区间和：

区间和可差分为前缀和。

令 $a'$ 表示 $a$ 的一阶差分数组，那么 $a$ 的一阶前缀和等于 $a'$ 的二阶前缀和。

交换求和次序可得：$\sum\limits_{j=1}^i\sum\limits_{k=1}^j a'_k=\sum\limits_{k=1}^i a'_k\times (i-k+1)=(i+1)\times\sum\limits_{k=1}^i a'_k-\sum\limits_{k=1}^i k\times a'_k$。

所以可以转换成在两个差分数组上的单点加和区间和，使用两个树状数组维护即可。

与线段树相比具有常数小、代码短的优势。洛谷【线段树 1】上述实现效率和码量都是递归线段树 $\frac{1}{2}$。


## 维护不可差分信息

​以区间 $\max$ 为例。

### 单点修改：

​将 $a_x$ 修改成 $v$ 后，若直接对 $x$ 的所有祖先节点取 $\max$，是错误的。因为将 $a_x$ 修改成 $v$，若 $\max$ 就是原本的 $a_x$，那么 $a_x$ 不存在了，理论上 $x$ 的所有祖先节点都应先变成次大值，然后再更新，但是因为信息的不可差分性，导致了这个次大无法维护。

​解决办法是，从后代更新到祖先，那么当更新到祖先时，后代就一定是正确的，所以每次将当前节点修改为 $v$ 后，再用该节点的所有儿子节点更新该节点即可。

​不难得到，$x$ 的所有儿子节点为：$x-2^k,2^k<lowbit(x)$。时间复杂度：$O(\log^2n)$。

```cpp
void update(int x, int v) {
    a[x] = v;
    for (; x <= n; x += lowbit(x)) {
        tr[x] = a[x];
        for (int y = 1; y < lowbit(x); y <<= 1)
            tr[x] = max(tr[x], tr[x - y]);
    }
}
```

### 区间询问：

​和树状数组倍增类似，假设询问区间 $[l,r]$，从 $r$ 不断 $-lowbit(r)$ 直到继续减会小于 $l$。而后 $r-1$，继续迭代。时间复杂度：$O(\log^2n)$。

```cpp
int query(int l, int r) {
    int res = 0;
    while (r >= l) {
        res = max(res, a[r]);
        --r;
        for (; r - lowbit(r) >= l; r -= lowbit(r)) res = max(res, tr[r]);
    }
    return res;
}
```

​容易发现，可差分信息也可以通过这个求（但是没有必要）。实测洛谷【树状数组 1】上述 $O(n\log^2n)$ 比 $O(n\log n)$ 线段树快一点，但是慢于 zkw 线段树，所以没有什么实际意义。