<style>
 body {
  font-family: "楷体"
}
</style>

<center><h1>背包 dp</h1></center>

其实感觉背包只是一种特别的、人为总结的 dp 问题，在 dp 水平足够之后，不需要专门地学习，也能得到其绝大多数的做法。

背包 dp 更多担任的是引导入门 dp 的角色，可以通过一系列的背包 dp 帮助新手了解 dp 思想，熟悉 dp。

## 01 背包

```cpp
for (int i = 1; i <= n; i++)
    for (int j = V; j >= v[i]; j--)
        dp[j] = max(dp[j], dp[j - v[i]] + w[i]);
```

时间复杂度：$O(nV)$。

空间复杂度：$O(V)$。

## 完全背包

```cpp
for (int i = 1; i <= n; i++)
    for (int j = v[i]; j <= V; j++)
        dp[j] = max(dp[j], dp[j - v[i]] + w[i]);
```

时间复杂度：$O(nV)$。

空间复杂度：$O(V)$。

## 多重背包

```cpp
for (int i = 1; i <= n; i++)
    for (int j = V; j >= v[i]; j--)
        for (int k = 1; k <= j / v[i]; k++)
            dp[j] = max(dp[j], dp[j - k * v[i]] + k * w[i]);
```

时间复杂度：$O(nV^2)$。

空间复杂度：$O(V)$。

### 二进制优化

```cpp
for (int i = 1; i <= n; i++) {
    int lim = __lg(s[i]);
    for (int j = 0; j <= lim && (1 << j) <= s[i]; j++) {
        s[i] -= (1 << j);
        int num = (1 << j);
        for (int k = V; k >= num * v[i]; k--) 
            dp[k] = max(dp[k], dp[k - num * v[i]] + num * w[i]);
    }
    for (int k = V; k >= s[i] * v[i]; k--) 
        dp[k] = max(dp[k], dp[k - s[i] * v[i]] + s[i] * w[i]);
}
```

时间复杂度：$O(nV\log s_i)$。

空间复杂度：$O(V)$。

### 单调队列优化

```cpp
for (int i = 1; i <= n; i++) {
    int now = (i & 1);
    int cur = (now ^ 1);
    dp[now] = dp[cur];
    for (int j = 0; j < v[i]; j++) {
        for (int k = j; k <= V; k += v[i]) {
            int T = k / v[i];
            while (q.size() && q.front().first < k - s[i] * v[i])
                q.pop_front();
            if (q.size())
                dp[now][k] = max(dp[now][k], q.front().second + T * w[i]);
            while (q.size() && q.back().second < dp[cur][k] - T * w[i])
                q.pop_back();
            q.push_back({k, dp[cur][k] - T * w[i]});
        }
        q.clear();
    }
}
```

时间复杂度：$O(nV)$。

空间复杂度：$O(V)$。

注：
- 实现上的一些细节，对于每个余数单独跑一遍，只需要开一个单调队列，常数更小。
- 因为常数问题，实现不好的单调队列优化很可能跑不过二进制优化。

## 分组背包

```cpp
for (int i = 1; i <= n; i++)
    for (int j = V; j >= 0; j--)
        for (int k = 1; k <= m; k++) 
            if (j >= v[k])
                dp[j] = max(dp[j], dp[j - v[i][k]] + w[i][k]);
```
时间复杂度：$O(\sum m V)$。

空间复杂度：$O(V)$。

## 多维背包

```cpp
for (int i = 1; i <= n; i++)
    for (int j = V1; j >= v1[i]; j--)
        for (int k = V2; k >= v2[i]; k--)
            dp[j][k] = max(dp[j][k], dp[j - v1[i]][k - v2[i]] + w[i]);
```

时间复杂度：$O(n\prod V_i)$。

空间复杂度：$O(\prod V_i)$。

## 混合背包

这个没有固定形式，原则上可以把上述所有背包问题全部杂合在一起，每种物品都可以是上面任意一种类型。

## 可行性背包

```cpp
dp[0] = 1;
for (int i = 1; i <= n; i++)
    for (int j = V; j >= v[i]; j--)
        dp[j] |= dp[j - v[i]];
```

时间复杂度：$O(nV)$。

空间复杂度：$O(V)$。

### `bitset` 优化

```cpp
dp[0] = 1;
for (int i = 1; i <= n; i++)
    dp |= (dp << v[i]);
```

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

```cpp
dp[0] = 1;
for (int i = 1; i <= n; i++)
    for (int j = V; j >= v[i]; j--)
        dp[j] += dp[j - v[i]];
```

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

若是 01 背包，使用长除法，撤销单个物品就是 $O(V)$ 的，会涉及逆元；若是多重背包，采用二进制优化，那么是类似的。

#### dp 角度

删除一个物品，把这个物品的贡献减掉即可。

注意枚举顺序的影响：若是 01 背包，$dp_j-dp_{j-v_i}$ 需要保证 $dp_{j-v_i}$ 已经把这个物品的贡献减掉了，所以要顺序枚举；完全背包则反之，因为可以无限制取，所以需要保证 $dp_{j-v_i}$ 还没有把这个物品的贡献减掉，所以要逆序枚举。

01 背包：

```cpp
for (int j = v[i]; j <= V; j++)
    dp[j] -= dp[j - v[i]];
```
完全背包：

```cpp
for (int j = V; j >= v[i]; j--)
    dp[j] -= dp[j - v[i]]
```

多重背包二进制优化和 01 背包一样处理即可。

但是多重背包实际上按物品体积同余类直接维护区间和即可，枚举顺序同 01 背包：

```cpp
for (int j = 0; j < v[i]; j++) {
    int sum = dp[j];
    for (int k = j + v[i]; k <= V; k += v[i]) {
        dp[k] -= sum;
        if (k >= s[i] * v[i])
            sum -= dp[k - s[i] * v[i]];
        sum += dp[k];
    }
}
```

tips：上述代码未经验证。

综上可得，撤销一个物品的时间复杂度均为：$O(V)$。

## 前后缀背包

顾名思义，就是再开一维记录前 $i$ 个物品的背包结果，或者后 $i$ 个物品的背包结果。

作用是，将前缀 $i-1$ 的背包将后缀 $i+1$ 的背包拼起来，就可以得到去掉第 $i$ 个物品的结果，前文中可撤销性基于求方案数，做前后缀背包可以支持更一般的情况。

预处理时间复杂度：$O(nV)$。

```cpp
dp = pre[i];
for (int j = 0; j <= V; j++)
    for (int k = 0; k <= j; k++)
        dp[j] = max(dp[j], dp[j - k] + suf[i][k]);
```

单次拼起来，本质就是卷积，时间复杂度：$O(V^2)$。

## 树上背包

```cpp
sz[x] = 1;
dp[x][1] = w[x];
for (auto u : p[x]) {
    dfs(u);
    for (int i = min(sz[x], V); i >= 1; i--) {
        for (int j = min(sz[u], V - i); j >= 1; j--) {
            dp[x][i + j] = max(dp[x][i + j], dp[x][i] + dp[u][j]);
        }
    }
    sz[x] += sz[u];
}
```

需要注意的是，经过上下界优化后的树上背包，时间复杂度是 $O(nV)$ 的。

空间复杂度：$O(nV)$。

通过链剖分结合 NTT 的科技，可以做到 $O(n\log^3n)$ 甚至 $O(n\log^2n)$，但是看起来太 useless 了。

### 有依赖的背包

有依赖的背包是一种特殊的树上背包，注意祖先节点一定要选。

## 倍增 NTT 优化特殊可行性完全背包

对于一个可行性完全背包，求最少拿几个物品可以得到 $V$。

令 $F(x)=\sum x^{v_i}$，那么 $F(x)^t$ 即表示用了 $t$ 个物品。

显然，是否能够得到 $V$ 是以物品数量单调的。

预处理 $F(x)^{2^0},F(x)^{2^1}\cdots F(x)^{2^m}$，倍增卷积，得到最小的 $t$ 满足 $[x^V]F(x)^t\neq 0$ 即可。

时间复杂度：$O(V\log^2V)$。