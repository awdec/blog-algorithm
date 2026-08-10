<h1><center>小波树</center></h1>

## 小波树

小波树把整数集合按照值域左右分治递归划分到叶子，查询时根据左右子树的叶子数量递归左右子树。

对于区间查询，再借助一个前缀和，求子树中有多少个落在区间中的点。

空间复杂度：$O(n\log V)$，单次询问时间复杂度：$O(\log V)$。

::: details 点击展开代码
```cpp
struct node
{
    int pos, ls, rs;
};

struct waveTree
{
    node tr[N << 5];
    int sec[N << 5], tmp1[N], tmp2[N];
    int root, idx, pos;

    int build(int L, int R, int l, int r, vector<int> &a)
    {
        if (l > r)
            return 0;

        int now = ++idx;
        ls(now) = rs(now) = 0;
        tr[now].pos = pos;

        if (L == R)
            return now;

        int mid = (L + R) >> 1;

        int cur = 0;
        for (int i = l; i <= r; i++)
        {
            cur += (a[i] <= mid);
            sec[pos + i - l] = cur;
        }
        pos += r - l + 1;

        int cnt1 = 0, cnt2 = 0;
        for (int i = l; i <= r; i++)
        {
            if (a[i] <= mid)
                tmp1[cnt1++] = a[i];
            else
                tmp2[cnt2++] = a[i];
        }
        for (int i = 0; i < cnt1; i++)
            a[l + i] = tmp1[i];
        for (int i = 0; i < cnt2; i++)
            a[l + cnt1 + i] = tmp2[i];
        if (cnt1)
            ls(now) = build(L, mid, l, l + cnt1 - 1, a);
        if (cnt2)
            rs(now) = build(mid + 1, R, l + cnt1, r, a);
        return now;
    }

    int kth(int p, int L, int R, int l, int r, int k)
    {
        if (L == R)
            return L;

        int mid = (L + R) >> 1;
        auto sum = [&](int x) -> int
        {
            if (x <= 0)
                return 0;
            return sec[tr[p].pos + x - 1];
        };
        int al = sum(l - 1), ar = sum(r);
        int cnt = ar - al;
        if (k <= cnt)
            return kth(ls(p), L, mid, al + 1, ar, k);
        return kth(rs(p), mid + 1, R, l - al, r - ar, k - cnt);
    }

    void init()
    {
        root = idx = pos = 0;
    }
};
```
:::

实际上不难发现，小波树递归建树的过程，和逐步将元素插入 01-Trie 的过程是类似的。

而整个分治的过程，又和整体二分的过程，又是类似的。

朴素实现的小波树，与主席树效率差别不大。

### 优化 1 - 离散化

建小波树前将值域离散化到 $O(n)$，那么叶子覆盖值域 $O(n)$，分析同线段树，只需要 $O(n)$ 的节点。

### 优化 2 - 位图

经过优化 1 之后，因为还需要维护一个前缀和，所以空间还是 $O(n\log V)$。

注意到这个前缀和原数组的每一个只需要维护 $0/1$，那么可以使用 bitset 维护，将每 $64$ 位压缩成一个更短的数组，询问时，对于不足 $64$ 位的部分，用一次位运算 $O(1)$ 计算 $1$ 的数量。

结合以上两个优化，空间复杂度降为 $O(\dfrac{n\log n}{w})$。

## 小波矩阵


小波树是静态的，考虑不显式地把树建出来，对于每一层节点的位图，合并成一整个。

这样，小波树就变成了 $O(\log V)$ 层的 $O(n)$ 的位图。

在构建和访问每一层的位图时，因为内存连续，时间效率常数更小。

且因为不需要存储儿子节点信息，只需要通过位图信息递归，因此空间复杂度得到一个机器位数的分母，为 $O(\dfrac{n\log V}{w})$。

查询操作略有变化，原理不变。


::: details 点击展开代码
```cpp
struct BitVector
{
    vector<u64> block;
    vector<int> sum;
    BitVector(int n)
    {
        block.assign((n >> 6) + 3, 0);
        sum.assign((n >> 6) + 4, 0);
    }
    void set(int x)
    {
        block[x >> 6] |= (1ull << (x & 63));
    }
    void build()
    {
        for (unsigned i = 0; i + 1 < sum.size(); i++)
        {
            sum[i + 1] = sum[i] + __builtin_popcountll(block[i]);
        }
    }
    int pre1(int i) const
    {
        int b = i >> 6;
        int offset = i & 63;
        u64 mask = offset == 63 ? ~0ULL : (1ULL << (offset + 1)) - 1;
        return sum[b] + __builtin_popcountll(block[b] & mask);
    }
    int pre0(int i) const
    {
        return i - pre1(i);
    }
};

struct waveMatrix
{
    int m;
    vector<BitVector> c;
    vector<int> zeros;
    void build(int n, vector<int> &a)
    {
        m = 0;
        for (int i = 1; i <= n; i++)
            m = max(m, a[i] ? __lg(a[i]) : 0);
        c.assign(m + 1, BitVector(n));
        zeros.assign(m + 1, 0);
        vector<int> cur(n + 1), tmp0(n), tmp1(n);
        for (int i = 1; i <= n; i++)
        {
            cur[i] = a[i];
        }
        for (int i = m; i >= 0; i--)
        {
            int cnt0 = 0, cnt1 = 0;
            for (int j = 1; j <= n; j++)
            {
                if ((cur[j] >> i) & 1)
                {
                    c[i].set(j);
                    tmp1[cnt1++] = cur[j];
                }
                else
                {
                    tmp0[cnt0++] = cur[j];
                }
            }
            c[i].build();
            zeros[i] = cnt0;
            for (int j = 0; j < cnt0; j++)
            {
                cur[j + 1] = tmp0[j];
            }
            for (int j = 0; j < cnt1; j++)
            {
                cur[cnt0 + j + 1] = tmp1[j];
            }
        }
    }
    int kth(int l, int r, int k)
    {
        int res = 0;
        for (int i = m; i >= 0; i--)
        {
            int cnt = c[i].pre0(r) - c[i].pre0(l - 1);
            if (k <= cnt)
            {
                l = c[i].pre0(l - 1) + 1;
                r = c[i].pre0(r);
            }
            else
            {
                res |= (1 << i);
                k -= cnt;
                l = zeros[i] + c[i].pre1(l - 1) + 1;
                r = zeros[i] + c[i].pre1(r);
            }
        }
        return res;
    }
};
```
:::

## 小波矩阵优化可持久化 01-Trie

既然小波树本质和 01-Trie 几乎相同，那么小波矩阵同样可以用来优化可持久化 01-Trie。（或者说小波矩阵实际上本质与可持久化 01-Trie 相同）

:::details 点击展开代码
```cpp
// 小波矩阵的实现就是通过子树 0 的数量判断迭代方向
```
:::
