<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>珂朵莉树</center></h1>

名字来自于 CF896C 的题图。

本质是用数据结构维护区间连续段。

出于实际使用情况考虑，省略链表维护的介绍。

## split

```cpp
void split(int x) {
    auto it = prev(mp.upper_bound(x));
    mp[x] = it->second; 
}
```

## assign

区间推平，一般是区间赋值。

```cpp
void assign(int l, int r, int v) {
    r++;
    split(l);
    split(r);
    auto it = mp.find(l);
    while (it->first != r) {
        it = mp.erase(it);
    }
    mp[l] = v;
}
```

## perform

遍历区间 $[l,r]$，在遍历过程中进行具体操作。

```cpp
void perform(int l, int r, int v) {
    r++;
    split(l);
    split(r);
    auto it = mp.find(l);
    while (it->first != r) {
        // 具体操作
        it = next(it);
    }
}
```



## 时间复杂度分析

### 区间推平时

若每次操作后，都会进行一次区间推平操作，即将区间合并成一个相同的连续段。

每个区间只会被遍历一次，每次最多增加一个区间，最多增加到 $n$ 个区间。遍历次数和区间数量的变化成线性相关，那么均摊时间复杂度为：$O(m\log n)$。

### 数据随机时

CF896C 证明了这种情况的时间复杂度为 $O(m\log\log n)$。