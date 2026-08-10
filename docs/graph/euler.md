<h1><center>欧拉路</center></h1>

欧拉迹：经过图中每条边恰好一次的迹，起点和终点可以相同，也可以不同。

欧拉开路：起点和终点不同的欧拉迹。本文后续所说的“欧拉路径”专指欧拉开路。

欧拉回路：经过图中每条边恰好一次的回路（起点和终点相同）。

注：
- 欧拉路径和欧拉回路对不限制点的经过次数，可重复经过一个点。
- 孤立点不经过任何边，不影响欧拉路径/回路是否存在，无需从图中删除。只需在连通性判定时忽略零度点；当 $m>0$ 时，构造起点必须选择非零度点。
- 当图中没有边时，是否把单个顶点上的长度为 $0$ 的迹视为欧拉回路，应按题目约定处理。

## 判定：

- 有向图
  - 欧拉路径：图中恰好存在 $1$ 个点出度比入度多 $1$（该点为起点），恰好存在 $1$ 个点入度比出度多 $1$（该点为终点），其余点入度等于出度。
  - 欧拉回路：所有点的入度等于出度；当 $m>0$ 时，可以任选一个非零度点作为起点。
- 无向图
  - 欧拉路径：图中恰好有两个点的度数为奇数（这两个点为起点和终点，起点和终点可互换），其余点的度数为偶数。
  - 欧拉回路：所有点的度数都为偶数；当 $m>0$ 时，可以任选一个非零度点作为起点。

上述度数条件还必须配合连通性条件：无向图中所有非零度点必须位于同一个连通块；有向图中所有入度或出度非零的点，必须在忽略边方向后位于同一个连通块。孤立点可以属于其他连通块，不影响结论。

若题目把“欧拉路径”用作允许起终点相同的广义称呼，则满足对应的欧拉开路条件或欧拉回路条件之一即可。

## 求解：

### 有向图欧拉路径（开路）：

根据判定条件，找到唯一的那一个出度$=$入度$+1$ 的点作为起点，dfs 递归第一次经过某条边，递归前删除这条边。

### 有向图欧拉回路：

根据判定条件，当 $m>0$ 时任选一个非零度点作为起点，dfs 递归第一次经过某条边，递归前删除这条边。

### 无向图欧拉路径（开路）：

根据判定条件，找到度数为奇数的一个点，作为起点，dfs 递归第一次经过某条边，递归前删除这条边。

### 无向图欧拉回路：

根据判定条件，当 $m>0$ 时任选一个非零度点作为起点，dfs 递归第一次经过某条边，递归前删除这条边。

注：无向图需要注意标记把同一条边的反边也给删了。

注：上述四种情况的算法实现流程完全一致。

时间复杂度：$O(n+m)$。

Hierholzer 算法在回溯时后序写入答案，因此构造完成后必须反转。即使度数条件已经满足，也应检查是否使用了全部 $m$ 条边：有向图的顶点序列应有 $m+1$ 个点，无向图的边序列应有 $m$ 条边；否则说明仍有非零度部分与起点不连通。下方模板中的 $m$ 均指原图边数，调用前应清空 `del`，无向图还需清空 `vis`；包装函数会清空 `ans`。

有向图：

:::details 点击展开代码
```cpp
void dfs(int x) {
    for (unsigned i = del[x]; i < p[x].size(); i = del[x]) {
        del[x]++;
        dfs(p[x][i]);
    }
    ans.push_back(x);
}
bool euler(int st) {
    ans.clear();
    dfs(st);
    reverse(ans.begin(), ans.end());
    return (int)ans.size() == m + 1;
}
```
:::
无向图：

:::details 点击展开代码
```cpp
void dfs(int x) {
    for (unsigned i = del[x]; i < p[x].size(); i = del[x]) {
        del[x]++;
        auto [u, id] = p[x][i];
        if (vis[abs(id)])
            continue;
        vis[abs(id)] = 1;
        dfs(u);
        ans.push_back(id);
    }
}
bool euler(int st) {
    ans.clear();
    dfs(st);
    reverse(ans.begin(), ans.end());
    return (int)ans.size() == m;
}
```
:::

递归实现的调用深度最坏可达 $O(m)$，大图上可能导致栈溢出。下面给出等价的迭代写法。无向图假设同一条边在两个方向分别使用 `id` 和 `-id`，其中 $|id|\in[1,m]$。

有向图迭代实现：

:::details 点击展开代码
```cpp
bool euler(int st) {
    vector<int> stk;
    ans.clear();
    stk.push_back(st);
    while (!stk.empty()) {
        int x = stk.back();
        if (del[x] < p[x].size()) {
            stk.push_back(p[x][del[x]++]);
        } else {
            ans.push_back(x);
            stk.pop_back();
        }
    }
    reverse(ans.begin(), ans.end());
    return (int)ans.size() == m + 1;
}
```
:::

无向图迭代实现：

:::details 点击展开代码
```cpp
bool euler(int st) {
    vector<pair<int, int>> stk;
    ans.clear();
    stk.push_back({st, 0});
    while (!stk.empty()) {
        int x = stk.back().first;
        while (del[x] < p[x].size() && vis[abs(p[x][del[x]].second)])
            del[x]++;
        if (del[x] == p[x].size()) {
            int id = stk.back().second;
            stk.pop_back();
            if (id)
                ans.push_back(id);
        } else {
            auto [u, id] = p[x][del[x]++];
            vis[abs(id)] = 1;
            stk.push_back({u, id});
        }
    }
    reverse(ans.begin(), ans.end());
    return (int)ans.size() == m;
}
```
:::
