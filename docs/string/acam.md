<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>ACAM</center></h1>

即 ​AC 自动机。

​ACAM 是 Kmp 和 Trie 的结合，用于解决一个在文本串匹配若干个模式串（字典）的问题。

​简单来说就是在树上维护 Border。

​Trie 上一个节点表示一个前缀，$border_i$ 对应 Trie 上一个节点，表示 $border_i$ 对应的前缀是 $i$ 对应的前缀的最长后缀（注意此处的 Border 和 Kmp 单串 Border 的区别，此处的 Border 不要求是 $i$ 对应前缀的前缀）。

​求法也和单串的 Border 类似，$border_i=border_{fa_i}$ 往后扩展 $s_i$，其中 $fa_i$ 是 $i$ 在 Trie 上的父亲。若 $border_{fa_i}$ 后不存在 $s_i$，则继续迭代更小的 Border。

​因为 $border_i$ 要求祖先 Border 已求出，所以要使用 BFS 求 Border。

​时间复杂度分析同 KMP，指针的增量为 Trie 节点数。

​时间复杂度：$O(\sum |T|)$。

​匹配时，也和 Kmp 类似，在 Trie 上迭代 $S$ Border 即可。

时间复杂度：$O(|S|)$。

区别是，对于文本串 $S$ 在 Trie 上的当前位置 $x$，其和字典 $T$ 的匹配串集合是 $x$ 到 fail 树根这条路径上的所有字符串。

注：ACAM 因为要跳 Border 的特殊性，一般将 ACAM 中 Trie 的根设为 $0$。

```cpp
struct Trie {
    /*
        其它部分的 Trie 略
    */
    void insert( int &p, string &s, int x) {
        if (!p && x) // p = 0 为根
            p = ++idx;
    }
};
struct ACAM {
    Trie trie;
    int border[N];
    void init() {
        for (int i = 0; i <= trie.idx; i++)
            border[i] = 0;
        trie.init();
    }
    void build() {
        queue<int> q;
        for (int i = 0; i < 26; i++)
            if (trie.son[0][i])
                q.push(trie.son[0][i]);
        while (q.size()) {
            auto now = q.front();
            q.pop();
            for (int i = 0; i < 26; i++) {
                if (trie.son[now][i]) {
                    int cur = border[now];
                    while (cur && !trie.son[cur][i]) {
                        cur = border[cur];
                    }
                    border[trie.son[now][i]] = trie.son[cur][i];
                    q.push(trie.son[now][i]);
                }
            }
        }
    }
    void solve(string &s){
        int now = 0;
        for (auto u : s) {
            while (now && !trie.son[now][u - 'a']) {
                now = border[now];
            }
            now = trie.son[now][u - 'a'];
            if (now)
                vis[now]++;
        }
    }
};
```

## Trie 图优化

在 AC 自动机 Trie 上维护 Border 时，需要不断跳 Border 直到匹配成功，注意到一个点的 border 是唯一的，那么一个点匹配一个字符所跳 Border 的过程也是唯一的，那么可以将这一个过程进行路径压缩，压到 $trans[x][u]$ 中去，在后续可以快速得到一个节点匹配成功的 Border，可用于优化 dp。

（其实严格意义上，只有补全了才能叫“自动机”）

​若预处理 $trans[x][u]$ 表示 Trie 上 $x$ 这个节点，接下去匹配 $u$ 这个字符时会跳到的最终节点（匹配成功）。

- 如果 $x$ 的 $u$ 后继边有节点，则 $trans[x][u]=$ 对应的后继节点。
- 否则，$trans[x][u]=trans[Border_x][u]$。

​在实际应用中，$trans$ 数组可以和 Trie 的 $son$ 共用，因为 $son$ 非空时，$trans=son$；$son$ 为空时，可用 $trans$ 填补 $son$，后续将 $son$ 视作 $trans$ 即可。（用节点上的标记数组可以处理原字典串）

​此时，找到失配后匹配成功的最大 Border 只需要一次了。

​但是因为 $trans$ 需要预处理出所有节点的所有字符的失配后成功匹配的节点，所以时空复杂度均为 $O(\sum|T||c|)$，其中 $|c|$ 表示字符集大小。


```cpp
// 补全 Trie 图
for (int i = 0; i < 26; i++) {
    auto &u = trie.son[now][i];
    if (!u) {
        u = trie.son[border[now]][i];
    } else {
        border[u] = trie.son[border[now]][i];
        q.push(u);
    }
}
// 匹配
int now = 0;
for(auto u : s){
    now = trie.son[j][u - 'a'];
}
```