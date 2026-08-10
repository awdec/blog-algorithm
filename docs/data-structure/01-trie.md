<h1><center>01-Trie</center></h1>


## 普通 01-Trie

01-Trie 与 Trie 结构相同，区别在于维护的字符集是 $\{0,1\}$。

本文模板约定键为非负 `int`，由调用者传入最高处理位 $x\in[0,30]$；查询前 Trie 必须非空。设处理位数为 $B$、值域上界为 $V$，则单次插入和查询均为 $O(B)=O(\log V)$，插入 $n$ 个数的空间复杂度为 $O(nB)=O(n\log V)$。

::: details 点击展开代码

```cpp
struct Trie01 {
    int root = 0, idx = 0;
    int son[(N << 5) + 1][2]{};
    void init() {
        for (int i = 0; i <= idx; i++)
            memset(son[i], 0, sizeof son[i]);
        root = idx = 0;
    }
    void insert(int &p, int v, int x) {
        if (!p) {
            assert(idx < (N << 5));
            p = ++idx;
            son[p][0] = son[p][1] = 0;
        }
        if (x < 0) {
            return;
        }
        int now = (v >> x) & 1;
        insert(son[p][now], v, x - 1);
    }
    int query_xor_max(int p, int v, int x) {
        assert(p);
        if (x < 0) {
            return 0;
        }
        int now = (v >> x) & 1;
        if (son[p][now ^ 1])
            return query_xor_max(son[p][now ^ 1], v, x - 1) | (1 << x);
        return query_xor_max(son[p][now], v, x - 1);
    }
};
```

:::


## 可持久化 01-Trie

一般可持久化 Trie 仅用于 01-Trie，通过差分可维护区间二进制信息。

每次插入会复制一条长度为 $B$ 的路径，因此构建 $n$ 个版本需要 $O(nB)=O(n\log V)$ 个节点和 $O(n)$ 个版本根。这与普通 01-Trie 的渐进空间量级相同，但并非“不需要额外空间”。

模板约定 `root[i]` 表示插入前 $i$ 个数后的版本。查询区间 $[l,r]$ 时传入 `p = root[l - 1]`、`q = root[r]`，并且必须保证 $1\le l\le r$。

::: details 点击展开代码

```cpp
struct PTrie01 {
    int root[N + 1]{}, idx = 0;
    int sz[(N << 5) + 1]{}, son[(N << 5) + 1][2]{};
    void init(int n) {
        assert(0 <= n && n <= N);
        for (int i = 0; i <= idx; i++){
            memset(son[i], 0, sizeof son[i]);
            sz[i] = 0;
        }
        for (int i = 0; i <= n; i++)
            root[i] = 0;
        idx = 0;
    }
    void insert(int p, int &q, int v, int x) {
        if (!q) {
            assert(idx < (N << 5));
            q = ++idx;
            son[q][0] = son[q][1] = 0;
            sz[q] = 0;
        }
        sz[q] = sz[p];
        sz[q]++;
        if (x < 0)
            return;
        int now = (v >> x) & 1;
        son[q][now ^ 1] = son[p][now ^ 1];
        insert(son[p][now], son[q][now], v, x - 1);
    }
    int query_xor_max(int p, int q, int v, int x) {
        assert(sz[q] > sz[p]);
        if (x < 0) {
            return 0;
        }
        int now = (v >> x) & 1;
        if (sz[son[q][now ^ 1]] - sz[son[p][now ^ 1]] > 0)
            return query_xor_max(son[p][now ^ 1], son[q][now ^ 1], v, x - 1) |
                   (1 << x);
        return query_xor_max(son[p][now], son[q][now], v, x - 1);
    }
};
```

:::

## 压缩 01-Trie

Patricia Trie

容易发现，01-Trie 在插入时，只有当同时拥有左右儿子时，才会分叉。

不分叉时，单链的递归路径是唯一的，那么就可以尝试把它压缩起来。

> 引理：对于一棵除了叶子，其他节点儿子数都是 $2$ 的树而言，非叶子数 $=$ 叶子数 $-1$。

设当前不同元素的数量为 $m$，则叶子数为 $m$，非空树的节点总数恰为 $2m-1$。重复元素由叶子计数维护，不会新建节点。

在时间复杂度 $O(B)$ 不变的前提下，将 01-Trie 的空间复杂度优化至 $O(m)$。下面的静态节点池不回收删除的节点，因此 `N` 必须按整个操作序列中可能创建的节点总数预留，不能只按某一时刻的集合大小估算。

`dep` 表示当前子树可以继续分叉的位置上界（不含）。对非负 `int` 的第 $0\sim30$ 位建树时，首次调用为 `insert(root, 31, v)`，删除时对应调用 `remove(root, 31, v)`。

且因为保证了非叶子的左右儿子一定是存在的，所以查询比 01-Trie 更加方便。

::: details 点击展开代码
```cpp
struct node
{
    int son[2], dep, val;
    int cnt;
};

struct PatriciaTrie
{
    node tr[(N << 1) + 1]{};
    int root = 0, idx = 0;
    void init()
    {
        for (int i = 0; i <= idx; i++)
            tr[i] = {};
        root = idx = 0;
    }
    void insert(int &p, int dep, int v)
    {
        assert(v >= 0 && 0 <= dep && dep <= 31);
        if (!p)
        {
            assert(idx + 1 <= (N << 1));
            p = ++idx;
            tr[p] = {{0, 0}, -1, v, 1};
            return;
        }
        int diff = v ^ tr[p].val;
        int mask1 = (1ll << dep) - 1;
        int mask2 = (tr[p].dep == -1) ? ~0 : ~((1ll << (tr[p].dep + 1)) - 1);
        diff &= (mask1 & mask2);
        if (diff)
        {
            assert(idx + 2 <= (N << 1));
            int high = __lg(diff), old = p;
            int now = ++idx, leaf = ++idx;
            tr[now] = {{0, 0}, high, tr[old].val, 0};
            tr[leaf] = {{0, 0}, -1, v, 1};
            tr[now].son[(tr[old].val >> high) & 1] = old;
            tr[now].son[(v >> high) & 1] = leaf;

            p = now;
            return;
        }
        if (tr[p].dep == -1)
        {
            tr[p].cnt++;
            return;
        }
        insert(tr[p].son[(v >> tr[p].dep) & 1], tr[p].dep, v);
    }
    bool remove(int &p, int dep, int v)
    {
        assert(v >= 0 && 0 <= dep && dep <= 31);
        if (!p)
            return 0;

        int diff = v ^ tr[p].val;
        int mask1 = (1LL << dep) - 1;
        int mask2 = (tr[p].dep == -1) ? ~0 : ~((1LL << (tr[p].dep + 1)) - 1);
        if (diff & mask1 & mask2)
            return 0;
        if (tr[p].dep == -1)
        {
            if (tr[p].val != v)
                return 0;
            assert(tr[p].cnt > 0);
            if (--tr[p].cnt == 0)
                p = 0;
            return 1;
        }

        int now = (v >> tr[p].dep) & 1;
        if (!remove(tr[p].son[now], tr[p].dep, v))
            return 0;
        if (!tr[p].son[now])
        {
            p = tr[p].son[now ^ 1];
        }
        else if (tr[p].val == v)
        {
            tr[p].val = tr[tr[p].son[0]].val;
        }
        return 1;
    }
    int query_max(int v)
    {
        assert(v >= 0 && root);
        int now = root;
        while (tr[now].dep != -1)
        {
            int cur = (v >> tr[now].dep) & 1;
            now = tr[now].son[cur ^ 1];
        }
        return v ^ tr[now].val;
    }
};

```
:::


Patricia Trie 同样可以持久化，但是时空复杂度与可持久化 01-Trie 一致，所以不作展开。


## 压位 01-Trie

压位 01-Trie 本质是一棵 $w$ 叉树（通常 $w=64$，即计算机 `unsigned long long` 的位数）。

每个节点用一个 `unsigned long long` 压缩儿子节点状态，如果 $mask$ 的第 $i$ 为 $1$ 表示第 $i$ 个儿子存在。这样建出来的树高是 $O(\log_{64}V)$，其中 $V$ 表示的值域大小。

通过位运算计算访问相应的节点。

因为压位 01-Trie 只存储「是否存在儿子」的信息，所以不显示建树，直接将每一层的节点拍平成数组。

默认维护值域 $[0,V]$ 上的不可重集，值 $0$ 是合法元素。所有可能无答案的查询都返回 `std::optional<int>`，`std::nullopt` 表示空集或不存在满足条件的元素。空间复杂度为 $O(\dfrac{V}{w})$；如果维护可重集，需要增加计数数组或哈希表。

代码使用 `std::optional`，需要 C++17 或更高标准及 `<optional>`。`insert`/`erase` 返回集合是否实际发生变化，越界、重复插入和删除不存在元素均返回 `false`。

`contains` 的时间复杂度为 $O(1)$，插入、删除、最值、前驱和后继的时间复杂度均为 $O(\log_wV)$。

### 插入/删除

遍历每一层，更新对应节点的儿子节点状态即可。

### 前驱/后继

先自下而上，向前/后找到第一个可转向的层（也就是子树存在叶子的节点），再向下找到那个点。

### 最大值/最小值

其实可以直接转换成判断值域的边界是否存在后查前驱后继。

自上而下，找到最高/最低位 $1$ 即可。

::: details 点击展开代码
```cpp
using u64 = unsigned long long;

struct FastTrie
{
    int V = -1;
    vector<vector<u64>> tr;
    vector<int> nbits;
    void init(int V)
    {
        assert(0 <= V && V < INT_MAX);
        this->V = V;
        tr.clear();
        nbits.clear();
        int idx = 0;
        int now = V + 1;
        while (1)
        {
            idx++;
            int cur = (int)((1LL * now + 63) >> 6);
            if (cur == 1)
                break;
            now = cur;
        }
        tr.reserve(idx);
        nbits.reserve(idx);
        now = V + 1;
        while (1)
        {
            nbits.emplace_back(now);
            int cur = (int)((1LL * now + 63) >> 6);
            tr.emplace_back(cur, 0ULL);
            if (cur == 1)
                break;
            now = cur;
        }
    }
    int lowbit_pos(u64 x)
    {
        return __builtin_ctzll(x);
    }

    int highbit_pos(u64 x)
    {
        return 63 - __builtin_clzll(x);
    }

    u64 prefix_mask(int b)
    {
        return b == 63 ? ~0ULL : ((1ULL << (b + 1)) - 1);
    }

    bool empty()
    {
        return tr.empty() || tr.back()[0] == 0;
    }

    bool in_range(int x)
    {
        return !tr.empty() && 0 <= x && x <= V;
    }

    int next_in_dep(int dep, int pos)
    {
        if (pos >= nbits[dep])
            return -1;
        int w = pos >> 6;
        int b = pos & 63;
        u64 cur = tr[dep][w] & (~0ULL << b);
        if (cur)
        {
            int res = (w << 6) + lowbit_pos(cur);
            return res < nbits[dep] ? res : -1;
        }
        if (dep + 1 >= (int)tr.size())
            return -1;
        int nw = next_in_dep(dep + 1, w + 1);
        if (nw == -1)
            return -1;
        int res = (nw << 6) + lowbit_pos(tr[dep][nw]);
        return res < nbits[dep] ? res : -1;
    }

    int prev_in_dep(int dep, int pos)
    {
        if (pos < 0)
            return -1;
        if (pos >= nbits[dep])
            pos = nbits[dep] - 1;
        int w = pos >> 6;
        int b = pos & 63;
        u64 cur = tr[dep][w] & prefix_mask(b);
        if (cur)
        {
            int res = (w << 6) + highbit_pos(cur);
            return res < nbits[dep] ? res : -1;
        }
        if (dep + 1 >= (int)tr.size())
            return -1;
        int pw = prev_in_dep(dep + 1, w - 1);
        if (pw == -1)
            return -1;
        int res = (pw << 6) + highbit_pos(tr[dep][pw]);
        return res < nbits[dep] ? res : -1;
    }
    bool contains(int x)
    {
        if (!in_range(x))
            return false;
        int w = x >> 6;
        int b = x & 63;
        return (tr[0][w] >> b) & 1ULL;
    }
    bool insert(int x)
    {
        if (!in_range(x))
            return false;
        int w0 = x >> 6;
        int b0 = x & 63;
        u64 m0 = 1ULL << b0;
        if (tr[0][w0] & m0)
            return false;
        int id = x;
        for (int dep = 0; dep < (int)tr.size(); dep++)
        {
            int w = id >> 6;
            int b = id & 63;
            u64 m = 1ULL << b;
            u64 old = tr[dep][w];
            tr[dep][w] |= m;
            if (old)
                break;
            id = w;
        }
        return true;
    }
    bool erase(int x)
    {
        if (!in_range(x))
            return false;
        int w0 = x >> 6;
        int b0 = x & 63;
        u64 m0 = 1ULL << b0;
        if (!(tr[0][w0] & m0))
            return false;
        int id = x;
        for (int dep = 0; dep < (int)tr.size(); dep++)
        {
            int w = id >> 6;
            int b = id & 63;
            u64 m = 1ULL << b;
            tr[dep][w] &= ~m;
            if (tr[dep][w])
                break;
            id = w;
        }
        return true;
    }
    std::optional<int> get_min()
    {
        if (empty())
            return std::nullopt;
        int top = tr.size() - 1;
        int id = lowbit_pos(tr[top][0]);
        for (int dep = top - 1; dep >= 0; dep--)
        {
            id = (id << 6) + lowbit_pos(tr[dep][id]);
        }
        return id;
    }
    std::optional<int> get_max()
    {
        if (empty())
            return std::nullopt;
        int top = tr.size() - 1;
        int id = highbit_pos(tr[top][0]);
        for (int dep = top - 1; dep >= 0; dep--)
        {
            id = (id << 6) + highbit_pos(tr[dep][id]);
        }
        return id;
    }
    std::optional<int> get_prev(int x)
    {
        if (x <= 0 || empty())
            return std::nullopt;
        int p = min(x - 1, V);
        int res = prev_in_dep(0, p);
        if (res == -1)
            return std::nullopt;
        return res;
    }
    std::optional<int> get_next(int x)
    {
        if (x >= V || empty())
            return std::nullopt;
        int p = max(0, x + 1);
        int res = next_in_dep(0, p);
        if (res == -1)
            return std::nullopt;
        return res;
    }
};
```
:::

## 动态开点 $\cdot$ 压位 01-Trie

如果值域达到 $10^{8}$ 甚至更大，那么静态数组就不能支持了。

一个办法是直接恢复到显式地把树建出来（因为 01-Trie 本来就是动态开点的，所以其实就是恢复到了原本的写法），但是这样要存儿子节点的编号。

如果直接存，空间复杂度为 $O(nw\log_wV)$，使用 `map` 维护儿子，时空复杂度均多乘一个 $O(\log w)$，优势变小。

可以用于集合大小不大，但是询问次数爆炸、值域爆炸，并且强制在线的情况。

本节只记录思路，暂未给出可复制的实现。实现时仍需统一约定值域为 $[0,V]$，对所有公开接口进行边界检查，并按整个操作序列中创建的节点总数检查节点映射容量。



::: details 点击展开代码
```cpp
// 规划中：暂无可复制实现。
```
:::
