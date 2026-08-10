<h1><center>堆</center></h1>


## 对顶堆

对顶堆可以维护动态集合的全局第 $k$ 大。重复值按多个元素计算，查询时必须保证 $1\le k\le n$。

维护两个堆：

- 小根堆 $q$：恰好保存前 $k$ 大的元素；
- 大根堆 $Q$：保存其余元素。

始终保持 `q.size() == k`，且 $Q$ 中的最大值不大于 $q$ 中的最小值。$q$ 堆顶就是第 $k$ 大。

当 $k$ 变小时，将 `q` 的堆顶不断移入 `Q`；当 $k$ 变大时，将 $Q$ 的堆顶不断移入 $q$，直到 `q` 的大小等于新的 $k$。

插入时，若新元素不大于当前第 $k$ 大，直接放入 `Q`；否则先放入 $q$，再把 $q$ 的最小值移入 `Q`，以保持 `q` 的大小不变。

时间复杂度：$O(n\log n+\sum |k_i-k_{i-1}|\log n)$，常数小。

单次插入为 $O(\log n)$，将 $k$ 从 $k_1$ 调整到 $k_2$ 为 $O(|k_1-k_2|\log n)$，查询为 $O(1)$，空间为 $O(n)$。


## 可并堆

与朴素二叉堆相比，可以在 $O(\log n)$ 的时间合并两个堆，而不是 $O(n)$。

采用启发式合并可以总 $O(n\log^2n)$ 的合并，采用随机合并类似。	

一般使用的可并堆为配对堆、左偏树。其中配对堆为均摊时间复杂度无法可持久化，左偏树支持可持久化。可持久化可并堆一般仅用于求 $k$ 短路，根据持久化的堆不同，时间复杂度略有不同。

虽然 STL 中仅支持了优先队列 `priority_queue`（二叉堆），但是 `pb_ds` 中扩展了可并堆，以及一些其它堆，默认使用配对堆。虽然不同堆的时间效率不同，但是综合效率配对堆已足够优秀。

|tag|push|pop|modify|erase|join|
|---|---|---|---|---|---|
|pairing_heap_tag|$O(1)$|均摊 $O(\log n)$|均摊 $O(\log n)$|均摊 $O(\log n)$|$O(1)$|
|binary_heap_tag|均摊 $O(\log n)$|均摊 $O(\log n)$|$O(n)$|$O(n)$|$O(n)$|
|binomial_heap_tag|均摊 $O(1)$|$O(\log n)$|$O(\log n)$|$O(\log n)$|$O(\log n)$|
|rc_binomial_heap_tag|$O(1)$|$O(\log n)$|$O(\log n)$|$O(\log n)$|$O(\log n)$|
|thin_heap_tag|$O(1)$|均摊 $O(\log n)$|均摊 $O(1)$|均摊 $O(1)$|$O(n)$|

:::details 点击展开代码
```cpp
#include <algorithm>
#include <cstdio>
#include <ext/pb_ds/priority_queue.hpp>
#include <iostream>
using namespace __gnu_pbds;

//#define pair_heap __gnu_pbds::priority_queue<int,greater<int>,pairing_heap_tag> 小根堆，greater<int> 需要 namespace std
#define pair_heap __gnu_pbds ::priority_queue<int>//大根堆
pair_heap q1;
pair_heap q2;
pair_heap ::point_iterator id;  // 一个迭代器

int main() {
  id = q1.push(1);
  // 堆中元素 ： [1];
  for (int i = 2; i <= 5; i++) q1.push(i);
  // 堆中元素 :  [1, 2, 3, 4, 5];
  std ::cout << q1.top() << std ::endl;
  // 输出结果 : 5;
  q1.pop();
  // 堆中元素 : [1, 2, 3, 4];
  id = q1.push(10);
  // 堆中元素 : [1, 2, 3, 4, 10];
  q1.modify(id, 1);
  // 堆中元素 :  [1, 1, 2, 3, 4];
  std ::cout << q1.top() << std ::endl;
  // 输出结果 : 4;
  q1.pop();
  // 堆中元素 : [1, 1, 2, 3];
  id = q1.push(7);
  // 堆中元素 : [1, 1, 2, 3, 7];
  q1.erase(id);
  // 堆中元素 : [1, 1, 2, 3];
  q2.push(1), q2.push(3), q2.push(5);
  // q1中元素 : [1, 1, 2, 3], q2中元素 : [1, 3, 5];
  q2.join(q1);
  // q1中无元素，q2中元素 ：[1, 1, 1, 2, 3, 3, 5];
}
```
:::

注：迭代器可被记录，在 `push` 元素时，将其迭代器用数组存起来，可在后续访问。 
