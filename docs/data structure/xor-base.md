<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>线性基</center></h1>

注：线性基应当属于线性代数范畴，但是其在算法竞赛中通常用于维护异或，所以将其放在数据结构中。

算法竞赛中的线性基一般只考虑异或线性基。

线性基简单来讲就是一个整数集合的异或意义下的极大线性无关组。

具体而言，对于给定集合 $A$，任意整数 $c=\oplus_{i=1}^n a_i,a_i\in A$，若都存在 $c=\oplus_{i=1}^m b_i,b_i\in B$，且 $|B|$ 最小，则 $B$ 称作 $A$ 的线性基。

从另一个角度来看，线性基将原集合的 $2^n$ 的状态缩小至 $2^m$，其中 $n$ 是集合大小，$m$ 是值域的二进制位数。

在具体实现上，将集合中的任一元素，视作一个 $1\times m$ 的元素为 `01` 的向量；将原集合视作一个 $n\times m$ 的 `01` 矩阵。

假设第一列是最高位。

## 构建：

### 高斯消元：

从**最高位**开始，对该矩形进行高斯消元，化简成最简型矩阵。

去掉全零行，最终形成的 $m'\times m$ 的矩阵即为原集合的线性基。

任一能通过选择原矩阵若干行求异或和得到的向量，都能通过选择最终矩阵的若干行异或得到。

使用 `bitset` 维护，时间复杂度：$O(\frac{m^2n}{w})$。


```cpp
void build(int n, vector<int> &t) {
    a.resize(n);
    num.resize(64);
    this->n = n;
    for (int i = 1; i <= n; i++) {
        a[i - 1] = t[i];
    }
    int now = 63;
    for (int i = 0; i < n; i++) {
        for (int j = i; j < n; j++) {
            if (a[j][now]) {
                swap(a[j], a[i]);
                break;
            }
        }
        if (!a[i][now]) {
            now--;
            if (now < 0)
                break;
            i--;
        } else {
            num[i] = now;
            for (int j = 0; j < n; j++) {
                if (j == i)
                    continue;
                if (a[j][now])
                    a[j] ^= a[i];
            }
            now--;
            if (now < 0)
                break;
        }
    }
}
```

### 贪心法：

按 $1\sim n$ 的顺序将每一个元素加入线性基，也就是在前 $i-1$ 个元素构建的线性基的基础上维护新的线性基。

实际上和高斯消元本质相同，加入 $x$ 时，从最高位到最低位枚举 $x$ 二进制中的 $1$，找到第一个没有被占用的位，$x$ 占用这一位。过程中如果某一位已经被占据，则 $x$ 异或上这一位对应的行。

时间复杂度：$O(\frac{m^2n}{w})$。

与高斯消元相比的优势有：
- 在线
- 支持回退
- 空间复杂度：$O(w)$

```cpp
void insert(int v) {
    for (int i = 63; i >= 0; i--) {
        if ((v >> i) & 1) {
            if (!a[i]) {
                a[i] = v;
                break;
            } else {
                v ^= a[i];
            }
        }
    }
}
```


虽然一般情况下，线性基会从最高位开始消元，但实际上，因为秩的大小不一定为 $n$，那么消元后的自由元取决于对哪些位进行了消元。

求子集异或和第 $k$ 大时，需要从最高位开始消元，此时自由元是最高的若干位。但若期望自由元是最低的若干位，那么应当从最低位开始消元。若每一位带有额外权值，应当按位的权值顺序消元。


## 性质：

注意 $0$ 的特判，需要结合题目如果不选任何数是否可以视作 $0$ 下文中，均去掉 $0$。

判断线性基是否可以形成 $0$，只要判断在线性基构建的过程中是否出现了全 $0$ 行即可。

### 最小值：

最后一行非零行表示的二进制整数。

### 最大值：

所有行异或起来表示的二进制整数。

### 第 $k$ 小/大

首先，线性基能表示的整数数量为 $2^{m'}$，所以第 $k$ 大可以等价于求第 $2^{m'}-k+1$ 小。

事实上，这和字典序第 $k$ 小是类似的。

贪心地，从第一行开始，选择了第 $i$ 行，会超过 $2^{m'-i}$ 个整数，所以和 $k$ 比较即可判断是否应该选择第 $i$ 行。

若线性基可表示值域超过整型范围，则无法通过整数运算求解。

进一步地，实际上可以注意到，第 $k$ 小相当于是选择 $k$ 的二进制中的 $1$ 位对应的那些行。

时间复杂度：$O(m)$。

```cpp
int query_max() {
    int res = 0;
    for (int i = 0; i < n; i++)
        res ^= a[i].to_ullong();
    return res;
}
int query_min() { return a[n - 1].to_ullong(); }
int query_kth(int k) {
    int cnt = 0;
    int flag = 1;
    for (int i = 0; i < n; i++) {
        if (a[i].count())
            cnt++;
        else
            flag = 0;
    }
    int res = 0;
    int m = n - 1;
    for (int i = n - 1; i >= 0; i--)
        if (a[i].count()) {
            m = i;
            break;
        }
    if (!flag) {
        k--;
    }
    if (!k)
        return 0;
    for (int i = 0; i < n; i++) {
        if ((k >> i) & 1)
            res ^= a[m - i].to_ullong();
    }
    return res;
}
```

## 解的构造

对于线性基找出的解，要还原出其在原集合中由哪些数组成。

### set 维护

对于线性基过程中的每一个行向量，直接用一个 `set` 维护其由原序列中哪些数异或得到。

时间复杂度：$O(nw^2\log w)$。


```cpp
void insert(int x, int v) {
    set<int> now;
    now.insert(x);
    for (int i = 63; i >= 0; i--) {
        if ((v >> i) & 1) {
            if (!a[i]) {
                a[i] = v;
                pos[i] = now;
                break;
            } else {
                v ^= a[i];
                for (auto u : pos[i]) {
                    if (now.count(u))
                        now.erase(u);
                    else
                        now.insert(u);
                }
            }
        }
    }
}
```

时间复杂度证明在于线性基维护过程中，每个行向量最多由 $w$ 原集合中的数异或得到。

### bitset 维护

因为每个行向量由且仅有它前面的行向量异或得到，而行向量插入线性基后不会被覆盖，所以可以用一个 `bitset` 存储每一个行向量由当前哪些行向量异或得到，同时存下每个行向量插入线性基时初始对应的值。

还原元素时，把那些行向量的 `bitset` 异或起来，再把最终需要的行向量的初始值异或得到最后的解。

时间复杂度：$O(nw)$。

```cpp
void insert(int x, int v) {
    bitset<30> now;
    for (int i = 63; i >= 0; i--) {
        if ((v >> i) & 1) {
            if (!a[i]) {
                a[i] = v;
                mp[i] = x;
                pos[i] = now;
                pos[i].set(i);
                break;
            } else {
                v ^= a[i];
                now ^= pos[i];
            }
        }
    }
}
```