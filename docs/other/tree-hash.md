<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>树同构</center></h1>

用于判断有根树同构。

## 有根树同构

对于两棵有根树 $T_1(V_1,E_1,r_1)$ 和 $T_2(V_2,E_2,r_2)$，如果存在一个双射 $\varphi:V_1\rightarrow V_2$，使得 $\forall u,v\in V_1,(u,v)\in E_1\Leftrightarrow(\varphi(u),\varphi(v))\in E_2$ 且 $\varphi(r_1)=r_2$ 则称 $T_1,T_2$ 同构。

## 无根树同构

和有根树同构类似，没有 $\varphi(r_1)=r_2$ 的限制。

简单地，对于无根树如果能通过对其中一棵树的节点进行重新标号使得和另一棵树完全相同，则称这两棵无根树同构。

无根树同构可以转换成有根树同构，具体而言：
- 若两棵无根树的重心数量不同，则不同构。
- 反之，若两棵无根树以各自重心为根后同构，则同构。

所以用于解决有根树同构的算法也可以解决无根树同构。

## AHU：

> 一段合法的括号序和一棵有根树唯一对应，而且一棵树的括号序是由它的子树的括号序拼接而成的。

括号序用 `0` 表示递归该节点，`1` 表示从该节点回溯。

通过调整子树括号序的拼接顺序，得到的括号序对应的有根树和原树是同构的。

所以判断两棵有根树同构，可以通过尝试将两棵有根树的括号序调整到某一相同顺序来判断。

类似于通过把两个整数序列升序来判断序列同构。

### 朴素做法：

朴素地用 `vector` 存下每一棵子树的括号序，按从小到大升序拼接子树的括号序作为当前节点的括号序。

最坏情况下，若树是“毛毛虫”，那么拼接括号序的过程是 $O(n^2)$ 的。

```cpp
string q[N];
void dfs1(int x, int y) {
    vector<string> tmp;
    q[x] = "1";
    for (auto u : p[x]) {
        if (u == y)
            continue;
        dfs1(u, x);
        tmp.push_back(q[u]);
    }
    sort(tmp.begin(), tmp.end());
    for (auto u : tmp)
        q[x] += u;
    q[x] += "0";
}
```

### 优化：

注意到，比较括号序时，子树的括号序在回溯时是不变的，那么就可以直接进行“离散化”，也就是可以用节点在同一深度内的排名唯一标识节点（同一深度包括两棵树）

所以可以用一个整数（排名）替代子树的括号序，这样拼接的时间复杂度就是 $O(1)$ 的了。

结合排序的时间复杂度，总时间复杂度：$O(n\log n)$。

```cpp
int q[N], idx;
map<vector<int>, int> mp;
void dfs1(int x, int y) { // 以重心为根 dfs
    vector<int> tmp;
    for (auto u : p[x]) {
        if (u == y)
            continue;
        dfs1(u, x);
        tmp.push_back(q[u]);
    }
    sort(tmp.begin(), tmp.end());
    auto it = mp.find(tmp);
    if (it != mp.end()) {
        q[x] = it->second;
    } else {
        q[x] = ++idx;
        mp[tmp] = idx;
    }
}

```

注：使用基数排序，可以做到 $O(n)$。

## 树哈希：

定义哈希函数 $h(x)$，$f(x)=(c+\sum\limits_{y\subset son_x}h(f(y)))\bmod M$。

判断有根树 $T_1,T_2$ 同构时，比较 $f(r_1),f(r_2)$ 即可。

关于 $h(x)$ 可自行选取，参考 oi-wiki:

```cpp
const u64 mask = std::chrono::steady_clock::now().time_since_epoch().count();
u64 shift(u64 x) {
    x ^= mask;
    x ^= x << 13;
    x ^= x >> 7;
    x ^= x << 17;
    x ^= mask;
    return x;
}
u64 q[N];
void dfs1(int x, int y) { // 以重心为根 dfs
    q[x] = 0;
    for (auto u : p[x]) {
        if (u == y)
            continue;
        dfs1(u, x);
        q[x] += shift(q[u]);
    }
}
```

注：根据模哈相关知识，至少需要使用双哈希，或自然溢出。

时间复杂度：$O(n)$。

与 AHU 算法相比：
- AHU 具有稳定性，不可 hack。
- 树哈希更容易实现，常数更小。
- 树哈希可以通过换根 dp，$O(n)$ 求出以所有节点为根时的哈希值。