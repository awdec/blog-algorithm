<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>SAM</center></h1>

即后缀自动机。

​SAM 主要是用于识别子串。

​对于一个字符串 $S$，它对应的 SAM 是一个最小的确定有限状态自动机（DFA）。

​比如对于字符串 $S=aabbabd$，它的 SAM 的是：

<center><img src="/SAM1.png" alt="" width="85%"></center>

## Trie 图：

​简单来说，SAM 上两类边，第一类（上图的蓝边）形成的图是一个 DAG 且这个 DAG 初始只有一个入度为 $0$ 的点（也就是空串）。从 DAG 起点开始的任意一条路径都代表了原字符串的一个子串，且互不相同。

​从 $x$ 跳到 $son[x][y]$，$x$ 所表示的字符串集合是 $son[x][y]$ 的子集，但是 endpos 集合几乎无关。

空间复杂度：$O(|S||c|)$，其中 $|c|$ 表示字符集大小。

## fail 树：

有的地方也称作：slink 树、parent 树、后缀链接树。

​SAM 上每个节点代表的是一个 endpos 等价类，一个子串的 endpos 表示其在原串中的终止位置，如上图中，$endpos(ab)=\{3,6\}$。对于两个子串，若它们的 endpos 集合完全相同，则称它们在一个 endpos 等价类中。

​可以证明，SAM 上每个节点代表的一个 endpos 等价类中的所有子串满足：是 endpos 等价类中长度最长的一个串的连续后缀。如上图中，$4$ 代表的 endpos 等价类中的子串是：$\{aabb,abb,bb\}$。

​而第二类边指的就是这个节点的 endpos 集合中不能表示的最长后缀。如上图中，$4$ 有一条指向 $5$ 的二类边，而 $5$ 代表的 endpos 等价类的子串是：$\{b\}$，$5$ 有一条指向起点的二类边（这里将空串也算做最小的后缀）。因为每个点只有一个出边，且最终都会指向起点（连通），所以二类边形成的图是一棵树。

​因为 endpos 是子串的终止位置，所以 fail 树上一条链表示的是原串的某一个前缀的连续后缀。

​在构建 SAM 时，维护每个节点对应 endpos 集合中的最长子串长度。因为 $long(fail(u))=short(u)+1$，所以只需要维护最长的子串长度即可。

​SAM 是增量构造，可以对一个字符串在线地逐步加入字符构造 SAM。至于构造部分原理，和做题无关，略。

​时间复杂度：$O(n)$。

```cpp
struct SAM {
    int maxlen[N], fail[N], son[N][26];
    int idx = 1;
    void extend(string &s) {
        int cur = 1, p, np;
        for (auto u : s) {
            int c = u - 'a';
            p = cur;
            cur = ++idx;
            np = cur;
            maxlen[np] = maxlen[p] + 1;
            for (; p && !son[p][c]; p = fail[p])
                son[p][c] = np;
            if (!p)
                fail[np] = 1;
            else {
                int q = son[p][c];
                if (maxlen[q] == maxlen[p] + 1)
                    fail[np] = q;
                else {
                    int nq = ++idx;
                    maxlen[nq] = maxlen[q], fail[nq] = fail[q];
                    memcpy(son[nq], son[q], sizeof son[nq]);
                    maxlen[nq] = maxlen[p] + 1;
                    fail[q] = fail[np] = nq;
                    for (; p && son[p][c] == q; p = fail[p])
                        son[p][c] = nq;
                }
            }
        }
    }
};
```

### 性质：

​fail 树上某一个节点的 endpos 集合是其子树中所有节点的 endpos 集合的并（复制的节点信息和被复制的一样，不要算两遍）。

## 广义 SAM

​SAM 是单串建自动机，广义 SAM 是对多串（字典）建自动机。