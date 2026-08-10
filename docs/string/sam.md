<h1><center>SAM</center></h1>

即后缀自动机。

​SAM 主要用于表示一个字符串的所有子串，并支持子串存在性等询问。

​“SAM 是最小 DFA”的标准表述是：对于固定字符串 $S$，SAM 是识别 $S$ 的所有后缀的最小不完整确定有限状态自动机。根节点是初始状态，完整字符串对应的 `last` 状态及其 suffix link 祖先是接受状态；若把空后缀也计入语言，则根节点也是接受状态。不存在的转移表示拒绝，若要求完整 DFA，还需额外加入一个拒绝状态。

​从根出发沿字符转移能够读出的字符串恰好是 $S$ 的子串，因此判断一个字符串是否为子串时，只需检查对应路径是否存在。若把所有可达状态都设为接受状态，这张转移图也能识别所有子串，但此时不能直接沿用“最小 DFA”的结论。讨论 DFA 时必须明确所识别的语言和接受状态。

​比如对于字符串 $S=aabbabd$，它的 SAM 的是：

<center><img src="/SAM1.png" alt="" width="85%"></center>

## Trie 图：

​简单来说，SAM 上有两类边。第一类是字符转移边（上图的蓝边），它们形成一个 DAG，根节点表示空串。从根开始的每条路径所拼出的字符串都是 $S$ 的子串；由于转移是确定的，每个子串对应唯一的一条路径，但多个不同子串可以结束在同一个状态。

​对于子串 $t$，定义 $endpos(t)$ 为 $t$ 在 $S$ 中所有出现位置的右端点集合。两个子串的 endpos 集合完全相同时，它们属于同一个 endpos 等价类；SAM 的每个状态恰好对应一个 endpos 等价类。

​转移 `son[x][c] = y` 表示：当前路径对应的字符串末尾追加字符 $c$ 后，自动机到达状态 $y$。它不表示状态 $x$ 的字符串集合是状态 $y$ 的子集，也不能直接推出两个状态的 endpos 包含关系；endpos 的包含关系由 suffix link 描述。

空间复杂度：$O(|S||c|)$，其中 $|c|$ 表示字符集大小。

## fail 树：

有的地方也称作：slink 树、parent 树、后缀链接树。

​第二类边是 suffix link，代码中记为 `fail`。对于根以外的状态 $v$，`fail[v]` 指向 $v$ 的最长代表串的最长真后缀中，endpos 等价类与 $v$ 不同的那个状态。因此有严格包含关系

$$
endpos(v)\subsetneq endpos(fail(v)).
$$

​如上图中，状态 $4$ 表示的等价类为 $\{aabb,abb,bb\}$，它的 suffix link 指向表示 $\{b\}$ 的状态 $5$。每个非根状态只有一条 suffix link，且最终都会到达根，因此反向连接这些边会形成 fail 树。

​令 $maxlen(v)$ 表示状态 $v$ 中最长字符串的长度，则该状态中的所有字符串是某个最长代表串的连续后缀，其长度恰好构成区间

$$
[minlen(v),maxlen(v)].
$$

​区间左端点由 suffix link 唯一确定：

$$
minlen(v)=maxlen(fail(v))+1.
$$

​因此构造时只需显式维护代码中的 `maxlen`。沿某个状态的 suffix link 向根移动，可以依次得到 endpos 集合逐渐扩大的后缀等价类；结合每个状态的长度区间，才能还原其代表的所有连续后缀。

​SAM 是增量构造，可以对一个字符串在线地逐步加入字符构造 SAM。至于构造部分原理，和做题无关，略。

​时间复杂度：$O(n)$。

:::details 点击展开代码
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
:::

### endpos 与出现次数：

​fail 树中，后代状态的 endpos 集合包含于祖先状态，但这些集合彼此可能重叠，不能把子树内各状态的 endpos 集合大小直接相加。正确的集合表述是：对于每个前缀 $S[1,i]$，把右端点 $i$ 记录在该前缀对应的状态 `last_i` 上，则 $endpos(v)$ 恰好由 fail 子树 $v$ 内所有这些右端点组成。

​统计出现次数时，可以在加入第 $i$ 个字符所创建的非 clone 状态上令 `occ[np] = 1`，clone 状态令 `occ[nq] = 0`。构造完成后按 `maxlen` 从大到小遍历状态，并执行 `occ[fail[v]] += occ[v]`，最终 `occ[v]` 就是 $|endpos(v)|$，也就是状态 $v$ 中每个字符串的出现次数。

## 广义 SAM

​SAM 通常针对单个字符串构造，广义 SAM 则表示多个字符串的子串集合。此时应把 endpos 定义为二元组“字符串编号、串内结束位置”，避免混淆不同字符串中的相同位置编号。构造时还必须阻止跨越两个字符串边界的子串进入自动机。

​常见构造方式有两种：

- **逐串构造**：处理每个新字符串前把 `last` 重置为根，再逐字符扩展。所用扩展函数必须能够正确处理自动机中已经存在的转移，不能未经说明就把只证明过单串构造的模板重复调用。
- **Trie 上构造**：先把所有字符串插入 Trie，再按 Trie 的父子转移构造 SAM。相同前缀只在 Trie 中保存一次，适合字典规模的多串构造。

​上方 `extend` 代码只说明从空 SAM 构造一个字符串的情形；若要实现广义 SAM，应根据所选方案另行给出初始化、扩展顺序和出现次数统计规则。
