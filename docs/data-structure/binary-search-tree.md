<h1><center>平衡树</center></h1>

算法竞赛常用平衡树有 Treap、Fhq-Treap、Splay、替罪羊树。

实际上还有 WBLT，但是感觉 WBLT 能干的上面总的找到能干的，算了，体量不要太大，后续再说。

## Treap

Treap 是二叉查找树和二叉堆的结合，即：树上一个节点维护两个值，第一关键字维护 BST 的性质，第二关键字维护 heap 的性质。在本文中，称第一关键字为键值（Key），第二关键字为权值（Val），且本文中 Treap 均默认维护大根堆。

Treap 通过固定每个节点的 Val，使得 BST 能根据 heap 的性质在增删改查时动态调整形态。若各节点的 Val 独立随机生成，Treap 的形态等价于随机二叉搜索树，因此树高和单次操作的期望复杂度为 $O(\log n)$，并且在常见随机模型下以高概率保持对数高度；这不是最坏情况保证，极端情况下树高仍可能达到 $O(n)$。

因为 Treap 只通过 Val 维护树高，所以增删改查操作不受影响，与朴素 BST 操作完全一致。只是需要在增删等会影响 BST 形态的操作时，同时维护 Val 的 heap 性质即可。

### 插入：

假设插入元素 $v$ 在 Treap 上新建了一个节点 $p$，新建节点 $p$ 的 Val 是随机产生的，可能并不满足 $Val(p)\leq Val(fa(p))$，那么就需要修正 Treap 的形态。

根据 $p$ 是 $fa(p)$ 的左儿子还是右儿子，可将修正操作分为左旋和右旋。

<center><img src="/treap_rotate.svg" alt="" width="85%"></center>


上图中不满足 heap 性质需要旋转的点分别为 $3$（左旋） 和 $2$（右旋） 只有上图中涉及的点会在旋转中被影响到，若其中部分点不存在，当作空节点同样处理即可。

具体而言，当前节点为 $p$，$p$ 左儿子为 $ls$，$p$ 右儿子为 $rs$。对于右旋，令 $q$ 为 $ls$ 的右儿子，$ls$ 成为根，$p$ 成为 $ls$ 的右儿子，因此 $q$ 成为 $p$ 的左儿子；对于左旋，令 $q$ 为 $rs$ 的左儿子，$rs$ 成为根，$p$ 成为 $rs$ 的左儿子，因此 $q$ 成为 $p$ 的右儿子。

将 $p$ 调整至父节点后，可能会继续和新的父节点不满足 heap 的性质，所以递归下去继续旋转即可。旋转次数与树高同阶，因此期望为 $O(\log n)$，最坏为 $O(n)$。

### 删除：

假设删除元素 $v$ 使得 Treap 上节点 $p$ 被删除，若 $p$ 不存在左右儿子，则 $p$ 可以直接删除。若 $p$ 只存在左儿子或右儿子，则可以将 $p$ 替换成左儿子或右儿子即可。若 $p$ 既存在左儿子也存在右儿子，通常有两种解决办法：第一种，惰性删除，即只是将节点上的 $cnt$ 标记为 $0$，在后续操作中特殊处理。第二种，将 $p$ 旋转至叶子后直接删去。旋转次数的期望复杂度为 $O(\log n)$，最坏为 $O(n)$。向左儿子旋转还是向右儿子旋转由 heap 的性质决定：应把 Val 更大的儿子旋转到父节点的位置。

:::details 点击展开代码
```cpp
struct node {
    int l, r;
    int key, val;
    int cnt, sz;
};
struct Treap {
    node tr[N];
    int root, idx;
    void push_up(int p) { tr[p].sz = tr[ls(p)].sz + tr[rs(p)].sz + tr[p].cnt; }
    int make_node(int key) {
        tr[++idx] = {0, 0, key, rand(), 1, 1};
        return idx;
    }
    void zig(int &p) {
        int q = ls(p);
        ls(p) = rs(q);
        rs(q) = p;
        p = q;
        push_up(rs(p)), push_up(p);
    }
    void zag(int &p) {
        int q = rs(p);
        rs(p) = ls(q);
        ls(q) = p;
        p = q;
        push_up(ls(p)), push_up(p);
    }
    void build() {
        root = idx = 0;
        tr[0] = {0, 0, 0, 0, 0, 0};
    }
    void insert(int &p, int key) {
        if (!p)
            p = make_node(key);
        else if (tr[p].key == key)
            tr[p].cnt++;
        else if (key < tr[p].key) {
            insert(ls(p), key);
            if (tr[ls(p)].val > tr[p].val)
                zig(p);
        } else if (key > tr[p].key) {
            insert(rs(p), key);
            if (tr[rs(p)].val > tr[p].val)
                zag(p);
        }
        if (p)
            push_up(p);
    }
    bool remove(int &p, int key) {
        if (!p)
            return false;
        bool removed = false;
        if (tr[p].key == key) {
            removed = true;
            if (tr[p].cnt > 1) {
                tr[p].cnt--;
            } else if (ls(p) || rs(p)) {
                if (!rs(p) || tr[ls(p)].val > tr[rs(p)].val) {
                    zig(p);
                    remove(rs(p), key);
                } else {
                    zag(p);
                    remove(ls(p), key);
                }
            } else
                p = 0;
        } else if (key < tr[p].key) {
            removed = remove(ls(p), key);
        } else {
            removed = remove(rs(p), key);
        }
        if (p)
            push_up(p);
        return removed;
    }
    int get_rank_by_key(int p, int key) {
        if (!p)
            return 0;
        if (key == tr[p].key)
            return tr[ls(p)].sz;
        if (key < tr[p].key)
            return get_rank_by_key(ls(p), key);
        return tr[ls(p)].sz + tr[p].cnt + get_rank_by_key(rs(p), key);
    }
    std::optional<int> get_key_by_rank(int p, int rank) {
        if (!p || rank <= 0 || rank > tr[p].sz)
            return std::nullopt;
        if (tr[ls(p)].sz >= rank)
            return get_key_by_rank(ls(p), rank);
        if (tr[ls(p)].sz + tr[p].cnt >= rank)
            return tr[p].key;
        return get_key_by_rank(rs(p), rank - tr[ls(p)].sz - tr[p].cnt);
    }
    std::optional<int> get_prev(int p, int key) {
        std::optional<int> result;
        while (p) {
            if (tr[p].key < key) {
                result = tr[p].key;
                p = rs(p);
            } else {
                p = ls(p);
            }
        }
        return result;
    }
    std::optional<int> get_next(int p, int key) {
        std::optional<int> result;
        while (p) {
            if (tr[p].key > key) {
                result = tr[p].key;
                p = ls(p);
            } else {
                p = rs(p);
            }
        }
        return result;
    }
} treap;
```
:::

## FHQ Treap

通常情况下，Treap 指的是有旋 Treap，即通过旋转操作维护 heap 性质。但是实际上，还存在另一种维护 heap 性质的方式：分裂、合并。一般称之为 Fhq-Treap 或无旋 Treap。

### 分裂：

分裂操作有两种：按键值分裂，按排名分裂。

#### 键值分裂：

对于一个参数 $v$，把 Treap 分裂成两部分：$tree_1$ 满足所有节点键值 $\le v$，$tree_2$ 满足所有节点键值 $>v$。返回 $tree_1$ 的根和 $tree_2$ 的根。

具体实现，从 Treap 根节点开始，若当前节点键值 $Key>v$，则当前节点和右子树都属于 $tree_2$，同时左子树中可能仍然存在键值 $>v$ 的节点，所以要递归下去分裂并把递归返回的 $tree_2$ 作为当前节点的左子树；若当前节点键值 $Key\leq v$，则当前节点和左子树都属于 $tree_1$，同时右子树中可能仍然存在键值 $\leq v$ 的节点，所以要递归下去分裂并把递归返回的 $tree_1$ 作为当前节点的右子树。

#### 排名定位分裂：

下面的值域 Treap 将相同键值聚合在一个节点中，`cnt[p]` 表示重复次数，`sz[p]` 按元素个数计数。因此一个节点可能同时覆盖一段排名，不能把落在 `cnt[p]` 中部的排名直接解释成“节点之前”和“节点之后”。

本文的 `split_around_rank(p, rank)` 定义为：在 $1\le rank\le sz[p]$ 时，返回键值更小的树、排名区间覆盖 `rank` 的完整节点、键值更大的树。若 `rank` 落在某个节点的重复计数内部，该节点的全部 `cnt` 个元素都放在中间部分；它不是“严格取前 `rank - 1` 个元素”的分裂。若确实需要按元素个数切成前 $k$ 个和其余元素，就必须拆分该节点的 `cnt`，并在重新合并时恢复相同键值只占一个节点的不变量。隐式序列 Treap 通常令每个节点的 `cnt=1`，不存在这个歧义。

实际分裂中，当然可能出现不存在满足条件的 $tree$，对应部分返回空节点即可。注意分裂时要修改分裂后，节点的父子关系。

### 合并：

合并接受两个参数：$root_1,root_2$，要求 $root_1$ 为根的 $tree_1$ 中所有节点的键值 $\leq$ $root_2$ 为根的 $tree_2$ 中的所有节点的键值，并且两棵输入树本身都已经满足 heap 性质。合并时根据两个根的 Val 决定新根，再递归合并相邻的两棵子树。若 Val 独立随机，`split` 和 `merge` 的期望复杂度为 $O(\log n)$，最坏复杂度仍为 $O(n)$。

Fhq-Treap 要保证操作结束后还是一整棵树，也就是每一次通过分裂操作实现别的操作后，都要通过合并操作把树合并回去。

围绕 Fhq-Treap 的分裂、合并操作，增删改查操作和朴素 BST 有所不同，存在更加简便的做法：本质是将要操作元素单独分裂出来，然后操作即可。

通过分裂和合并实现查询时常数较大；不改变树形的查询也可以像朴素 BST 一样沿路径完成。后一种写法的期望复杂度为 $O(\log n)$，但同样不具有最坏 $O(\log n)$ 保证。


:::details 点击展开代码
```cpp
 struct node {
    int ls, rs, key, val, cnt, sz;
};
struct fhq_treap {
    node tr[N];
    int idx, root;
    int make_node(int key) {
        tr[++idx] = {0, 0, key, -rand(), 1, 1};
        return idx;
    }
    void push_up(int p) { tr[p].sz = tr[ls(p)].sz + tr[rs(p)].sz + tr[p].cnt; }
    // equal_to_left 为 true 时分成 <= key 和 > key，
    // 否则分成 < key 和 >= key，避免对键值做减一运算。
    pair<int, int> split_by_key(int p, int key, bool equal_to_left) {
        if (!p)
            return {0, 0};
        if (tr[p].key < key || (equal_to_left && tr[p].key == key)) {
            auto temp = split_by_key(rs(p), key, equal_to_left);
            rs(p) = temp.first;
            push_up(p);
            return {p, temp.second};
        } else {
            auto temp = split_by_key(ls(p), key, equal_to_left);
            ls(p) = temp.second;
            push_up(p);
            return {temp.first, p};
        }
    }
    tuple<int, int, int> split_around_rank(int p, int rank) {
        if (!p)
            return {0, 0, 0};
        if (rank <= tr[ls(p)].sz) {
            int l, mid, r;
            tie(l, mid, r) = split_around_rank(ls(p), rank);
            ls(p) = r;
            push_up(p);
            return {l, mid, p};
        } else if (rank <= tr[ls(p)].sz + tr[p].cnt) {
            int l = ls(p), r = rs(p);
            ls(p) = rs(p) = 0;
            push_up(p);
            return {l, p, r};
        } else {
            int l, mid, r;
            tie(l, mid, r) =
                split_around_rank(rs(p), rank - tr[ls(p)].sz - tr[p].cnt);
            rs(p) = l;
            push_up(p);
            return {p, mid, r};
        }
    }
    int merge(int u, int v) {
        if (!u && !v)
            return 0;
        if (u && !v)
            return u;
        if (!u && v)
            return v;
        if (tr[u].val < tr[v].val) {
            rs(u) = merge(rs(u), v);
            push_up(u);
            return u;
        } else {
            ls(v) = merge(u, ls(v));
            push_up(v);
            return v;
        }
    }
    void insert(int key) {
        auto temp = split_by_key(root, key, true);
        auto l = split_by_key(temp.first, key, false);
        int now = 0;
        if (!l.second) {
            now = make_node(key);
        } else {
            tr[l.second].cnt++;
            push_up(l.second);
        }
        int L = merge(l.first, !l.second ? now : l.second);
        root = merge(L, temp.second);
    }
    bool remove(int key) {
        auto temp = split_by_key(root, key, true);
        auto l = split_by_key(temp.first, key, false);
        bool removed = (l.second != 0);
        if (tr[l.second].cnt > 1) {
            tr[l.second].cnt--;
            push_up(l.second);
            l.first = merge(l.first, l.second);
        }
        root = merge(l.first, temp.second);
        return removed;
    }
    int get_rank_by_key(int p, int key) {
        auto temp = split_by_key(p, key, false);
        int res = tr[temp.first].sz + 1;
        root = merge(temp.first, temp.second);
        return res;
    }
    std::optional<int> get_key_by_rank(int p, int rank) {
        if (rank <= 0 || rank > tr[p].sz)
            return std::nullopt;
        while (p) {
            if (rank <= tr[ls(p)].sz) {
                p = ls(p);
            } else if (rank <= tr[ls(p)].sz + tr[p].cnt) {
                return tr[p].key;
            } else {
                rank -= tr[ls(p)].sz + tr[p].cnt;
                p = rs(p);
            }
        }
        return std::nullopt;
    }
    std::optional<int> get_pre(int key) {
        auto temp = split_by_key(root, key, false);
        auto res = get_key_by_rank(temp.first, tr[temp.first].sz);
        root = merge(temp.first, temp.second);
        return res;
    }
    std::optional<int> get_suf(int key) {
        auto temp = split_by_key(root, key, true);
        auto res = get_key_by_rank(temp.second, 1);
        root = merge(temp.first, temp.second);
        return res;
    }
} tree;
```
:::


## Splay

### 伸展：

Splay 通过伸展操作，不断将某个节点旋转到根节点，即任意操作后得到的节点，都要转到根。能够在均摊 $O(\log n)$ 的时间内完成增删改查。

因为 Splay 的伸展操作，需要考虑的情况过于繁多（主要是多，单独并不难考虑），所以为了简化问题，本文将略过这个具体过程，将其视作一个伸展操作的封装即可。

具体而言，`splay(x,y)` 即表示把 $x$ 旋转成 $y$ 的儿子。要求 $y$ 是 $x$ 的祖先，否则不会执行。因为一般情况下，根节点没有父节点，而按照 `splay(x,y)` 的定义，如果想把 $x$ 转到根，根不能没有父亲，所以 Splay 一般特殊定义根的父亲为 $0$。

Splay 上的增删改查都基于 `splay(x,y)` 实现。具体而言，先目标元素的前驱转到根，再把目标元素的后继转到前驱的右儿子，此时，目标的位置就是后继的左儿子。这里和 Fhq-Treap 相同，都是将目标元素表示成一棵子树。

:::details 点击展开代码
```cpp
struct node {
    int s[2];
    int key, fa, cnt, sz;
};
struct Splay {
    node tr[N];
    int root, idx;
    void push_up(int p) { tr[p].sz = tr[ls(p)].sz + tr[rs(p)].sz + tr[p].cnt; }
    void rotate(int x) {
        int y = tr[x].fa, z = tr[y].fa;
        // push_down(y); 如果需要 push_down 的话
        // push_down(x);
        bool w = (rs(y) == x);
        if (z)
            tr[z].s[rs(z) == y] = x;
        tr[x].fa = z;
        int child = tr[x].s[w ^ 1];
        tr[y].s[w] = child;
        if (child)
            tr[child].fa = y;
        tr[x].s[w ^ 1] = y, tr[y].fa = x;
        push_up(y), push_up(x);
    }
    void splay(int x, int k) {
        while (tr[x].fa != k) {
            int y = tr[x].fa, z = tr[y].fa;
            if (z != k) {
                if ((rs(y) == x) ^ (rs(z) == y))
                    rotate(x);
                else
                    rotate(y);
            }
            rotate(x);
        }
        if (!k)
            root = x;
    }
    int make_node(int key, int fa) {
        tr[++idx] = {0, 0, key, fa, 1, 1};
        return idx;
    }
    void init() {
        for (int i = 1; i <= idx; i++)
            tr[i] = {0, 0, 0, 0, 0, 0};
        idx = root = 0;
        tr[++idx] = {0, 2, -inf, 0, 1, 2};
        tr[++idx] = {0, 0, inf, 1, 1, 1};
        root = 1;
    }
    int get_pre(int key, int y = 0) {
        int x = root, res = 0;
        while (x) {
            if (tr[x].key < key) {
                if (!res || tr[res].key < tr[x].key)
                    res = x;
                x = rs(x);
            } else {
                x = ls(x);
            }
        }
        // 因为初始化插入了 -inf 所以前驱一定存在
        splay(res, y);
        return res;
    }
    int get_suf(int key, int y = 0) {
        int x = root, res = 0;
        while (x) {
            if (tr[x].key > key) {
                if (!res || tr[res].key > tr[x].key)
                    res = x;
                x = ls(x);
            } else {
                x = rs(x);
            }
        }
        // 因为初始化插入了 inf 所以后继一定存在
        splay(res, y);
        return res;
    }
    void insert(int key) {
        auto pre = get_pre(key);
        auto suf = get_suf(key, pre);
        auto &now = ls(suf);
        if (now) {
            tr[now].cnt++;
        } else {
            now = make_node(key, suf);
        }
        splay(now, 0);
    }
    bool remove(int key) {
        auto pre = get_pre(key);
        auto suf = get_suf(key, pre);
        auto &now = ls(suf);

        if (!now || tr[now].key != key)
            return false;

        if (tr[now].cnt > 1) {
            tr[now].cnt--;
            push_up(now);
            splay(now, 0);
        } else {
            tr[now].fa = 0;
            now = 0;
            push_up(suf);
            push_up(pre);
        }
        return true;
    }
    int get_rank_by_key(int key) {
        // 统计比 key 小的数量，注意 -inf
        get_pre(key);
        return tr[root].cnt + tr[ls(root)].sz;
    }
    std::optional<int> get_key_by_rank(int rank) {
        // 根的 sz 还包含 -inf 和 inf 两个内部哨兵。
        if (rank <= 0 || rank > tr[root].sz - 2)
            return std::nullopt;
        int x = root;
        rank++; // 需要加上 -inf 的贡献
        while (x) {
            if (tr[ls(x)].sz >= rank) {
                x = ls(x);
            } else if (tr[ls(x)].sz + tr[x].cnt >= rank) {
                splay(x, 0);
                return tr[root].key;
            } else {
                rank -= tr[ls(x)].sz + tr[x].cnt;
                x = rs(x);
            }
        }
        return std::nullopt;
    }
    std::optional<int> predecessor(int key) {
        int p = get_pre(key);
        if (tr[p].key == -inf)
            return std::nullopt;
        return tr[p].key;
    }
    std::optional<int> successor(int key) {
        int p = get_suf(key);
        if (tr[p].key == inf)
            return std::nullopt;
        return tr[p].key;
    }
} tree;
```
:::
Splay 采用迭代实现，一方面是为了方便在操作后进行 splay 操作，另一方面是抵消常数（实际这部分影响比较小）。

## 替罪羊树

替罪羊树通过引入一个平衡因子 $\alpha$，表示当子节点的子树大小超过当前节点的子树大小 $\times \alpha$ 时将子节点的子树重构的方式，保证树高始终在 $O(\log n)$。一般 $\alpha$ 设为 $0.7$ 或 $0.8$。

### 重构：

重构分为两个步骤：按中序遍历展开成序列；二分建树。返回重构后的根节点。

### 插入：

插入部分和朴素 BST 一致，区别在于递归返回时要判断子节点的子树是否需要重构。

### 删除：

替罪羊树可以实现普通的物理删除，但删除后必须继续维护子树大小并在失衡时重构；“不能普通删除”并不是数据结构本身的限制。下面的模板为了简化实现采用惰性删除，`cnt` 为 $0$ 表示该键当前不存在。删除前仍须检查键是否存在，避免重复删除使 `cnt` 变成负数。

下面的实现不再插入 $-INF,+INF$ 实体哨兵，避免它们参与有效元素的子树最值；只有 $0$ 号空节点使用 `maxn=-INF,minn=INF` 作为 `max`、`min` 的幺元。

### 前驱/后继：

因为替罪羊树采用惰性删除，所以查询前驱/后继时，经过的键值不能直接递归。在朴素 BST 中查询 $v$ 的前驱时，若当前的键值 $<v$，则递归右子树查询。因为朴素 BST 中节点上的键值是一定存在的，所以可以向更大的右节点递归。但是在替罪羊树中，当前节点的键值可能不存在，此时不能向右递归，因为可能左子树中还可能有前驱。因此最坏情况下需要遍历整棵 BST。时间复杂度：$O(n)$。

如果要直接递归求前驱/后继，为每个点再维护一个子树 $\min,\max$ 即可。

另一个简单的实现是，rank 和 K-th 不受惰性删除影响，所以，可以通过 rank 和 K-th 查询前驱/后继。

实践中，虽然通过 rank 和 K-th 查询前驱/后继需要操作两次，但是因为不需要维护 $\min,\max$，所以常数差不多，可能前者还更快一点。

:::details 点击展开代码
```cpp
struct node {
    int ls, rs, key, cnt, sz, s;
    int maxn, minn;
};
struct Tzy_tree {
    node tr[N];
    int root, idx;
    int sec[N];
    double alpha = 0.7;
    bool need_rebuild(int p) {
        return alpha * tr[p].s <= (double)max(tr[ls(p)].s, tr[rs(p)].s);
    }

    void push_up(int p) {
        tr[p].s = tr[ls(p)].s + tr[rs(p)].s + 1;
        tr[p].sz = tr[ls(p)].sz + tr[rs(p)].sz + tr[p].cnt;
        if (!tr[p].cnt) {
            tr[p].maxn = -inf;
            tr[p].minn = inf;
        } else {
            tr[p].maxn = tr[p].minn = tr[p].key;
        }

        tr[p].maxn = max({tr[p].maxn, tr[ls(p)].maxn, tr[rs(p)].maxn});
        tr[p].minn = min({tr[p].minn, tr[ls(p)].minn, tr[rs(p)].minn});
    }
    void Flatten(int &id, int p) {
        if (!p)
            return;
        Flatten(id, ls(p));
        if (tr[p].cnt)
            sec[++id] = p;
        Flatten(id, rs(p));
    }
    int Rebuild(int l, int r) {
        if (l > r)
            return 0;
        int mid = l + r >> 1;
        ls(sec[mid]) = Rebuild(l, mid - 1);
        rs(sec[mid]) = Rebuild(mid + 1, r);
        push_up(sec[mid]);
        return sec[mid];
    }
    void Re(int &p) {
        int id = 0;
        Flatten(id, p);
        p = Rebuild(1, id);
    }
    int make_node(int key) {
        tr[++idx] = {0, 0, key, 1, 1, 1, key, key};
        return idx;
    }
    void init() {
        for (int i = 0; i <= idx; i++)
            tr[i] = {0, 0, 0, 0, 0, 0, -inf, inf};
        idx = root = 0;
    }
    void insert(int &p, int key) {
        if (!p) {
            p = make_node(key);
            return;
        }
        if (key < tr[p].key) {
            insert(ls(p), key);
        } else if (key == tr[p].key) {
            tr[p].cnt++;
        } else {
            insert(rs(p), key);
        }
        push_up(p);
        if (need_rebuild(p))
            Re(p);
    }
    bool remove(int p, int key) {
        if (!p)
            return false;

        bool removed;
        if (key < tr[p].key) {
            removed = remove(ls(p), key);
        } else if (key == tr[p].key) {
            if (!tr[p].cnt)
                return false;
            tr[p].cnt--;
            removed = true;
        } else {
            removed = remove(rs(p), key);
        }
        if (removed)
            push_up(p);
        return removed;
    }
    int get_rank_by_key(int p, int key) {
        if (!p)
            return 0;
        if (tr[p].key < key)
            return tr[p].cnt + tr[ls(p)].sz + get_rank_by_key(rs(p), key);
        return get_rank_by_key(ls(p), key);
    }
    std::optional<int> get_key_by_rank(int p, int rank) {
        if (!p || rank <= 0 || rank > tr[p].sz)
            return std::nullopt;
        if (tr[ls(p)].sz >= rank)
            return get_key_by_rank(ls(p), rank);
        if (tr[ls(p)].sz + tr[p].cnt >= rank)
            return tr[p].key;
        return get_key_by_rank(rs(p), rank - tr[ls(p)].sz - tr[p].cnt);
    }
    std::optional<int> get_pre(int key) {
        int x = root, res = 0;
        bool found = false;
        while (x) {
            if (tr[x].key < key) {
                if (tr[x].cnt) {
                    if (!found || res < tr[x].key)
                        res = tr[x].key, found = true;
                } else if (tr[ls(x)].sz && (!found || res < tr[ls(x)].maxn)) {
                    res = tr[ls(x)].maxn, found = true;
                }
                x = rs(x);
            } else {
                x = ls(x);
            }
        }
        if (!found)
            return std::nullopt;
        return res;
    }
    std::optional<int> get_suf(int key) {
        int x = root, res = 0;
        bool found = false;
        while (x) {
            if (tr[x].key > key) {
                if (tr[x].cnt) {
                    if (!found || tr[x].key < res)
                        res = tr[x].key, found = true;
                } else if (tr[rs(x)].sz && (!found || tr[rs(x)].minn < res)) {
                    res = tr[rs(x)].minn, found = true;
                }
                x = ls(x);
            } else {
                x = rs(x);
            }
        }
        if (!found)
            return std::nullopt;
        return res;
    }
} tree;
```
:::


## 隐式序列平衡树

值域平衡树用键值决定中序顺序；隐式序列平衡树不把固定的原下标存成 BST 键。节点的当前位置由中序顺序和子树大小动态确定，即当前排名是它的“隐式键”。插入、删除、移动或翻转都会改变后续节点的排名，因此固定原下标无法维护这些操作。

FHQ Treap 通常按“前 $k$ 个元素”和“其余元素”分裂，Splay 通常把第 $l-1$ 个与第 $r+1$ 个节点伸展成祖孙关系，从而把区间 $[l,r]$ 暴露成一棵子树。序列中的每个元素通常单独占一个节点，即 `cnt=1`；节点可以保存元素值，但元素值不参与树形的 BST 比较。访问子节点前还必须下传区间懒标记。

### 区间加与区间翻转

先按当前排名把 $[l,r]$ 分离成一棵子树，再给该子树根增加加法或翻转懒标记，最后重新合并。FHQ Treap 的期望复杂度为 $O(\log n)$，Splay 的均摊复杂度为 $O(\log n)$。

### 区间移动

先分离并删除待移动区间，再按“删除后的序列下标”分裂目标位置，最后把区间子树拼接进去。必须明确目标位置是在删除前还是删除后编号，避免区间位于目标位置之前时产生下标偏移。复杂度与常数次分裂、合并相同。

### 区间插入

在位置 $p$ 后插入长度为 $k$ 的序列时，先把原树分成前 $p$ 个元素和其余元素，再把新序列的树拼在中间。逐个插入新节点的期望复杂度为 $O(k\log n)$；若先在线性时间内建好新序列对应的树，则总期望复杂度为 $O(k+\log n)$。

### 线性建树

FHQ Treap 的中序顺序已经由输入序列确定。为每个节点独立生成随机 Val 后，应使用单调栈按笛卡尔树方式连接父子关系，并在建树后按后序计算 `sz`，总时间为 $O(n)$。不能先随意二分建树、随机填写 Val，再期待后续一次 `merge` 修复内部 heap 性质；`merge` 的前提正是两棵输入子树已经分别满足 heap 性质。

Splay 不依赖随机优先级，可以按序列中点递归建立近似平衡的初始树，并自底向上维护信息，建树时间为 $O(n)$。

## 边界约定

上述模板的第 $k$ 小、前驱和后继接口使用 `std::optional<int>` 表示无解，需要 C++17 和 `<optional>`。Splay 内部仍使用 $-INF,+INF$ 两个哨兵简化伸展操作，但哨兵不是合法输入值，公开查询通过 `std::nullopt` 隐藏哨兵。删除接口在目标不存在时返回 `false`，不得修改 $0$ 号节点或已有子树信息。

## 比较

|种类|常数的常见表现|区间翻转|持久化|
|---|---|---|---|
|Treap|通常较小|×|√|
|FHQ Treap|取决于 split/merge 次数|√|√|
|Splay|通常较大|√|×|
|替罪羊树|取决于重构频率|×|×|

WBLT 时间常数可能还要更小一些，再说吧。

表中的常数只是在特定编译器、内存布局、随机数生成器和操作分布下的经验描述，不是普遍性能排序；实际选择应以目标环境中的基准测试为准。
