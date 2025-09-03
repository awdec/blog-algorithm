<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>堆</center></h1>


## 对顶堆

​对顶堆是一种专门用来解决动态全局第 $k$ 大的数据结构，其时间复杂度依赖于相邻询问 $k$ 的变化量。

​具体而言，用一个小根堆维护前 $k$ 大，用一个大根堆维护剩下的元素。当插入元素不大于小根堆堆顶元素时不会成为答案，所以插入大根堆；当插入元素比小根堆堆顶元素大时，可能成为答案，插入小根堆，并将新小根堆的堆顶元素弹出插入大根堆。询问时第 $k$ 大就是小根堆堆顶元素。

​当 $k$ 变化时，随之维护小根堆和大根堆的大小。具体而言，若 $k$ 小于小根堆的 $size$，不断将大根堆的堆顶弹出插入小根堆直到小根堆 $size$ 和 $k$ 相等；若 $k$ 大于小根堆的 $size$，不断将小根堆的堆顶弹出插入大根堆直到小根堆 $size$ 和 $k$ 相等。

​时间复杂度：$O(n\log n+\sum |k_i-k_{i-1}|\log n)$，常数小。

​局限性极大，主要优势大概是解决此类问题码量小吧。

## 可并堆

​与朴素二叉堆相比，可以在 $O(\log n)$ 的时间合并两个堆，而不是 $O(n)$。

​采用启发式合并可以总 $O(n\log^2n)$ 的合并，采用随机合并类似。	

​一般使用的可并堆为配对堆、左偏树。其中配对堆为均摊时间复杂度无法可持久化，左偏树支持可持久化。可持久化可并堆一般仅用于求 $k$ 短路，根据持久化的堆不同，时间复杂度略有不同。

​虽然 STL 中仅支持了优先队列 `priority_queue`（二叉堆），但是 `pb_ds` 中扩展了可并堆，以及一些其它堆，默认使用配对堆。虽然不同堆的时间效率不同，但是综合效率配对堆已足够优秀。

|tag|push|pop|modify|erase|join|
|---|---|---|---|---|---|
|pairing_heap_tag|$O(1)$|均摊 $O(\log n)$|均摊 $O(\log n)$|均摊 $O(\log n)$|$O(1)$|
|binary_heap_tag|均摊 $O(\log n)$|均摊 $O(\log n)$|$O(n)$|$O(n)$|$O(n)$|
|binomial_heap_tag|均摊 $O(1)$|$O(\log n)$|$O(\log n)$|$O(\log n)$|$O(\log n)$|
|rc_binomial_heap_tag|$O(1)$|$O(\log n)$|$O(\log n)$|$O(\log n)$|$O(\log n)$|
|thin_heap_tag|$O(1)$|均摊 $O(\log n)$|均摊 $O(1)$|均摊 $O(1)$|$O(n)$|

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

注：迭代器可被记录，在 `push` 元素时，将其迭代器用数组存起来，可在后续访问。