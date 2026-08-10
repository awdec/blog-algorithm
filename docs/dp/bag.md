<center><h1>背包 dp</h1></center>

其实感觉背包只是一种特别的、人为总结的 dp 问题，在 dp 水平足够之后，不需要专门地学习，也能得到其绝大多数的做法。

背包 dp 更多担任的是引导入门 dp 的角色，可以通过一系列的背包 dp 帮助新手了解 dp 思想，熟悉 dp。

以下最大价值类模板默认所有物品体积为正整数，并令 $dp_j$ 表示“总体积不超过 $j$ 时的最大价值”，因此可以把整个 `dp` 数组初始化为 $0$。若题目要求“总体积恰好为 $j$”，则必须令 `dp[0] = 0`、其余状态初始化为 `-INF`，并只从可达状态转移；后文的可行性背包和方案数背包则默认讨论恰好达到对应体积。

## 01 背包

:::details 点击展开代码
```cpp
for (int i = 1; i <= n; i++)
    for (int j = V; j >= v[i]; j--)
        dp[j] = max(dp[j], dp[j - v[i]] + w[i]);
```
:::

时间复杂度：$O(nV)$。

空间复杂度：$O(V)$。

## 完全背包

:::details 点击展开代码
```cpp
for (int i = 1; i <= n; i++)
    for (int j = v[i]; j <= V; j++)
        dp[j] = max(dp[j], dp[j - v[i]] + w[i]);
```
:::

时间复杂度：$O(nV)$。

空间复杂度：$O(V)$。

## 多重背包

:::details 点击展开代码
```cpp
for (int i = 1; i <= n; i++)
    for (int j = V; j >= v[i]; j--)
        for (int k = 1; k <= min(s[i], j / v[i]); k++)
            dp[j] = max(dp[j], dp[j - k * v[i]] + k * w[i]);
```
:::

时间复杂度：$O(\sum_i V\min(s_i,V/v_i))$，粗略上界为 $O(nV^2)$。

空间复杂度：$O(V)$。

### 二进制优化

:::details 点击展开代码
```cpp
for (int i = 1; i <= n; i++) {
    int cnt = min(s[i], V / v[i]);
    int num = 1;
    while (cnt) {
        int take = min(num, cnt);
        cnt -= take;
        for (int k = V; k >= take * v[i]; k--)
            dp[k] = max(dp[k], dp[k - take * v[i]] + take * w[i]);
        if (num <= cnt)
            num <<= 1;
    }
}
```
:::

时间复杂度：$O(V\sum_i\log(\min(s_i,V/v_i)+1))$。

空间复杂度：$O(V)$。

### 单调队列优化

:::details 点击展开代码
```cpp
for (int i = 1; i <= n; i++) {
    int now = (i & 1);
    int cur = (now ^ 1);
    int cnt = min(s[i], V / v[i]);
    dp[now] = dp[cur];
    for (int j = 0; j < v[i]; j++) {
        q.clear();
        for (int k = j; k <= V; k += v[i]) {
            int T = k / v[i];
            while (q.size() && q.front().first < k - cnt * v[i])
                q.pop_front();
            if (q.size())
                dp[now][k] = max(dp[now][k], q.front().second + T * w[i]);
            while (q.size() && q.back().second < dp[cur][k] - T * w[i])
                q.pop_back();
            q.push_back({k, dp[cur][k] - T * w[i]});
        }
    }
}
```
:::

时间复杂度：$O(nV)$。

空间复杂度：$O(V)$。

注：
- 实现上的一些细节，对于每个余数单独跑一遍，只需要开一个单调队列，常数更小。
- 因为常数问题，实现不好的单调队列优化很可能跑不过二进制优化。

## 分组背包

:::details 点击展开代码
```cpp
for (int i = 1; i <= n; i++)
    for (int j = V; j >= 0; j--)
        for (int k = 1; k <= m[i]; k++)
            if (j >= v[i][k])
                dp[j] = max(dp[j], dp[j - v[i][k]] + w[i][k]);
```
:::
时间复杂度：$O(V\sum_i m_i)$。

空间复杂度：$O(V)$。

## 多维背包

:::details 点击展开代码
```cpp
for (int i = 1; i <= n; i++)
    for (int j = V1; j >= v1[i]; j--)
        for (int k = V2; k >= v2[i]; k--)
            dp[j][k] = max(dp[j][k], dp[j - v1[i]][k - v2[i]] + w[i]);
```
:::

时间复杂度：$O(n\prod V_i)$。

空间复杂度：$O(\prod V_i)$。

## 混合背包

这个没有固定形式，原则上可以把上述所有背包问题全部杂合在一起，每种物品都可以是上面任意一种类型。

## 可行性背包

:::details 点击展开代码
```cpp
dp[0] = 1;
for (int i = 1; i <= n; i++)
    for (int j = V; j >= v[i]; j--)
        dp[j] |= dp[j - v[i]];
```
:::

时间复杂度：$O(nV)$。

空间复杂度：$O(V)$。

### `bitset` 优化

:::details 点击展开代码
```cpp
dp[0] = 1;
for (int i = 1; i <= n; i++)
    dp |= (dp << v[i]);
```
:::

时间复杂度：$O(\dfrac{nV}{w})$。

空间复杂度：$O(\dfrac{V}{w})$。

## 限和背包的二进制优化

可以发现，本质上，01 背包和完全背包都是多重背包。

对于 01 背包，可以把体积、价值相同的物品合并，视作多重背包，从而应用二进制优化。

> 结论：对于一个体积为 $V$ 的可行性背包，若所有物品的体积之和不超过 $W$，则使用二进制优化的时间复杂度为 $O(V\sqrt W)$，使用 `bitset` 还可以进一步优化到 $O(\frac{V\sqrt{W}}{w})$。

证明：根号分治，对于价值 $>\sqrt W$ 的物品，不超过 $\sqrt W$ 个，那么这一部分直接跑 01 背包是 $O(V\sqrt W)$ 的。

对于价值 $\le \sqrt W$ 的物品，可得：$\sum\limits_{i=1}^{\sqrt{W}} i\times a_i\le W,a_i\ge 0$，求 $\sum\log a_i$。

应用拉格朗日乘子法：

令 $F=\sum\limits_{i=1}^{\sqrt{W}}\log a_i-\lambda(\sum\limits_{i=1}^{\sqrt{W}} i\times a_i-W)$，$\dfrac{\partial F}{\partial a_i}=\dfrac{1}{a_i}-\lambda i=0 \Rightarrow a_i=\dfrac{1}{\lambda i}$。

代入反解 $a_i=\dfrac{\sqrt{W}}{i}$。   

此时，$\sum\limits_{i=1}^{\sqrt{W}}\log a_i=\sqrt{W}\log\sqrt{W}-\log(\sqrt{W}!)$。

根据斯特林近似：$\log(n!)=n\log n-n+\frac{1}{2}\log(2\pi n)+o(1)$。

代回，可得 $\sum\limits_{i=1}^{\sqrt{W}}\log a_i\sim \sqrt{W}$

综上：对于价值 $\le \sqrt W$ 的物品，这一部分时间复杂度仍为 $O(V\sqrt W)$。

<!-- > 推论：对于一个体积为 $V$ 的背包，若所有物品的价值之和不超过 $W$，则使用二进制优化的时间复杂度为 $O(V\sqrt W)$。/ -->


## 背包求方案数

以 01 背包为例：

:::details 点击展开代码
```cpp
dp[0] = 1;
for (int i = 1; i <= n; i++)
    for (int j = V; j >= v[i]; j--)
        dp[j] += dp[j - v[i]];
```
:::

时间复杂度：$O(nV)$。

空间复杂度：$O(V)$。

### 卷积优化

每一个物品可以视作一个形式幂级数，$n$ 个物品求方案数等价于 $n$ 个形式幂级数卷积。

若物品的体积为 $v$，物品的数量为 $s$，则 $F(x)=\sum\limits_{i\ge 0}^{s} x^{iv}=\dfrac{1-x^{(s+1)v}}{1-x^v}$。

$$G(x)=\prod\limits_{i=1}^n\dfrac{1-x^{(s_i+1)v_i}}{1-x^{v_i}}=$$

$$\text{exp}(\sum \ln F(x))$$

$\ln F(x)=\ln(1-x^{(s + 1)v_i})-\ln(1-x^{v})$，按泰勒展开，可得 $\sum\limits_{n=1}^{∞}\dfrac{(x^v)^n}{n}-\sum\limits_{n=1}^{∞}\dfrac{(x^{(s+1)v})^n}{n}$。

按 $s,v$ 算 $x^i$ 的系数贡献即可。

时间复杂度：$O(V\log V)$。

空间复杂度：$O(V)$。

### 可撤销性

#### 多项式角度

删除一个物品，相当于少乘一个形式幂级数，做一次多项式除法即可。

若是 01 背包，使用长除法，撤销单个物品就是 $O(V)$ 的。这里各物品对应多项式的常数项均为 $1$，所以递推不需要额外求常数项逆元；更一般的除式则要求常数项可逆。若多重背包采用二进制拆分，可以逐个撤销拆出的 01 物品，但这样需要 $O(V\log(s_i+1))$。

#### dp 角度

删除一个物品，把这个物品的贡献减掉即可。

注意枚举顺序的影响：若是 01 背包，$dp_j-dp_{j-v_i}$ 需要保证 $dp_{j-v_i}$ 已经把这个物品的贡献减掉了，所以要顺序枚举；完全背包则反之，因为可以无限制取，所以需要保证 $dp_{j-v_i}$ 还没有把这个物品的贡献减掉，所以要逆序枚举。

01 背包：

:::details 点击展开代码
```cpp
for (int j = v[i]; j <= V; j++)
    dp[j] -= dp[j - v[i]];
```
:::
完全背包：

:::details 点击展开代码
```cpp
for (int j = V; j >= v[i]; j--)
    dp[j] -= dp[j - v[i]];
```
:::

多重背包的每个二进制拆分组都可以和 01 背包一样处理。

若要在 $O(V)$ 内撤销整个数量上限为 $s_i$ 的物品类型，可以按体积同余类维护滑动区间和。设加入该类型前后的方案数分别为 $Q_t,P_t$，在同一余数类内有

$$
P_t=\sum_{r=0}^{s_i}Q_{t-r}.
$$

因此按 $t$ 从小到大，可以用已经恢复的 $Q$ 递推当前 $Q_t$：

:::details 点击展开代码
```cpp
if (s[i]) {
    for (int j = 0; j < v[i]; j++) {
        int sum = dp[j];
        for (int k = j + v[i]; k <= V; k += v[i]) {
            dp[k] -= sum;
            if (k / v[i] >= s[i])
                sum -= dp[k - s[i] * v[i]];
            sum += dp[k];
        }
    }
}
```
:::

代码执行到当前体积前，`sum` 始终是递推所需的最近 $s_i$ 个 $Q$ 之和；$s_i=0$ 时没有贡献，直接跳过。以上写法针对精确整数方案数；若方案数对模数取模，每次减法后还需要规范化到模意义下。

01 背包、完全背包以及上述直接滑动窗口写法，撤销一次加入操作的时间复杂度均为 $O(V)$。

## 前后缀背包

令 `pre[i][j]` 表示只使用前 $i$ 个物品、容量为 $j$ 的背包结果，`suf[i][j]` 表示只使用第 $i$ 至第 $n$ 个物品的结果。

作用是，将前缀 $i-1$ 的背包将后缀 $i+1$ 的背包拼起来，就可以得到去掉第 $i$ 个物品的结果，前文中可撤销性基于求方案数，做前后缀背包可以支持更一般的情况。

预处理时间复杂度：$O(nV)$。

:::details 点击展开代码
```cpp
vector<int> ans(V + 1, -INF);
for (int j = 0; j <= V; j++)
    for (int k = 0; k <= j; k++)
        if (pre[i - 1][j - k] != -INF && suf[i + 1][k] != -INF)
            ans[j] = max(ans[j], pre[i - 1][j - k] + suf[i + 1][k]);
dp = ans;
```
:::

拼接时必须始终从固定的前缀表和后缀表读取，不能一边写 `dp` 一边再把它作为前缀状态读取，否则会重复使用后缀物品。求出完整结果数组的单次拼接是 max-plus 卷积，时间复杂度为 $O(V^2)$；若只询问容量 $V$ 的答案，则只需枚举一次分界，时间复杂度为 $O(V)$。

## 树上背包

下面的模板令 `dp[x][j]` 表示在 $x$ 的子树中**恰好选择 $j$ 个点**的最大价值，每个点在这一维上占用一个单位。不可达状态必须初始化为 `-INF`。

:::details 点击展开代码
```cpp
sz[x] = 1;
fill(dp[x], dp[x] + V + 1, -INF);
dp[x][1] = w[x];
for (auto u : p[x]) {
    dfs(u);
    for (int i = min(sz[x], V); i >= 1; i--) {
        for (int j = min(sz[u], V - i); j >= 1; j--) {
            if (dp[x][i] != -INF && dp[u][j] != -INF)
                dp[x][i + j] = max(dp[x][i + j], dp[x][i] + dp[u][j]);
        }
    }
    sz[x] += sz[u];
}
```
:::

对于上述“单位体积、按选点数计”的模板，利用子树大小限制枚举上下界后，总时间复杂度可以分析为 $O(nV)$。若每个点具有一般体积，直接对每条父子关系做容量上的朴素 max-plus 合并，通常只能保证 $O(nV^2)$；没有额外结构或优化时，不能无条件沿用 $O(nV)$ 的结论。

空间复杂度：$O(nV)$。

通过链剖分结合 NTT 的科技，可以做到 $O(n\log^3n)$ 甚至 $O(n\log^2n)$，但是看起来太 useless 了。

### 有依赖的背包

有依赖的背包是一种特殊的树上背包，注意祖先节点一定要选。

## 可行性完全背包的最少物品数

对于一个可行性完全背包，求最少拿几个物品可以恰好得到体积 $V$。直接把状态改为最少物品数即可：

:::details 点击展开代码
```cpp
fill(dp, dp + V + 1, INF);
dp[0] = 0;
for (int i = 1; i <= n; i++)
    for (int j = v[i]; j <= V; j++)
        if (dp[j - v[i]] != INF)
            dp[j] = min(dp[j], dp[j - v[i]] + 1);
```
:::

时间复杂度为 $O(nV)$，空间复杂度为 $O(V)$；若 `dp[V] == INF`，则体积 $V$ 不可达。

### 倍增 NTT

令 $F(x)=\sum x^{v_i}$，则 $[x^V]F(x)^t\ne0$ 表示恰好使用 $t$ 个物品可以得到 $V$，它对 $t$ 并不单调。例如只有体积为 $2$ 的物品且 $V=2$ 时，$t=1$ 可达，$t=2$ 反而不可达，因此不能直接对 $F(x)^t$ 二分或倍增。

若要恢复单调性，应令

$$
H(x)=1+\sum_{v\in S}x^v,
$$

其中 $S$ 是去重后的物品体积集合，并把系数只解释为可达或不可达。此时 $[x^V]H(x)^t\ne0$ 等价于“使用不超过 $t$ 个物品可以得到 $V$”，该条件才随 $t$ 单调。每次卷积后都要截断至 $V$ 次，并把非零系数重新置为 $1$，即在布尔半环上做乘法。

预处理 $H(x)^{2^0},H(x)^{2^1},\ldots$。由于物品体积为正，若有解则最少物品数不超过 $V$；应先检查 $H(x)^V$ 是否可达，仍不可达就直接判定无解。随后从高位到低位倍增，寻找最后一个仍不可达的 $t$。整个过程只需 $O(\log V)$ 次卷积，总复杂度为 $O(M(V)\log V)=O(V\log^2V)$。

若用单模 NTT 实现布尔卷积，需要选择支持所需变换长度且满足 $mod>V+1$ 的模数。因为两个布尔多项式单次卷积的每个系数至多为 $V+1$，该条件可以避免“实际非零却恰好模 $mod$ 为零”；若不在每次卷积后布尔化，则不能无条件用单模系数是否为零判断可达性。
