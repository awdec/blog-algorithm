<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>PAM</center></h1>


又称作：​回文自动机、回文树。

​与 Manacher 不同，PAM 用最长回文后缀的方式描述一个字符串的回文子串。

​PAM 是一个树形结构，PAM 上一个一个节点描述一个回文子串。令当前节点为 $x$，其到根路径上经过的边，按从根到 $x$ 的顺序构成的字符串为 $s$，则 $x$ 描述的回文串为 $s's$，其中 $s'$ 表示 $s$ 翻转后的结果。

​当在 PAM 中加入 $s_i$ 时，以 $s_i$ 结尾的最长回文后缀一定是以 $s_{i-1}$ 结尾的回文后缀扩展一位得到的。而以 $s_{i-1}$ 结尾的回文后缀，很巧妙地，是以 $s_{i-1}$ 结尾的最长回文后缀的 Border。所以求 $s_i$ 的最长回文后缀的过程和 ACAM 上跳 Border 的过程类似。

​和 Manacher 类似的，偶数长度的回文子串需要和奇数长度的回文子串分类讨论，不区分的话，PAM 上同一个 $s$ 不能区分是奇数长度的回文子串还是偶数长度的回文子串。

​和 ACAM 类似地，跳 Border 匹配时，可以使用 Trie 图优化，时间复杂度和 ACAM 分析相同。

朴素跳 Border，时间复杂度：$O(|S|)$。

```cpp
struct PAM {
    int son[N][26], border[N], len[N];
    int num[N], cnt[N];
    int idx;
    void init() {
        for (int i = 0; i <= idx; i++)
            for (int j = 0; j < 26; j++)
                son[i][j] = 0;
        for (int i = 0; i <= idx; i++)
            border[i] = len[i] = 0;
        len[1] = -1;
        idx = 1;
        border[0] = 1;
    }

    void build(string &s) {
        int n = s.size() - 1;
        int cur = 0;
        for (int i = 1; i <= n; i++) {
            auto getborder = [&](int x) -> int {
                while (s[i - 1 - len[x]] != s[i])
                    x = border[x];
                return x;
            };
            int c = s[i] - 'a';
            cur = getborder(cur);
            if (!son[cur][c]) {
                idx++;
                len[idx] = len[cur] + 2;
                border[idx] = son[getborder(border[cur])][c];
                son[cur][c] = idx;
            }
            cur = son[cur][c];
        }
    }
};
```

补全 Trie 图，时间复杂度：$O(|S||c|)$。

```cpp
int c = s[i] - 'a';
int pos = s[(i - 1) - len[cur]] == s[i] ? cur : trans[cur][c];
if (son[pos][c])
    cur = son[pos][c];
else {
    son[pos][c] = ++idx;
    cur = idx;
    nex[cur] = pos == 1 ? 0 : son[trans[pos][c]][c];
    len[cur] = len[pos] + 2;
    num[cur] = num[border[cur]] + 1;
    for (int j = 0; j < 26; j++) {
        if (len[cur] == 1)
            trans[cur][j] = j == c ? 0 : 1;
        else
            trans[cur][j] = s[i - len[border[cur]]] - 'a' == j
                                ? border[cur]
                                : trans[border[cur]][j];
    }
}
```

## 本质不同回文子串：

​字符串的所有回文子串都能在 PAM 上找到，而 PAM 的节点数最多只有 $O(n)$ 个，所以字符串的本质不同回文子串只有 $O(n)$ 个。

​因为这个性质，所以事实上在不强制在线增量维护回文子串时，可以使用回文中心 $+$ 回文半径的方式暴力求出所有回文子串。

​具体而言，枚举回文中心，从最长回文半径开始向内收缩，若当前收缩到的位置是已经出现的，则结束收缩。在这个过程中，收缩的次数等于本质不同回文子串的数量，而判断回文子串是否出现过可以使用 Hash 判断，对于 Hash 映射后的整数 ，若使用 map 维护，整个过程的时间复杂度是 $O(n\log n)$，若使用哈希表维护，整个过程的时间复杂度是 $O(n)$。但是常数不小。

​在题目不严格卡 $O(n\log n)$ 做法，不强制在线增量，且题目只和本质不同的回文子串相关，而和回文子串的 endpos 无关时，可以平替（不过实际上貌似并不会更好写，只是不用学 PAM 也可以做）。

## Palindrome Series：

​用于优化枚举回文后缀转移的 dp。朴素枚举的时间复杂度是 $O(n^2)$ 的，因为以 $s_i$ 结尾的所有回文后缀是以 $s_i$ 结尾的所有 Border，所以可以利用 Border 的性质优化到 $O(n\log n)$。

​通常而言，此题 dp 问题的 dp 式子形如：$dp(i)\leftarrow dp(j),s[j+1,i]$ 是回文串。

​具体而言：

​对于 $s[1,i]$ 的回文后缀，令 $dif(x)$ 表示 PAM 上 $x$ 节点和 $x$ 的最长回文后缀的长度之差（也就是和 fail 树上父节点的 len 之差）。对于 $s[1,i]$ 的连续回文后缀，将连续的一段相同的 $dif(x)$ 的节点（也就是 fail 树上到根的 fail 链上 $dif$ 连续相等的一段）看成一个整体一起计算，令 $x$ 到根的第一段连续 $dif$ 相等的 $dp$ 值之和为 $g(x)$。假设这个已经被处理好了，可以证明所有节点到根的 $g$ 的数量之和是 $O(n\log n)$ 级别的。

​关于 $g$ 的计算：

<center><img src="/PAM1.png" alt="" width="120%"></center>

​令 $slink(x)$ 表示 $x$ 到根路径上下一个 $g$ 的开始节点。如上图，绿色所对应状态是 $g(x)$ 所需要的状态。

<center><img src="/PAM2.png" alt="" width="120%"></center>

​因为回文后缀的特殊性质，对于一个回文串的最大回文后缀同时也是这个回文的 Border，所以 $i-dif(x)$ 所对应的节点到根的路径上，与 $i$ 相比只多了一个 $dp(i-len(slink(x))-dif(x))$。所以 $g(i)$ 只比 $g(i-dif(x))$ 多一个 $dp(i-len(slink(x))-dif(x))$ 即可 $O(1)$ 转移。

​注意特判 $i-dif(x)$ 是 $slink(x)$ 的情况，$slink(x)$ 算作下一个点，所以不计算到答案。

```cpp
void build(string &s) {
    int cur = 0, pos;
    int n = s.size() - 1;
    for (int i = 1; i <= n; i++) {
        int c = s[i] - 'a';
        pos = s[(i - 1) - len[cur]] == s[i] ? cur : trans[cur][c];
        if (son[pos][c])
            cur = son[pos][c];
        else {
            son[pos][c] = ++idx;
            cur = idx;
            border[cur] = pos == 1 ? 0 : son[trans[pos][c]][c];
            int fa = border[cur];
            len[cur] = len[pos] + 2;
            /*
                diff[cur] = len[cur] - len[fa];
                slink[cur] = diff[fa] == diff[cur] ? slink[fa] : fa;
            */
            for (int j = 0; j < 26; j++) {
                if (len[cur] == 1)
                    trans[cur][j] = j == c ? 0 : 1;
                else
                    trans[cur][j] = s[i - len[border[cur]]] - 'a' == j
                                        ? border[cur]
                                        : trans[border[cur]][j];
            }
        }
    }
}
```

​对 dp 式：$f[i]=\sum_j f[j-1],s[j,i] \text{is Palindrome}, j\equiv i\pmod 2$，的优化转移：

```cpp
f[0] = 1;
for (int i = 1, j; i <= n; i++) {
    for (j = a[i]; j > 1; j = slink[j]) {
        int dlt = len[slink[j]] + diff[j];
        g[j] = f[i - dlt];
        if (border[j] != slink[j])
            g[j] = (g[j] + g[border[j]]) % mod;
        if (i % 2 == 0)
            f[i] = (f[i] + g[j]) % mod;
    }
}
```