<h1><center>K-D tree</center></h1>

K-D Tree 用于处理高维点集信息。

K-D Tree 每次选择一个坐标轴，并以该维的中位数为基准把点集分到左右子树。一个节点维护的子树对应一个轴对齐包围盒，查询时可用包围盒判定整棵子树与查询区域相交、包含或分离。

经典的正交范围报告结论需要明确前提：维数 $k$ 是固定常数，树按中位数等方式保持平衡，并且查询区域是轴对齐的长方体。在这种模型下，报告查询的最坏时间通常写为

$$O\left(n^{1-\frac1k}+output\right),$$

其中 `output` 是实际输出的点数。若节点保存区间和等聚合信息，完全覆盖时可以整棵子树取值，不必逐点输出，但 $O(n^{1-1/k})$ 的访问界仍依赖上述平衡、固定维数和轴对齐条件。对任意分割策略、已经失衡的动态 KD-tree 或其他类型的查询，不能无条件套用该界；安全的最坏上界可能退化为 $O(n+output)$，聚合查询则可能退化为 $O(n)$。

不带重构的在线插入只有在插入顺序可视为随机排列，并且点坐标、分割轴和相等键处理满足相应独立或一般位置假设时，才能把树高 $O(\log n)$ 作为期望结论。它不是最坏情况保证；对抗性插入顺序可以构造出 $O(n)$ 高度。因此需要重构来获得不依赖输入顺序的平衡性：

- 替罪羊树式重构：插入后若左右子树大小失衡，就重构该子树。平衡系数 $\alpha$ 常取 $0.75$；具体插入均摊复杂度还取决于一次重构的实现成本。
- 二进制分组重构：维护若干大小为 $2^i$ 的静态平衡 KD-tree，像二进制进位一样合并重建，常见实现的插入均摊复杂度为 $O(\log^2 n)$。对固定 $k\ge2$，若每个大小为 $2^i$ 的块都满足经典正交查询界，则所有块的非输出查询成本之和为

$$
\sum_i O\left((2^i)^{1-\frac1k}\right)
=O\left(n^{1-\frac1k}\right).
$$

二维时这才特化为 $\sum_i O(\sqrt{2^i})=O(\sqrt n)$；更高维必须使用指数 $1-1/k$。各块实际报告的点数之和仍为总 `output`。如果维数随 $n$ 增长，或各静态块不满足平衡构建前提，上述求和结论也不能直接使用。

K-D Tree 的实际查询效率很依赖数据分布、维数、包围盒质量和剪枝效果，竞赛中通常还需要结合题目进行常数优化。

:::details 点击展开代码
```cpp
struct KDTree // 同时支持 2D/3D
{
    struct node
    {
        int ls = 0, rs = 0, sz = 0, sum = 0, val = 0;
        int d[3];
        int mn[3], mx[3];
        int dim = 0;

        node()
        {
            for (int i = 0; i < 3; i++)
            {
                d[i] = 0;
                mn[i] = INF;
                mx[i] = -INF;
            }
        }
    } tr[N];

    int root, idx;
    int sec[N], cnt;
    int k;

    void init(int _k)
    {
        k = _k;
        root = idx = cnt = 0;
    }

    int make_node(int a[], int z)
    {
        ++idx;
        tr[idx] = node();
        tr[idx].ls = tr[idx].rs = 0;
        tr[idx].sz = 1;
        tr[idx].sum = tr[idx].val = z;
        tr[idx].dim = 0;
        for (int i = 0; i < k; i++)
        {
            tr[idx].d[i] = a[i];
            tr[idx].mn[i] = a[i];
            tr[idx].mx[i] = a[i];
        }
        return idx;
    }

    void push_up(int p)
    {
        auto &now = tr[p];
        now.sz = 1;
        now.sum = now.val;
        for (int i = 0; i < k; i++)
            now.mn[i] = now.mx[i] = now.d[i];

        if (ls(p))
        {
            auto &L = tr[ls(p)];
            now.sz += L.sz;
            now.sum += L.sum;
            for (int i = 0; i < k; i++)
            {
                now.mn[i] = min(now.mn[i], L.mn[i]);
                now.mx[i] = max(now.mx[i], L.mx[i]);
            }
        }
        if (rs(p))
        {
            auto &R = tr[rs(p)];
            now.sz += R.sz;
            now.sum += R.sum;
            for (int i = 0; i < k; i++)
            {
                now.mn[i] = min(now.mn[i], R.mn[i]);
                now.mx[i] = max(now.mx[i], R.mx[i]);
            }
        }
    }

    bool cmp(int a, int b, int d)
    {
        return tr[a].d[d] < tr[b].d[d];
    }

    int build(int l, int r)
    {
        if (l > r)
            return 0;

        int mn[3], mx[3];
        for (int i = 0; i < k; i++)
            mn[i] = mx[i] = tr[sec[l]].d[i];

        for (int i = l + 1; i <= r; i++)
        {
            auto now = sec[i];
            for (int j = 0; j < k; j++)
            {
                mn[j] = min(mn[j], tr[now].d[j]);
                mx[j] = max(mx[j], tr[now].d[j]);
            }
        }

        int d = 0;
        for (int i = 1; i < k; i++)
            if (mx[i] - mn[i] > mx[d] - mn[d])
                d = i;

        int mid = l + r >> 1;
        nth_element(sec + l, sec + mid, sec + r + 1,
                    [&](int a, int b)
                    {
                        return cmp(a, b, d);
                    });

        int now = sec[mid];
        tr[now].dim = d;
        ls(now) = build(l, mid - 1);
        rs(now) = build(mid + 1, r);
        push_up(now);
        return now;
    }

    void flatten(int p)
    {
        if (!p)
            return;
        flatten(ls(p));
        sec[++cnt] = p;
        flatten(rs(p));
        ls(p) = rs(p) = 0;
    }

    void rebuild(int &p)
    {
        cnt = 0;
        flatten(p);
        p = build(1, cnt);
    }

    bool bad(int p)
    {
        return max(tr[ls(p)].sz, tr[rs(p)].sz) * 4 > tr[p].sz * 3;
    }

    bool flag;
    int rebuild_father, rebuild_side = -1;

    void insertNode(int &p, int q, int father, int side)
    {
        if (!p)
        {
            p = q;
            return;
        }

        if (cmp(p, q, tr[p].dim))
            insertNode(rs(p), q, p, 1);
        else
            insertNode(ls(p), q, p, 0);

        push_up(p);

        if (bad(p))
        {
            flag = 1;
            rebuild_father = father;
            rebuild_side = side;
        }
    }

    void insert(int a[], int z)
    {
        int p = make_node(a, z);
        flag = 0;
        rebuild_father = 0;
        rebuild_side = -1;
        insertNode(root, p, 0, -1);

        if (flag)
        {
            if (!rebuild_father)
            {
                rebuild(root);
            }
            else
            {
                if (!rebuild_side)
                    rebuild(ls(rebuild_father));
                else
                    rebuild(rs(rebuild_father));
            }
        }
    }

    void insert(int x, int y, int z)
    {
        int a[3] = {x, y, 0};
        insert(a, z);
    }

    void insert(int x, int y, int z, int w)
    {
        int a[3] = {x, y, z};
        insert(a, w);
    }

    bool out(int p, int l[], int r[])
    {
        for (int i = 0; i < k; i++)
            if (r[i] < tr[p].mn[i] || tr[p].mx[i] < l[i])
                return 1;
        return 0;
    }

    bool in(int p, int l[], int r[])
    {
        for (int i = 0; i < k; i++)
            if (l[i] > tr[p].mn[i] || tr[p].mx[i] > r[i])
                return 0;
        return 1;
    }

    bool point_in(int p, int l[], int r[])
    {
        for (int i = 0; i < k; i++)
            if (l[i] > tr[p].d[i] || tr[p].d[i] > r[i])
                return 0;
        return 1;
    }

    int query(int p, int l[], int r[])
    {
        if (!p)
            return 0;

        auto &now = tr[p];

        if (out(p, l, r))
            return 0;
        if (in(p, l, r))
            return now.sum;

        int res = 0;
        if (point_in(p, l, r))
            res += now.val;
        res += query(ls(p), l, r);
        res += query(rs(p), l, r);
        return res;
    }

    int query(int p, int x, int y, int X, int Y)
    {
        int l[3] = {x, y, 0};
        int r[3] = {X, Y, 0};
        return query(p, l, r);
    }

    int query(int p, int x, int y, int z, int X, int Y, int Z)
    {
        int l[3] = {x, y, z};
        int r[3] = {X, Y, Z};
        return query(p, l, r);
    }

};

```
:::
