<h1><center>根号树</center></h1>

根号叉树。


## Sqrt Tree

​Sqrt Tree 可以 $O(n\log\log n)$ 预处理，$O(1)$ 区间询问。

​考虑序列分块，将原序列分成 $\sqrt n$ 块，每块长 $\sqrt n$，每一块内维护前后缀，若询问区间不在同一块内，将首尾散块前后缀拼接，中间整块整取，时间复杂度 $O(\sqrt n)$，若再预处理 $B[i][j]$ 表示第 $i$ 块到第 $j$ 的区间和，预处理时间复杂度 $O(n)$。询问时中间的整块就可以 $O(1)$ 的得到结果，时间复杂度 $O(1)$。若询问区间在同一块内，无法表示，暴力维护时间复杂度：$O(\sqrt n)$。

​不妨将询问区间在同一块内的情况继续递归下去，若每次询问区间不在同一块内，都是 $O(1)$ 可以解决的，反之就递归下去，直到区间长度为 $1$，$O(1)$ 直接解决。

​因为每次递归分块长度都是 $\sqrt n$（$n$ 是当前序列长度），所以次递归序列长度都缩小至原来的 $\sqrt n$，递归 $O(\log\log n)$ 次后即会到 $1$，所以此时询问复杂度已降至 $O(\log\log n)$。空间复杂度也为 $O(n\log\log n)$。

​考虑将这个递归的过程建成一棵树，每个节点都有 $\sqrt n$ 个子节点（除了最后一块可能不足 $\sqrt n$）。

​那么递归的过程就是自下而上找到第一层存在完全包含于询问区间的块，这个过程可以二分，此时时间复杂度降至 $O(\log\log\log n)$。

​通过调整块长还可继续优化，假设每一层块长都为 $2$ 的整数幂次（自下而上递减）。令当前层块长为 $2^k$，序列编号从 $0$ 开始。若 $l,r$ 位于同一个块中，则它们除末尾 $k$ 位以外的高位完全相同；反过来，$l,r$ 的最高不同位若不低于第 $k$ 位，它们就一定属于不同的块。令 $d=l\oplus r$，当 $l\ne r$ 时，最高不同位为

$$h=\lfloor\log_2 d\rfloor,$$

​也就是唯一满足 $2^h\le d<2^{h+1}$ 的 $h$。根据 $h$ 映射到预先选定的层，就能 $O(1)$ 找到可直接拼接前缀、整块和后缀的层。当 $l=r$ 时 $d=0$，对 $0$ 取对数没有定义，必须直接返回单点值。下面的代码使用 $1$ 下标，因此实际计算的是 `(l - 1) ^ (r - 1)`。

​关于块长 $k$ 的选定，要保证树高，不能任意选取。事实上可以发现，若 $k$ 每次只减小 $1$，那么树高为 $O(\log n)$，此时 Sqrt Tree 就是猫树。具体而言，先将原序列扩展至 $2$ 的整数幂长度后，第一次分块，块长选取 $2$ 的 $2$ 的整数幂次次（即 $2^{2^k}$）而后即可按 $\sqrt n$ 分块。树高 $O(\log\log n)$。最后一层的块长可以到 $2^1$，也可以到 $2^0$，但是都要特判等于块长的情况。（询问区间长度等于 $2^1$ 或 $2^0$ 直接做就行）。

​实际维护的时候，不用显式建树，只要维护若干层的分块即可。


::: details 点击展开代码
```cpp
struct SqrtTree
{
    // op 必须满足结合律；代码始终按区间从左到右的顺序合并，
    // 因此不要求 op 满足交换律或幂等性。
    static inline int op(int x, int y)
    {
        return max(x, y);
    }

    struct Layer
    {
        int n = 0;
        int k = 0;
        int S = 0;
        int block_cnt = 0;
        bool top_layer = false;

        vector<int> pre, suf;
        vector<int> between;

        inline int get_between(int lb, int rb) const
        {
            if (top_layer)
            {
                return between[lb * block_cnt + rb];
            }
            else
            {
                int g = lb >> k;
                int li = lb & (S - 1);
                int ri = rb & (S - 1);

                return between[g * S * S + li * S + ri];
            }
        }

        void build(int _k, int _n, const vector<int> &a, bool _top_layer)
        {
            k = _k;
            n = _n;
            S = 1 << k;
            top_layer = _top_layer;
            block_cnt = (n + S - 1) >> k;

            pre.assign(n + 1, 0);
            suf.assign(n + 1, 0);

            vector<int> whole(block_cnt);

            for (int b = 0; b < block_cnt; b++)
            {
                int L = (b << k) + 1;
                int R = min(n, (b + 1) << k);

                pre[L] = a[L];
                for (int i = L + 1; i <= R; i++)
                    pre[i] = SqrtTree::op(pre[i - 1], a[i]);

                suf[R] = a[R];
                for (int i = R - 1; i >= L; i--)
                    suf[i] = SqrtTree::op(a[i], suf[i + 1]);

                whole[b] = pre[R];
            }

            if (top_layer)
            {
                between.assign(block_cnt * block_cnt, 0);

                for (int i = 0; i < block_cnt; i++)
                {
                    int cur = whole[i];
                    between[i * block_cnt + i] = cur;

                    for (int j = i + 1; j < block_cnt; j++)
                    {
                        cur = SqrtTree::op(cur, whole[j]);
                        between[i * block_cnt + j] = cur;
                    }
                }
            }
            else
            {
                int group_cnt = (block_cnt + S - 1) >> k;

                between.assign(group_cnt * S * S, 0);

                for (int g = 0; g < group_cnt; g++)
                {
                    int start = g * S;
                    int end = min(block_cnt - 1, start + S - 1);

                    for (int i = start; i <= end; i++)
                    {
                        int li = i - start;
                        int cur = whole[i];

                        between[g * S * S + li * S + li] = cur;

                        for (int j = i + 1; j <= end; j++)
                        {
                            cur = SqrtTree::op(cur, whole[j]);

                            int lj = j - start;
                            between[g * S * S + li * S + lj] = cur;
                        }
                    }
                }
            }
        }

        inline int query(int l, int r) const
        {
            int bl = (l - 1) >> k;
            int br = (r - 1) >> k;

            int ans = suf[l];

            if (bl + 1 <= br - 1)
                ans = SqrtTree::op(ans, get_between(bl + 1, br - 1));

            ans = SqrtTree::op(ans, pre[r]);

            return ans;
        }
    };

    int orig_n = 0;
    int n = 0;

    vector<int> a;
    vector<Layer> layer;
    vector<short> which;

    static inline int highest_bit(int x)
    {
        return x == 0 ? 0 : 31 - __builtin_clz((unsigned)x);
    }

    void build(const vector<int> &src, int _n)
    {
        // src 使用 1 下标，合法元素为 src[1.._n]。
        assert(_n >= 1 && _n < (int)src.size());
        orig_n = _n;
        layer.clear();
        which.clear();

        n = 1;
        while (n < orig_n)
            n <<= 1;

        a.assign(n + 1, 0);

        for (int i = 1; i <= orig_n; i++)
            a[i] = src[i];

        // 补到 2 的幂。正常询问不会访问补出来的位置。
        // 对本题 max 来说，补什么都不影响合法询问。
        for (int i = orig_n + 1; i <= n; i++)
            a[i] = src[orig_n];

        if (n <= 2)
            return;

        int lgN = __lg(n);

        // top_k 是不超过 log2(n) 的最大 2 的幂。
        // 例如 n = 2^17，则 top_k = 16。
        int top_k = 1;
        while ((top_k << 1) <= lgN)
            top_k <<= 1;

        vector<int> ks;
        for (int k = top_k; k >= 1; k >>= 1)
            ks.push_back(k);

        layer.reserve(ks.size());

        for (int i = 0; i < (int)ks.size(); i++)
        {
            layer.emplace_back();
            layer.back().build(ks[i], n, a, i == 0);
        }

        which.assign(n, 0);

        for (int mask = 1; mask < n; mask++)
        {
            int hb = highest_bit(mask);

            int id = 0;
            while (id + 1 < (int)ks.size() && ks[id] > hb)
                id++;

            which[mask] = (short)id;
        }
    }

    inline int query(int l, int r) const
    {
        if (l == r)
            return a[l];

        if (r == l + 1)
            return op(a[l], a[r]);

        int mask = (l - 1) ^ (r - 1);
        int id = which[mask];

        return layer[id].query(l, r);
    }
};
```
:::

可以发现，Sqrt Tree 维护信息的本质是预处理首尾前后缀和中间整块信息。合并运算必须满足结合律；若运算不满足交换律，查询时必须严格按“左侧后缀、中间整块、右侧前缀”的顺序合并。Sqrt Tree 与猫树（Disjoint Sparse Table）都能处理任意结合运算，不要求幂等性，二者不存在功能上的严格包含关系；经典的重叠 Sparse Table 则通常要求运算幂等。它们的主要差别在预处理层数、空间布局和实现常数，不能笼统写成 `Sqrt Tree > 猫树 > ST 表`。

​上面的参考实现是静态结构，只提供 `build` 和 `query`，不支持修改。某些 Sqrt Tree 变体可以通过重建受影响的块实现单点修改或区间赋值，但复杂度取决于具体分层、重建范围和标记设计，不能把某一变体的修改复杂度直接当作当前模板的能力。

## vEB

Sqrt Tree 是序列上的根号树，vEB 是对值域做根号树。

vEB 功能上与压位 Trie 相同，用于维护插入、删除、前驱、后继、最大值、最小值。

vEB 上每个节点将值域分成 $O(\sqrt V)$ 块，并缓存当前集合的最小值和最大值以便 $O(1)$ 查询。标准递归表示会把最小值单独保存在当前节点、不再放入子树；最大值也是当前节点的缓存，但除集合只有一个元素外，它对应的值仍保存在某个子树中。

每个节点上这 $O(\sqrt V)$ 份子节点，对应 $O(\sqrt V)$ 个 vEB 维护 $O(\sqrt V)$ 份值域。再用一个 vEB 维护哪些子节点存在。

值域根号 $O(\log\log V)$ 次到 $O(1)$，所以树高 $O(\log\log V)$。

空间复杂度：$T(V)=(\sqrt V + 1)\times T(\sqrt V) +O(\sqrt V)=O(V)$。

### 插入

如果当前位置为空，直接令最小值和最大值都等于 $v$。

若 $v$ 小于当前最小值，交换 $v$ 与最小值：新的最小值保留在当前节点，旧的最小值继续向对应子节点递归插入。

随后把 $v$ 插入对应子节点；若该子节点原先为空，还要把它的编号插入 `summary`。若 $v$ 大于当前最大值，插入完成后直接更新最大值，不与旧最大值交换：若此前只有一个元素，旧最大值就是仍保存在当前节点的最小值；否则旧最大值本来就已经存在于子树中。重复插入同一个值时不做任何操作。

时间复杂度：$O(\log\log V)$。

### 删除

如果当前节点表示的值域大小 $\le 2$，特判处理。

如果删除的值为最大值/最小值，需要重新计算子树中的最大值/最小值，找到最大/最小的存在值的子树,返回起最大/最小值即可。

反之，找到 $v$ 所在的子树，递归删除。并且，如果删除 $v$ 后，某个子树空了（如果子树会空，那么说明只有一个元素，只会进行一次操作），还要把这个子节点在维护子节点 vEB 中删除（这是一个子问题）。

时间复杂度：$O(\log\log V)$。

### 后继/前驱

如果和查询的 $v$ 同一个子树中有解，则递归子树。

反之，找到高位/低位第一个存在值的子树，相当于在维护子节点的那个 vEB 中查询后继/前驱，这也是一个递归的过程。

找到那个第一个存在值的子树后，直接返回它维护的最小值/最大值即可。

时间复杂度：$O(\log\log V)$。

### 最大值/最小值

全局的最大最小值是在根节点直接维护的，直接获取即可。

时间复杂度：$O(1)$。



:::details 点击展开代码
```cpp
struct vEB
{
    struct VEB
    {
        static constexpr int BASE_BITS = 6;

        int bits;
        int low_bits, high_bits;
        int mn, mx;

        unsigned long long mask;

        VEB *summary;
        VEB **child;

        VEB(int b = 20)
            : bits(b),
              low_bits(0),
              high_bits(0),
              mn(-1),
              mx(-1),
              mask(0),
              summary(nullptr),
              child(nullptr)
        {
            if (bits > BASE_BITS)
            {
                low_bits = bits >> 1;
                high_bits = bits - low_bits;
            }
        }

        bool is_base() const
        {
            return bits <= BASE_BITS;
        }

        bool empty() const
        {
            return mn == -1;
        }

        int high(int x) const
        {
            return x >> low_bits;
        }

        int low(int x) const
        {
            return x & ((1 << low_bits) - 1);
        }

        int idx(int h, int l) const
        {
            return (h << low_bits) | l;
        }

        int get_min() const
        {
            return mn;
        }

        int get_max() const
        {
            return mx;
        }

        void pull_base()
        {
            if (mask == 0)
            {
                mn = mx = -1;
            }
            else
            {
                mn = __builtin_ctzll(mask);
                mx = 63 - __builtin_clzll(mask);
            }
        }

        void ensure_child_array()
        {
            if (child == nullptr)
            {
                child = new VEB *[1 << high_bits]();
            }
        }

        VEB *ensure_child(int h)
        {
            ensure_child_array();
            if (child[h] == nullptr)
            {
                child[h] = new VEB(low_bits);
            }
            return child[h];
        }

        VEB *get_child(int h) const
        {
            return child == nullptr ? nullptr : child[h];
        }

        VEB *ensure_summary()
        {
            if (summary == nullptr)
            {
                summary = new VEB(high_bits);
            }
            return summary;
        }

        bool contains(int x) const
        {
            if (mn == -1)
                return false;
            if (x == mn || x == mx)
                return true;
            if (x < mn || x > mx)
                return false;

            if (is_base())
            {
                return (mask >> x) & 1ULL;
            }

            int h = high(x);
            int l = low(x);
            VEB *c = get_child(h);
            return c != nullptr && c->contains(l);
        }

        void insert(int x)
        {
            if (is_base())
            {
                mask |= (1ULL << x);
                pull_base();
                return;
            }

            if (mn == -1)
            {
                mn = mx = x;
                return;
            }

            if (x == mn || x == mx)
                return;

            if (x < mn)
            {
                int t = x;
                x = mn;
                mn = t;
            }

            int h = high(x);
            int l = low(x);

            VEB *c = ensure_child(h);

            if (c->empty())
            {
                ensure_summary()->insert(h);
            }

            c->insert(l);

            if (x > mx)
            {
                mx = x;
            }
        }

        void erase(int x)
        {
            if (is_base())
            {
                mask &= ~(1ULL << x);
                pull_base();
                return;
            }

            if (mn == -1 || x < mn || x > mx)
                return;

            if (x != mn && x != mx)
            {
                int h0 = high(x);
                int l0 = low(x);
                VEB *c0 = get_child(h0);
                if (c0 == nullptr || !c0->contains(l0))
                    return;
            }

            if (mn == mx)
            {
                mn = mx = -1;
                return;
            }

            if (x == mn)
            {
                int first_cluster = summary->get_min();
                VEB *c = child[first_cluster];
                int new_low = c->get_min();

                x = idx(first_cluster, new_low);
                mn = x;
            }

            int h = high(x);
            int l = low(x);

            VEB *c = child[h];
            c->erase(l);

            if (c->empty())
            {
                summary->erase(h);

                if (x == mx)
                {
                    int last_cluster = summary->get_max();

                    if (last_cluster == -1)
                    {
                        mx = mn;
                    }
                    else
                    {
                        mx = idx(last_cluster, child[last_cluster]->get_max());
                    }
                }
            }
            else if (x == mx)
            {
                mx = idx(h, c->get_max());
            }
        }

        int prev(int x) const
        {
            if (mn == -1)
                return -1;

            if (is_base())
            {
                if (x <= 0)
                    return -1;

                unsigned long long m;
                if (x >= 64)
                {
                    m = mask;
                }
                else
                {
                    m = mask & ((1ULL << x) - 1ULL);
                }

                if (m == 0)
                    return -1;
                return 63 - __builtin_clzll(m);
            }

            if (x <= mn)
                return -1;
            if (x > mx)
                return mx;

            int h = high(x);
            int l = low(x);

            VEB *c = get_child(h);
            if (c != nullptr)
            {
                int p = c->prev(l);
                if (p != -1)
                {
                    return idx(h, p);
                }
            }

            int pc = summary == nullptr ? -1 : summary->prev(h);

            if (pc == -1)
            {
                return mn;
            }

            return idx(pc, child[pc]->get_max());
        }

        int next(int x) const
        {
            if (mn == -1)
                return -1;

            if (is_base())
            {
                if (x < 0)
                    return get_min();
                if (x >= 63)
                    return -1;

                unsigned long long m = mask & (~0ULL << (x + 1));

                if (m == 0)
                    return -1;
                return __builtin_ctzll(m);
            }

            if (x < mn)
                return mn;
            if (x >= mx)
                return -1;

            int h = high(x);
            int l = low(x);

            VEB *c = get_child(h);
            if (c != nullptr)
            {
                int s = c->next(l);
                if (s != -1)
                {
                    return idx(h, s);
                }
            }

            int sc = summary == nullptr ? -1 : summary->next(h);

            if (sc == -1)
            {
                return mx;
            }

            return idx(sc, child[sc]->get_min());
        }
    };

    static constexpr int UNIVERSE_BITS = 20;
    static constexpr int UNIVERSE_SIZE = 1 << UNIVERSE_BITS;

    VEB root;

    vEB() : root(UNIVERSE_BITS) {}

    static bool in_domain(int x)
    {
        return 0 <= x && x < UNIVERSE_SIZE;
    }

    void insert(int x)
    {
        assert(in_domain(x));
        root.insert(x);
    }

    void erase(int x)
    {
        assert(in_domain(x));
        root.erase(x);
    }

    bool contains(int x) const
    {
        return in_domain(x) && root.contains(x);
    }

    static std::optional<int> to_optional(int value)
    {
        if (value == -1)
            return std::nullopt;
        return value;
    }

    std::optional<int> get_min() const
    {
        return to_optional(root.get_min());
    }

    std::optional<int> get_max() const
    {
        return to_optional(root.get_max());
    }

    std::optional<int> get_prev(int x) const
    {
        assert(in_domain(x));
        return to_optional(root.prev(x));
    }

    std::optional<int> get_next(int x) const
    {
        assert(in_domain(x));
        return to_optional(root.next(x));
    }
};
```
:::

​这份实现的合法值域是 $[0,2^{20})$，并按集合语义忽略重复值。内部用 `-1` 表示空节点，公开的最小值、最大值、前驱和后继接口返回 `std::optional<int>`；`std::nullopt` 表示不存在，因此合法值 `0` 不再与“无解”混淆。使用代码时需要包含 `<optional>`。
