<h1><center>线段树</center></h1>

## zkw 线段树

​普通线段树是一棵二叉树，zkw 线段树是一棵满二叉树，同样采用堆式建树。因为其满二叉树的性质，使得它能容易地获取叶子节点编号，也可以通过位运算简单地获取区间。具有代码短，常数小的优点。

了解即可，实用价值有，但是不大。

​下面以区间加、区间和为例。接口统一使用从 $0$ 开始的半开区间 $[l,r)$。与递归线段树一样，迭代线段树也可以使用懒标记：修改完整覆盖节点时，必须让 `sum` 增加“增量乘区间长度”，查询或继续向下访问前再把祖先标记下传。

​数组固定树形也不意味着不能持久化；可以持久化底层数组或记录每个版本的修改。只是竞赛中路径复制通常配合显式左右儿子的递归实现更方便。

:::details 区间加、区间和参考实现
```cpp
struct zkw_segment_tree {
    int size, height;
    vector<long long> sum, tag;
    vector<int> length;

    void apply(int p, long long value) {
        sum[p] += value * length[p];
        if (p < size)
            tag[p] += value;
    }

    void push_up(int p) {
        // tag[p] 永久保留在 p 上时也不能丢掉它的贡献。
        sum[p] = sum[p << 1] + sum[p << 1 | 1] + tag[p] * length[p];
    }

    void push_down(int p) {
        if (!tag[p])
            return;
        apply(p << 1, tag[p]);
        apply(p << 1 | 1, tag[p]);
        tag[p] = 0;
    }

    void push_path(int p) {
        for (int level = height; level >= 1; level--)
            push_down(p >> level);
    }

    void init(const vector<long long> &a) {
        size = 1;
        height = 0;
        while (size < (int)a.size()) {
            size <<= 1;
            height++;
        }

        sum.assign(size << 1, 0);
        tag.assign(size, 0);
        length.assign(size << 1, 1);
        length[0] = 0;
        for (int p = size - 1; p; p--)
            length[p] = length[p << 1] + length[p << 1 | 1];
        for (int i = 0; i < (int)a.size(); i++)
            sum[size + i] = a[i];
        for (int p = size - 1; p; p--)
            push_up(p);
    }

    void range_add(int l, int r, long long value) {
        if (l >= r)
            return;
        int left = l + size, right = r + size;
        int left_leaf = left, right_leaf = right - 1;
        push_path(left_leaf);
        push_path(right_leaf);

        while (left < right) {
            if (left & 1)
                apply(left++, value);
            if (right & 1)
                apply(--right, value);
            left >>= 1;
            right >>= 1;
        }

        for (int p = left_leaf >> 1; p; p >>= 1)
            push_up(p);
        for (int p = right_leaf >> 1; p; p >>= 1)
            push_up(p);
    }

    long long range_sum(int l, int r) {
        if (l >= r)
            return 0;
        int left = l + size, right = r + size;
        push_path(left);
        push_path(right - 1);

        long long left_sum = 0, right_sum = 0;
        while (left < right) {
            if (left & 1)
                left_sum += sum[left++];
            if (right & 1)
                right_sum += sum[--right];
            left >>= 1;
            right >>= 1;
        }
        return left_sum + right_sum;
    }

    void point_add(int position, long long value) {
        range_add(position, position + 1, value);
    }

    long long point_query(int position) {
        return range_sum(position, position + 1);
    }
};
```
:::

​建树为 $O(n)$，区间修改和区间查询均为 $O(\log n)$，空间复杂度为 $O(n)$。

## 猫树

名字由来似乎是首次在国内 OI 届引入此数据结构的选手的网名。

​猫树通常指 Disjoint Sparse Table，用于静态区间询问。它只要求合并运算满足结合律，不要求幂等性；预处理时间和空间均为 $O(n\log n)$，非空区间查询为 $O(1)$。

​对于两个叶子节点 $l,r$，设它们的 LCA 表示区间 $[L,R]$，中点为 $mid$。当 $l<r$ 时，查询区间恰好按顺序分成 $[l,mid]$ 与 $[mid+1,r]$，两部分拼接后得到 $[l,r]$。

​若每一层都维护块内的后缀积和前缀积，那么查询 $[l,r]$ 时，只需找到 $l,r$ 的最高不同位所在层，把从 $l$ 到块中点的后缀积与从中点到 $r$ 的前缀积合并。对于非交换运算，顺序必须是 `op(suffix[l], prefix[r])`，不能颠倒。

​对于 LCA，因为 zkw 是满二叉树，所以 $l,r$ 的 LCA 容易发现就是它们节点编号的二进制表达下的 Lcp（类似 01-Trie）。使用位运算容易得到 `LCA = l >> (log[l ^ r] + 1)`。

:::details 点击展开代码
```cpp
template <class T, class Op>
struct disjoint_sparse_table {
    int n, levels;
    vector<T> value;
    vector<vector<T>> table;
    Op op;

    // a 使用 0 下标。
    void init(const vector<T> &a, Op operation = Op()) {
        value = a;
        op = operation;
        n = (int)a.size();
        levels = 0;
        while ((1 << levels) < n)
            levels++;
        table.assign(levels, vector<T>(n));

        for (int k = 0; k < levels; k++) {
            int half = 1 << k;
            int block_length = half << 1;
            for (int left = 0; left < n; left += block_length) {
                int middle = min(left + half, n);
                int right = min(left + block_length, n);

                if (left < middle) {
                    table[k][middle - 1] = value[middle - 1];
                    for (int i = middle - 2; i >= left; i--)
                        table[k][i] = op(value[i], table[k][i + 1]);
                }
                if (middle < right) {
                    table[k][middle] = value[middle];
                    for (int i = middle + 1; i < right; i++)
                        table[k][i] = op(table[k][i - 1], value[i]);
                }
            }
        }
    }

    // 查询 0 下标闭区间 [left, right]，要求 left <= right。
    T query(int left, int right) const {
        if (left == right)
            return value[left];
        int level = 31 - __builtin_clz((unsigned)(left ^ right));
        return op(table[level][left], table[level][right]);
    }
};
```
:::

​经典的重叠 Sparse Table 依赖幂等性，而猫树与 Sqrt Tree 都能维护任意结合运算。它们的功能不存在严格包含关系，空间常数也取决于布局、是否补齐到二次幂以及实现方式，不能笼统断言“至少是 ST 表四倍”或“Sqrt Tree 功能严格更强”。


## 李超线段树

​李超线段树用于动态插入直线或限定横坐标范围的线段，并查询给定横坐标处的最优直线。下文维护最大值；若纵坐标相同，规定编号更小的直线更优。

​下面的实现维护离散横坐标数组 `x`。树上区间 $[l,r]$ 表示 `x[l]` 到 `x[r]`，所有插入端点和查询横坐标都必须先映射为数组下标。节点的 `id == 0` 明确表示“当前节点没有直线”，不会访问 `line[0]`，因此区间插入时允许出现已经创建、但尚未保存主导直线的祖先节点。

### 询问：

​查询时沿根到叶子的路径，把途中所有非空主导直线按同一个比较规则合并即可，时间复杂度为 $O(\log C)$，其中 $C$ 是离散横坐标数量。

:::details 整数直线、离散横坐标参考实现
```cpp
using i128 = __int128_t;

struct li_chao_tree {
    struct line_type {
        long long slope, intercept;
        i128 value(long long x) const {
            return (i128)slope * x + intercept;
        }
    };
    struct node_type {
        int left = 0, right = 0, id = 0;
    };

    vector<long long> x;
    vector<line_type> line{line_type{}}; // 下标 0 不存放直线
    vector<node_type> tree{node_type{}}; // 下标 0 表示空节点
    int root = 0;

    void init(vector<long long> coordinates) {
        sort(coordinates.begin(), coordinates.end());
        coordinates.erase(unique(coordinates.begin(), coordinates.end()), coordinates.end());
        assert(!coordinates.empty());
        x = move(coordinates);
        line.assign(1, line_type{});
        tree.assign(1, node_type{});
        root = 0;
    }

    int add_line(long long slope, long long intercept) {
        line.push_back({slope, intercept});
        return (int)line.size() - 1;
    }

    int new_node() {
        tree.push_back({});
        return (int)tree.size() - 1;
    }

    bool better(int first, int second, int position) const {
        if (!first)
            return false;
        if (!second)
            return true;
        i128 first_value = line[first].value(x[position]);
        i128 second_value = line[second].value(x[position]);
        if (first_value != second_value)
            return first_value > second_value;
        return first < second;
    }

    int insert_line(int p, int left, int right, int id) {
        if (!p)
            p = new_node();
        if (!tree[p].id) {
            tree[p].id = id;
            return p;
        }

        int middle = (left + right) >> 1;
        if (better(id, tree[p].id, middle))
            swap(id, tree[p].id);
        if (left == right)
            return p;

        if (better(id, tree[p].id, left))
            tree[p].left = insert_line(tree[p].left, left, middle, id);
        else if (better(id, tree[p].id, right))
            tree[p].right = insert_line(tree[p].right, middle + 1, right, id);
        return p;
    }

    void insert_line(int id) {
        root = insert_line(root, 0, (int)x.size() - 1, id);
    }

    int insert_segment(int p, int left, int right,
                       int query_left, int query_right, int id) {
        if (query_right < left || right < query_left)
            return p;
        if (!p)
            p = new_node();
        if (query_left <= left && right <= query_right)
            return insert_line(p, left, right, id);

        int middle = (left + right) >> 1;
        tree[p].left = insert_segment(tree[p].left, left, middle,
                                      query_left, query_right, id);
        tree[p].right = insert_segment(tree[p].right, middle + 1, right,
                                       query_left, query_right, id);
        return p;
    }

    void insert_segment(int left, int right, int id) {
        root = insert_segment(root, 0, (int)x.size() - 1, left, right, id);
    }

    int query(int p, int left, int right, int position) const {
        if (!p)
            return 0;
        int answer = tree[p].id;
        if (left == right)
            return answer;

        int middle = (left + right) >> 1;
        int child_answer;
        if (position <= middle)
            child_answer = query(tree[p].left, left, middle, position);
        else
            child_answer = query(tree[p].right, middle + 1, right, position);
        if (better(child_answer, answer, position))
            answer = child_answer;
        return answer;
    }

    // 返回 0 表示该横坐标没有任何已插入线段。
    int query(int position) const {
        return query(root, 0, (int)x.size() - 1, position);
    }
};
```
:::

​整条直线插入调用 `insert_line(id)`，为 $O(\log C)$；限定区间的线段会被分解到 $O(\log C)$ 个规范节点，插入为 $O(\log^2 C)$。实现使用 `__int128` 比较整数斜率、截距和横坐标，避免 `long long` 乘法先溢出。若数据是浮点数，则相等判断、近交点误差和无穷值协议必须按题目精度要求重新设计，不能直接套用整数比较。

## 可持久化线段树

### 动态开点线段树：

​因为是可持久化线段树的前置知识（严格需要），略提一下。

​一般线段树建树时，将所有区间都在节点上表示了出来。但是事实上，对于一个节点 $p$ 的区间 $[l,r]$，如果整个操作流程中都未涉及，那么这个节点及其所在的子树是否存在，是不会影响结果的正确性的。动态开点线段树应运而生。

​即：只有在访问到某个区间时，才创建对应的节点编号。如果只是将朴素线段树，以单点加、区间和为例替换成动态开点线段树，只需在函数体中，把节点编号改为引用，并把节点的左右儿子显式地存储在节点的结构体中，而不是沿用堆式建树的隐式儿子表示。当当前递归区间的节点不存在时，将其赋予新的编号即可。询问时若遇到空节点则表示没有内容，返回空即可。

:::details 点击展开代码
```cpp
void update(int &p, int l, int r, int x, int v) {
    int mid = l + r >> 1;
    if (!p)
        p = ++idx;
    if (l == r) {
        tr[p].sum += v;
        return;
    }
    if (x <= mid)
        update(ls(p), l, mid, x, v);
    else
        update(rs(p), mid + 1, r, x, v);
    push_up(p);
}
int query(int p, int l, int r, int x, int y) {
    int mid = l + r >> 1, res = 0;
    if (!p)
        return 0;
    if (x <= l && r <= y) {
        return tr[p].sum;
    }
    if (x <= mid)
        res += query(ls(p), l, mid, x, y);
    if (y > mid)
        res += query(rs(p), mid + 1, r, x, y);
    return res;
}
```
:::

​因为动态开点只涉及到需要的节点，所以可以支持维护序列长度很大的情况，每一次操作最多涉及线段树上 $O(\log n)$ 个节点。

​因为动态开点每次最劣会创建访问到的区间数量的节点数，所以动态开点的空间复杂度是 $O(m\log n)$ 的。不过如果是一般线段树中使用动态开点替换，那么不会每一次的节点都是未涉及过的，所以空间复杂度还会是和堆式建树一致为 $O(n)$。

### 标记永久化：

​因为是可持久化线段树的前置知识（不严格需要），略提一下。

​一个区间在线段树上的规范分解只包含 $O(\log n)$ 个完整覆盖节点；可能与它相交的全部后代确实可达 $O(n)$，但标准修改不会继续遍历已经完整覆盖的节点。标记永久化把修改保留在这 $O(\log n)$ 个规范节点上，查询向下时累计祖先标记，而不是把标记下传到所有后代。

​标记永久化的实现选择不下传，而是在访问路径上累计祖先标记。与懒标记相比，对于不能直接累计的标记，通常更难处理。

---


​可持久化数据结构意味可以维护历史版本，即第 $i$ 次操作的结果是建立在第 $i-1$ 次操作结果的基础上的。

​因为线段树是自上而下的数据结构，对于一个确定的子树，其维护的信息是确定的。所以若节点 $p$ 和节点 $q$ 的儿子维护信息相同，那么可以将它们的儿子节点设为同一个。所以，对于可持久化线段树，对于第 $i$ 次操作中，未被修改，也就是和第 $i-1$ 次操作信息一致的区间，用同一个节点表示即可。对于被修改的节点，可以创建一个旧版本的拷贝，再在这个新的节点上进行修改即可。

### 主席树：

可持久化权值（值域）线段树一般被称作主席树。下面维护前缀出现次数：`root[i]` 表示前 $i$ 个元素的频率版本，`kth_in_subarray(left, right, k)` 返回子数组 $[left,right]$ 的第 $k$ 小离散值。它不是“查询某个位置的点值”。

:::details 点击展开代码
```cpp
struct node {
    int left = 0, right = 0, sum = 0;
} tr[N << 5];

int idx, root[N];
int version_count, compressed_size;

int clone_node(int previous) {
    int current = ++idx;
    tr[current] = tr[previous]; // 叶子和内部节点的旧信息全部复制
    return current;
}

int update(int previous, int left, int right, int position) {
    int current = clone_node(previous);
    tr[current].sum++;
    if (left == right)
        return current;

    int middle = (left + right) >> 1;
    if (position <= middle)
        tr[current].left = update(tr[previous].left, left, middle, position);
    else
        tr[current].right = update(tr[previous].right, middle + 1, right, position);
    return current;
}

// rank[i] 是第 i 个元素在 [1, value_count] 中的离散排名。
void build_prefix_versions(int n, int value_count, const vector<int> &rank) {
    idx = 0;
    version_count = n;
    compressed_size = value_count;
    tr[0] = {};
    root[0] = 0;
    for (int i = 1; i <= n; i++)
        root[i] = update(root[i - 1], 1, value_count, rank[i]);
}

int kth(int left_root, int right_root,
        int left, int right, int k) {
    if (left == right)
        return left;

    int middle = (left + right) >> 1;
    int left_count = tr[tr[right_root].left].sum
                   - tr[tr[left_root].left].sum;
    if (k <= left_count)
        return kth(tr[left_root].left, tr[right_root].left,
                   left, middle, k);
    return kth(tr[left_root].right, tr[right_root].right,
               middle + 1, right, k - left_count);
}

// 返回 -1 表示参数越界；否则返回离散后的值域下标。
int kth_in_subarray(int left, int right, int k) {
    if (left < 1 || right > version_count || left > right || k <= 0)
        return -1;
    int count = tr[root[right]].sum - tr[root[left - 1]].sum;
    if (k > count)
        return -1;
    return kth(root[left - 1], root[right], 1, compressed_size, k);
}
```
:::

​每个新版本只复制根到一个叶子的 $O(\log V)$ 个节点，其中 $V$ 是离散值域大小；构建 $n$ 个前缀版本的时间和空间均为 $O(n\log V)$，单次区间第 $k$ 小查询为 $O(\log V)$。

### 区间修改：

​若第 $i$ 次操作是在第 $i-1$ 次操作的基础上，进行区间修改，以区间加为例，那么在后续访问第 $i$ 次操作的版本时，若使用懒标记，且直接将节点上的懒标记 `push_down`，常数略大，容易爆空间。 使用标记永久化，会有更好的效果。

### Trick：

​若第 $i$ 个版本，不止进行一次操作。一个简单的解决办法就是，直接迭代操作次数个版本，然后记录下第 $i$ 个版本对应的最后一个版本是哪个。另一个解决办法先让 $root[i]=root[i-1]$，然后创建一个临时根，用这个临时根迭代 $root[i]$ 操作次数次即可（每一次迭代都用临时根替换 $root[i]$）。

## 吉司机线段树

​历史最值线段树，经典的“势能线段树”，暂略。

## 线段树合并

​线段树合并就是将两棵线段树上表示相同区间的信息合并起来，所以时间复杂度显然与节点数相关，所以线段树合并通常针对动态开点线段树，只合并需要用到的点。

​实现不难理解，对于合并 $tree_1,tree_2$，若当前 $tree_1,tree_2$ 其中一个左儿子不存在，另一个左儿子存在，那么直接将存在的那一个左儿子作为合并后的左儿子即可；若 $tree_1,tree_2$ 左儿子都存在，那么递归合并；若 $tree_1,tree_2$ 左儿子都不存在，不进行合并，结束递归。右儿子同理。容易发现，最终合并的节点都是叶子节点，然后通过 `push_up` 更新祖先节点即可。

​以区间和为例：

:::details 点击展开代码
```cpp
int merge(int p, int q, int l, int r) {
    int mid = l + r >> 1;
    if (!p)
        return q;
    if (!q)
        return p;
    if (l == r) {
        tr[p].sum += tr[q].sum;
        return p;
    }
    ls(p) = merge(ls(p), ls(q), l, mid);
    rs(p) = merge(rs(p), rs(q), mid + 1, r);
    push_up(p);
    return p;
}
```
:::

​上述代码是破坏式合并：调用后必须丢弃根 $q$，不能再从其他版本或容器访问它。只有在这种前提下，并且每个被吞并的节点至多参与一次重叠递归时，才能把一系列合并的总复杂度按初始节点数 $S$ 摊还为 $O(S)$；若初始每棵权值线段树合计创建了 $O(n\log V)$ 个节点，就得到 $O(n\log V)$。若需要保留两棵输入树、支持持久化，或让同一棵树反复参与合并，上述一次性收费不成立，复杂度必须按每次实际访问的节点重新计算。

​线段树合并从应用角度而言，通常用于合并权值线段树，并且更多地应用在树上，用于合并子树信息。

## 线段树分裂

​线段树分裂是线段树合并的逆过程。若节点只保存一个不可逆聚合值，例如只保存两个集合合并后的最大值，就不能仅凭这个聚合值反推出两部分；通常需要保留子树、叶子信息或修改历史。这不等于“最大值操作不能撤销”：若记录修改前的值或维护修改栈，最大值同样可以回滚。

​以权值线段树统计数字出现次数为例：保留前 $k$ 小的数字，将其余数字分裂到一棵新的线段树上。 

:::details 点击展开代码
```cpp
void split(int p, int &q, int k) {
    if (!p)
        return;
    if (!q)
        q = ++idx;
    if (k > tr[ls(p)].sum)
        split(rs(p), rs(q), k - tr[ls(p)].sum);
    else
        swap(rs(p), rs(q));
    if (k < tr[ls(p)].sum)
        split(ls(p), ls(q), k);
    tr[q].sum = tr[p].sum - k;
    tr[p].sum = k;
}
```
:::

​线段树分裂的时间复杂度容易发现是单次 $O(\log n)$ 的，因为只会向一侧递归。

## 线段树优化建图

​线段树优化建图用于将一个点和一个区间内的所有点连边的问题，例如将 $u$ 和 $i\in [l,r]$ 的所有 $i$ 连边，或将 $i\in [l,r]$ 的所有 $i$ 和 $u$ 连边，后求最短路。 若直接建边，边数是 $O(n^2)$ 的。

​根据任意一个区间 $[l,r]$ 在线段树上一定可以拆分成 $O(\log n)$ 个区间的性质。那么若用一个点代替一个区间，那么对于任意一个区间 $[l,r]$，都可以拆分成 $O(\log n)$ 个节点。

​若 $u$ 连向了 $[l,r]$，而最后需要求的还是单点的最短路。因为 $[l,r]$ 表示 $i\in [l,r]$ 的所有 $i$，所以 $[l,r]$ 代表的节点要连向 $i\in [l,r]$ 的所有 $i$，但是仍然不能直接连，所以所有节点在线段树上向儿子节点连权值为 $0$ 的边。

​若 $[l,r]$ 连向了 $u$，那么相当于 $i\in[l,r]$ 的所有 $i$ 连向了 $u$，和上文同理，线段树上所有点要向父节点连权值为 $0$ 的边。

​但是容易发现，这不能在同一棵线段树上进行。所以建两棵线段树，一棵向儿子节点连边，一棵向父亲节点连边。两棵树表示同一个原点的叶子必须双向连接权值为 $0$ 的边，使 `id1[i]` 与 `id2[i]` 成为原点 $i$ 的两个等价入口。示例中的普通边 $u\to v$ 同时补齐四种叶子入口组合，不能把其中一条重复写成 `id2[u] -> id2[v]`。

​以最短路为例：$u\xrightarrow{w} [l,r],\ u\xrightarrow{w}v,\ [l,r]\xrightarrow{w} u$，求 $s$ 为起点的最短路。


:::details 点击展开代码
```cpp
struct segment {
    int idx;
    int id1[N], id2[N];
    void build1(int t, int l, int r) {
        idx = max(idx, t);
        int mid = l + r >> 1;
        if (l == r) {
            id1[l] = t;
            return;
        }
        add(t, t << 1, 0);
        add(t, t << 1 | 1, 0);
        build1(t << 1, l, mid);
        build1(t << 1 | 1, mid + 1, r);
    }
    void build2(int t, int l, int r) {
        int mid = l + r >> 1;
        if (l == r) {
            id2[l] = t + idx;
            return;
        }
        add((t << 1) + idx, t + idx, 0);
        add((t << 1 | 1) + idx, t + idx, 0);
        build2(t << 1, l, mid);
        build2(t << 1 | 1, mid + 1, r);
    }
    void link1(int t, int l, int r, int x, int y, int u, int w) {
        int mid = l + r >> 1;
        if (x <= l && r <= y) {
            add(id2[u], t, w);
            return;
        }
        if (x <= mid)
            link1(t << 1, l, mid, x, y, u, w);
        if (y > mid)
            link1(t << 1 | 1, mid + 1, r, x, y, u, w);
    }
    void link2(int t, int l, int r, int x, int y, int u, int w) {
        int mid = l + r >> 1;
        if (x <= l && r <= y) {
            add(t + idx, id1[u], w);
            return;
        }
        if (x <= mid)
            link2(t << 1, l, mid, x, y, u, w);
        if (y > mid)
            link2(t << 1 | 1, mid + 1, r, x, y, u, w);
    }
} tree;
signed main() {
    int n, q, s;
    cin >> n >> q >> s;
    tree.build1(1, 1, n);
    tree.build2(1, 1, n);
    int i;
    For(i, 1, n) add(tree.id1[i], tree.id2[i], 0),
        add(tree.id2[i], tree.id1[i], 0);
    while (q--) {
        int op;
        cin >> op;
        if (op == 1) {
            int u, v, w;
            cin >> u >> v >> w;
            add(tree.id1[u], tree.id1[v], w);
            add(tree.id2[u], tree.id2[v], w);
            add(tree.id1[u], tree.id2[v], w);
            add(tree.id2[u], tree.id1[v], w);
        }
        if (op == 2) {
            int u, l, r, w;
            cin >> u >> l >> r >> w;
            tree.link1(1, 1, n, l, r, u, w);
        }
        if (op == 3) {
            int u, l, r, w;
            cin >> u >> l >> r >> w;
            tree.link2(1, 1, n, l, r, u, w);
        }
    }
    return 0;
}
```
:::

​线段树优化建图本质上只是一个建图的工具，结合到具体题目，还是需要一定的图论知识。

## 线段树分治

​线段树分治一定程度上类似线段树优化建图，本质还是利用线段树的性质：一个区间 $[l,r]$ 可以在线段树上被完整地拆分成 $O(\log n)$ 个节点。线段树分治往往应用于操作按时间点出现消失，即某一个操作只会在某一段连续时间内存在。

​对于这一段时间，可以拆分成 $O(\log n)$ 段线段树上的连续区间。对于整个操作时间轴，视作线段树的根节点。递归左子树表示处理 $[l,mid]$ 时间内的所有操作。

​把一段时间 $[l,r]$ 的操作放在 $O(\log n)$ 个节点上，当递归进入这个节点时执行操作，退出时回滚到进入前的状态。要求的是状态能够高效恢复；最大值也可以通过记录旧值或修改栈撤销。递归到叶子节点时，当前时刻有效的全部操作均已执行，此时必须实际回答该时刻的询问。

​一个线段树分治的一个经典应用是和可撤销并查集的结合使用，用来维护点的连通性。

:::details 点击展开代码
```cpp
struct sege {
    int n;
    vector<int> tr[N << 2];
    function<void(int)> answer_query;
    void update(int t, int l, int r, int x, int y, int id) {
        int mid = l + r >> 1;
        if (x <= l && r <= y) {
            tr[t].pb(id);
            return;
        }
        if (x <= mid)
            update(t << 1, l, mid, x, y, id);
        if (y > mid)
            update(t << 1 | 1, mid + 1, r, x, y, id);
    }
    void solve(int t, int l, int r) {
        int his = dsu.History();
        for (auto u : tr[t]) {
            dsu.merge(edge[u].x, edge[u].y);
        }
        if (l == r) {
            answer_query(l); // 根据题意回答第 l 个时刻的询问
        } else {
            int mid = l + r >> 1;
            solve(t << 1, l, mid);
            solve(t << 1 | 1, mid + 1, r);
        }
        while (dsu.History() != his)
            dsu.roll(); // 可撤销并查集部分
    }
} tree;
```
:::

## 线段树上二分

对于一个单调的区间询问，例如正权区间内第一个前缀和大于 $x$ 的位置。如果是一个 $[1,n]$ 上的全局询问，不难得到直接在线段树左右递归即可，时间复杂度 $O(\log n)$。一个经典应用是可持久化权值线段树（主席树）上求 k-th。

如果询问不是全局的，同样地，将询问区间拆分成线段树上的 $O(\log n)$ 个区间，答案一定落在某一个区间内。一个很 naive 的做法是，直接把这 $O(\log n)$ 个节点离线下来，然后扫一遍找到答案所在区间，然后对该节点进行一个和全局询问类似的子树递归即可。

时间复杂度：$O(\log n)$。
