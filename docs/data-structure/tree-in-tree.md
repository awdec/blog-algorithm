<h1><center>树套树</center></h1>

在算法竞赛中，我们有时需要维护多维度信息。在这种时候，可以使用树套树来维护。​树套树简单来说就是树形数据结构上的每一个节点都维护了一个树形结构，而不是简单的几个信息。

为避免混淆，下文约定 $n$ 为初始点数（同时假设外层下标已经压缩到 $[1,n]$），$q$ 为初始化后的操作数，$V$ 为内层坐标或权值的值域大小。未特别说明时，“修改、询问复杂度”均指单次操作；处理全部操作的时间还要乘以相应的操作次数。

​一般而言，是线段树的每一个节点维护了另一个数据结构。若每个初始点被存入外层线段树中所有包含它的位置，则所有初始点在内层结构中的副本总数为 $O(n\log n)$。这只能用于估计静态建树的基础规模；修改引入的新权值还可能使空间与 $q$、$V$ 有关，不能据此直接断定整棵树套树的时空复杂度。

​往往外层线段树只是用于维护内层数据结构，信息还是由内层数据结构维护。

​树套树的询问，同样依托于线段树的核心性质：一个区间 $[l,r]$ 在线段树上是 $O(\log n)$ 个节点，所以树套树的询问相当于将 $O(\log n)$ 个内层数据结构的信息询问后进行合并。若内层结构单次询问为 $O(w_q)$，则一次外层区间询问为 $O(w_q\log n)$。

​对于单点修改操作，只会涉及到线段树上 $O(\log n)$ 个节点，所以树套树的修改相当于对 $O(\log n)$ 个内层数据结构进行修改。若内层结构单次修改为 $O(w_u)$，则一次外层单点修改为 $O(w_u\log n)$。注意不要只修改叶子然后用 `push_up` 维护祖先节点，那样依赖子节点信息的重构显然时间复杂度会爆炸。

​至此，树套树与仅使用内层数据结构维护信息相比，不仅支持了区间询问，还支持了修改操作。

## 树状数组套 DS

### 树状数组套树状数组

实际上就是所谓二维树状数组。

设外层坐标范围为 $[1,n]$，内层坐标范围为 $[1,V]$。单点修改和二维矩形前缀询问的单次时间复杂度均为 $O(\log n\log V)$；用单点修改加入 $n$ 个初始点需要 $O(n\log n\log V)$，处理 $q$ 次操作需要 $O(q\log n\log V)$。

使用稠密二维数组时，空间复杂度为 $O(nV)$。

:::details 点击展开代码
```cpp
struct BBIT
{
    int tr[N][N], n, m;
    int lowbit(int x)
    {
        return x & -x;
    }
    void update(int x, int y, int v)
    {
        for (; x <= n; x += lowbit(x))
            for (int i = y; i <= m; i += lowbit(i))
                tr[x][i] += v;
    }
    int query(int x, int y)
    {
        int res = 0;
        for (; x; x -= lowbit(x))
            for (int i = y; i; i -= lowbit(i))
                res += tr[x][i];
        return res;
    }
};
```
:::

### 树状数组套 vector 

需要离线收集 $n$ 个初始点以及后续修改可能出现的所有 $(x,y)$。候选修改点至多有 $n+q$ 个；每个候选点的 $y$ 坐标会被注册到 $O(\log n)$ 个外层树状数组节点中。

因此，所有内层 `vector` 共保存 $O((n+q)\log n)$ 个离散化坐标，空间复杂度也是 $O((n+q)\log n)$。对各个 `vector` 排序、去重的预处理时间上界为 $O((n+q)\log n\log(n+q))$。

前缀询问时，对于内层 vector 再维护一个数据结构，这里可以直接选择再套一个树状数组。

一次修改或前缀询问需要访问 $O(\log n)$ 个外层节点，并在内层离散坐标上执行 $O(\log(n+q))$ 的操作，因此单次时间复杂度为 $O(\log n\log(n+q))$，处理 $q$ 次操作的总时间为 $O(q\log n\log(n+q))$。

实现上常数较小。

:::details 点击展开代码
```cpp
struct BitVec
{
    vector<vector<int>> tr, vec;
    vector<int> cnt;
    int n;
    int lowbit(int x)
    {
        return x & -x;
    }
    void init(vector<pii> &a)
    {
        n = a[0].first;
        for (auto [u, v] : a)
        {
            n = max(n, u);
        }
        tr.resize(n + 1);
        vec.resize(n + 1);
        cnt.assign(n + 1, 0);
        for (auto [u, v] : a)
            for (; u <= n; u += lowbit(u))
                cnt[u]++;
        for (int i = 1; i <= n; i++)
            vec[i].reserve(cnt[i]);
        for (auto [u, v] : a)
            for (; u <= n; u += lowbit(u))
                vec[u].push_back(v);
        for (int i = 1; i <= n; i++)
        {
            sort(vec[i].begin(), vec[i].end());
            vec[i].erase(unique(vec[i].begin(), vec[i].end()), vec[i].end());
            tr[i].assign(vec[i].size() + 1, 0);
        }
    }
    void update(int x, int y, int v)
    {
        for (; x <= n; x += lowbit(x))
        {
            int now = lower_bound(vec[x].begin(), vec[x].end(), y) - vec[x].begin() + 1;
            for (int i = now; i <= vec[x].size(); i += lowbit(i))
                tr[x][i] += v;
        }
    }
    int query(int x, int y)
    {
        int res = 0;
        for (; x; x -= lowbit(x))
        {
            int now = upper_bound(vec[x].begin(), vec[x].end(), y) - vec[x].begin();
            for (int i = now; i; i -= lowbit(i))
                res += tr[x][i];
        }
        return res;
    }
};
```
:::

### 树状数组套动态开点线段树

和套 vector 类似地，只是内层使用动态开点线段树在线维护。

但是实际实现上，不用生硬地给每一个树状数组节点单独开一个动态开点线段树结构。

可以给树状数组节点一个 $root$ 数组，每个节点分配一个根，这样就可以使用同一个动态开点线段树结构。

求解区间第 $k$ 大时，对于涉及到的 $O(\log n)$ 个树状数组节点，可以同步维护左右子树走向。这时可以发现，这和“主席树”的结构就很像了（虽然两者之间没有什么实际关系），所以被俗称“带修主席树”。

注：实际上在特化维护带修区间第 $k$ 大时，还有一些常数的技巧，这里不做展开。

:::details 点击展开代码
```cpp
struct BitSeg
{
    struct node
    {
        int sum, ls, rs;
    } tr[N * 400];
    int root[N];
    int n, m, idx;
    void push_up(int p)
    {
        tr[p].sum = tr[ls(p)].sum + tr[rs(p)].sum;
    }
    void update(int &p, int l, int r, int x, int v)
    {
        int mid = l + r >> 1;
        if (!p)
            p = ++idx;
        if (l == r)
        {
            tr[p].sum += v;
            return;
        }
        if (x <= mid)
            update(ls(p), l, mid, x, v);
        else
            update(rs(p), mid + 1, r, x, v);
        push_up(p);
    }
    int lowbit(int x)
    {
        return x & -x;
    }
    void init(int n, int m)
    {
        this->n = n;
        this->m = m;
        for (int i = 1; i <= idx; i++)
            tr[i] = {0, 0, 0};
        idx = 0;
        for (int i = 1; i <= n; i++)
            root[i] = 0;
    }
    void add(int x, int v)
    {
        for (; x <= n; x += lowbit(x))
        {
            update(root[x], 0, m, v, 1);
        }
    }
    void del(int x, int v)
    {
        for (; x <= n; x += lowbit(x))
        {
            update(root[x], 0, m, v, -1);
        }
    }
    int query(int l, int r, int k)
    {
        static int al[40], ar[40];

        int cntl = 0, cntr = 0;
        for (int x = l - 1; x; x -= lowbit(x))
            al[++cntl] = root[x];
        for (int x = r; x; x -= lowbit(x))
            ar[++cntr] = root[x];
        int L = 0, R = m;
        while (L != R)
        {
            int mid = L + R >> 1;
            int cnt = 0;
            for (int i = 1; i <= cntr; i++)
            {
                cnt += tr[ls(ar[i])].sum;
            }
            for (int i = 1; i <= cntl; i++)
            {
                cnt -= tr[ls(al[i])].sum;
            }
            if (k <= cnt)
            {
                for (int i = 1; i <= cntl; i++)
                    al[i] = ls(al[i]);
                for (int i = 1; i <= cntr; i++)
                    ar[i] = ls(ar[i]);
                R = mid;
            }
            else
            {
                k -= cnt;
                for (int i = 1; i <= cntl; i++)
                    al[i] = rs(al[i]);
                for (int i = 1; i <= cntr; i++)
                    ar[i] = rs(ar[i]);
                L = mid + 1;
            }
        }
        return L;
    }
};
```
:::

内层动态线段树的深度为 $O(\log V)$。加入 $n$ 个初始点需要 $O(n\log n\log V)$ 的时间；单次修改或区间第 $k$ 小询问均为 $O(\log n\log V)$，处理 $q$ 次操作的总时间为 $O(q\log n\log V)$。若后续修改不断引入新的权值路径，动态结点数的上界为 $O((n+q)\log n\log V)$。

## 线段树套 DS

### 线段树套动态开点线段树

通常是线段树套权值线段树。

外层线段树上，每一个节点维护一棵动态开点线段树.

加入 $n$ 个初始点的建树时间为 $O(n\log n\log V)$。一次单点修改或区间权值询问需要访问 $O(\log n)$ 个外层节点，并在深度为 $O(\log V)$ 的内层线段树中操作，因此单次时间为 $O(\log n\log V)$，处理 $q$ 次操作的总时间为 $O(q\log n\log V)$。不回收动态结点时，空间上界为 $O((n+q)\log n\log V)$。

### 线段树套平衡树

外层线段树上，每一个节点维护了一棵平衡树。

固定维护 $n$ 个点时，若逐点插入建树，初始化时间为 $O(n\log^2 n)$，空间复杂度为 $O(n\log n)$。一次单点修改或区间询问为 $O(\log^2 n)$，处理 $q$ 次操作的总时间为 $O(q\log^2 n)$。平衡树的高度由其中保存的元素数决定，因此这里的复杂度不直接依赖数值域 $V$；若操作会增加点数而不只是替换权值，应将公式中的 $n$ 换成操作过程中的最大活动点数，最坏可达 $n+q$。

## 分块套 DS

稍带一下。

形如「第二分块」就是一种分块套并查集。
