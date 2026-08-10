<h1><center>优秀的编码习惯（卡常）</center></h1>

用时间复杂度和空间复杂度衡量一个算法的时间效率和空间效率。

描述时空复杂度时，通常使用渐进符号表示，因此一般只考虑时空复杂度函数中的最高阶项。

简便地，通常只使用 $O$ 描述时空复杂度。

所以，描述时空复杂度时，通常会忽略常数，例如 $100n$ 和 $n$ 均为 $O(n)$。

但是程序的实际执行效率却会受常数影响，而在部分情况下，这一部分的影响并不能忽略。

与一般“卡常”文章相比，本文着重于相同做法下的不同实现导致的常数差异，侧重于讨论小常数代码习惯，而非通常的“硬件优化”。


在特定数据范围、实现和运行环境下，常数较小但渐进复杂度稍劣的代码可能反而更快。例如重链剖分配合数据结构与 LCT 的实际速度经常受到操作比例、实现质量和测试数据影响，不能只根据 $\log$ 的个数判断。

本文表格保留的是一次历史测试记录，不是严格、可复现的 benchmark：原记录没有完整保存处理器型号、编译器具体版本与全部参数、测试源码、输入与随机种子、输出校验和以及多次运行的统计分布，也有测试对象被编译器消除的情况。因此这些数据只能作为当时环境下的现象记录，不能据此推出一般性的 STL 或语言特性常数结论。

若要重新比较，应固定并公开硬件、编译器及参数和测试源码；让各实现完成语义相同的工作；预热后独立运行多次并报告中位数、离散程度；使用校验和或等价的防优化措施消费结果，同时检查输出正确性。以下各表均应在这一限制下阅读。

## STL 常数

STL 容器提供了通用接口、异常安全和较完整的语义保证，其实际开销依赖具体实现与使用方式；手写实现也不天然更快。下面保留一组旧测试数据作为观察样本。

原记录注明的环境为：2025.9.11 洛谷、C++20、开启 O2，插入元素为 $[1,n]$。由于最终只保留了单次值，没有完整的多次统计和测试源码，所以不能复现实验或用这些数值比较细小差异。

注：不同平台、编译环境会导致实际情况不同，以下测试数据仅供参考。

|容器|1e6 次操作 `int`|5e6 次操作 `int`|空的 5e6 个 不使用|5e6 个，每个一个元素|
|---|---|---|---|---|
|`vector`|`push_back` 17ms 5MB|`push_back` 20ms 33MB|测试对象被优化掉，结果无效|`push_back` 300ms 267MB|
|`vector`|`reserve` 7ms 4MB|`reserve` 12ms 19MB|/|/|
|`deque`|`push_back` 7ms 4MB|`push_back` 20ms 20MB|>251ms >512MB|/|
|`list`|`push_back` 46ms 31MB |`push_back`  208ms 153MB | 48ms 115MB | `push_back` 254ms 268MB |
|`priority_queue`|`push` 33ms 5MB|`push`  172ms 32 MB|60ms 153MB|`push`  272ms 306MB |
|`set`|`insert`  241ms 46MB|`insert`  1.53s 229 MB|89ms 229MB|`insert`  348ms 459MB |
|`unordered_set`|`insert` 78ms 42MB |`insert` 356ms 198MB|106ms 267MB|`insert` >312ms >512MB|


注：
- `queue` 和 `stack` 默认以 `deque` 为底层容器，也可以改用满足接口要求的其它容器；适配器与底层容器的操作路径相关，但不能直接断言耗时完全一致。
- `priority_queue` 默认以 `vector` 存储元素，并额外维护堆性质，因此 `push`、`pop` 与普通 `vector::push_back` 不是语义或复杂度相同的操作。
- `set`、`map` 及其 multi 版本通常采用相近的平衡树结构，但元素大小、比较器和操作分布不同，标准也不保证某一种具体实现；`unordered` 容器同样不能据此视为时空效率完全一致。

这些容器有部分重叠的操作，但迭代器、访问方式、稳定性和复杂度保证并不相同。下面仅按原测试所比较的操作分成两组保留数据。


注：因为 `list` 插入 5e7 个元素内存过大，所以 `list` 只插入 1e7 个元素。

|容器|插入 5e7 个元素|遍历 5e7 个元素|插入 5e7 个元素并 rand()|随机访问 5e7 次|
|---|---|---|---|---|
|数组/`array`|赋值 5ms|`auto` 75ms| 769ms| 1.97s|
|`vector`|`push_back` 180ms| `auto` 200ms|920ms|2.44s|
|`deque`|`push_back` 160ms|`auto` 190ms |880ms| 3.95s|
|`list`|`push_back` 420ms|`auto`  450ms|560ms|不支持随机访问|


|容器|插入 1e6 个元素并删除|插入 5e6 个元素并删除|
|---|---|---|
|`set`|310ms|1.82s|
|`priority_queue`|80ms| 430ms|


这些旧数据至多说明容器选择可能影响实际常数。实际使用时应先按语义和复杂度选择合适容器，再针对目标平台和真实负载进行可靠测量。

## 数组下标访问

多维数组在内存中是按行优先连续存储的。

如果遍历时没有按照最右维向左的顺序，那么每次访问内存时不连续，会极大地降低 CPU 缓存命中率。

应用场景主要是多维 dp 时，考虑 dp 状态维度的设计，使得最内层的循环位于数组的最右侧。

一个经典的场景是 ST 表预处理，以洛谷 P3865 为例 $N=10^5$：
- 按行遍历：最慢点 300ms
- 按列遍历：最慢点 440ms



## 快速读入

这里需要比较的只有 关流 `cin` 和 `fread` 快读，默认 $|a_i|\le n$

|读入方式|$n=10^5$|$n=10^6$|$n=10^7$|$n=10^8$|
|---|---|---|---|---|
|`scanf`|10ms|72ms|700ms|>2.7s|
|`cin` 关流|9ms|58ms|565ms|>2.7s|
|`getchar`|6ms|30ms|290ms|>2.7s|
|`fread`|5ms|16ms|133ms|1.39s|

同时，因为部分平台问题，实际情况会有差异。

下面的 `gc()` 必须返回 `int`，才能把所有字节值与 `EOF` 区分开；`read(x)` 和 `read_char(c)` 以 `bool` 表示是否成功读到一个值，调用方可以据此在文件结束时停止。该 `read(int&)` 假设输入整数位于 `int` 范围内；若输入范围更大，还应改用更宽类型并检查累积过程是否溢出。

:::details 点击展开代码
```cpp
namespace IO
{
    char buf[1 << 21], *p1 = buf, *p2 = buf;
    static inline int gc()
    {
        if (p1 == p2)
        {
            p2 = (p1 = buf) + fread(buf, 1, 1 << 21, stdin);
            if (p1 == p2)
                return EOF;
        }
        return static_cast<unsigned char>(*p1++);
    }
    static inline bool read(int &x)
    {
        int c = gc(), f = 1;
        while (c != EOF && c != '-' && (c < '0' || c > '9'))
            c = gc();
        if (c == EOF)
            return false;
        if (c == '-')
        {
            f = -1;
            c = gc();
        }
        if (c == EOF || c < '0' || c > '9')
            return false;
        x = 0;
        while (c >= '0' && c <= '9')
        {
            x = x * 10 + c - '0';
            c = gc();
        }
        x *= f;
        return true;
    }
    static inline bool read_char(char &x)
    {
        int c = gc();
        while (c != EOF && (c == ' ' || c == '\n' || c == '\r' || c == '\t'))
            c = gc();
        if (c == EOF)
            return false;
        x = static_cast<char>(c);
        return true;
    }

    char out_buf[1 << 21];
    int out_pos = 0;
    static inline void flush()
    {
        fwrite(out_buf, 1, out_pos, stdout);
        out_pos = 0;
    }
    struct Flusher
    {
        ~Flusher() { flush(); }
    };
    static Flusher flusher;
    static inline void pc(char c)
    {
        if (out_pos == (1 << 21))
            flush();
        out_buf[out_pos++] = c;
    }

    static inline void write(long long x)
    {
        static char stk[25];
        int top = 0;
        unsigned long long y;

        if (x < 0)
        {
            pc('-');
            y = 0 - static_cast<unsigned long long>(x);
        }
        else
            y = static_cast<unsigned long long>(x);

        if (y == 0)
            pc('0');

        while (y)
        {
            stk[++top] = y % 10 + '0';
            y /= 10;
        }
        while (top)
            pc(stk[top--]);
        pc('\n');
    }
}
using IO::flush;
using IO::read;
using IO::read_char;
using IO::write;
```
:::

`write` 先把有符号整数转换为无符号幅值，因此也能安全输出 `LLONG_MIN`。静态 `Flusher` 会在程序正常结束时调用 `flush()`；若需要立即看到输出仍可手动刷新，异常终止则不保证缓冲区被写出。

## 快速取模

|取模方式|P3373 线段树 2|5e8 次 rand×rand 求和|
|---|---|---|
|不取模|78ms|5.75s|
|直接取模|460ms|7.17s|
|`const`|103ms|6.21s|
|`Barrett`|119ms|6.44s|

在这组旧数据对应的实现中，编译期常量模数已经得到较好的优化；模数运行期读入时是否需要 Barrett 等方法，仍应根据目标编译器、数据范围和可靠 benchmark 决定。

## 小常数数据结构

原测试中观察到：树状数组 < 线段树 < 平衡树。该顺序只针对表中的题目、实现和操作分布，不是普遍性能定理。

|数据结构|P3372 线段树 1|
|---|---|
|树状数组|31ms|
|zkw线段树|41ms|
|递归式线段树|72ms|
|平衡树|154ms|

## 枚举变量的上下界

部分情况下，枚举变量时可以避免一些冗余的情况。

例如枚举无序且互异的二元组 $(i,j),i,j\in[1,n]$ 时，可以钦定 $i<j$，从而避免把 $(i,j)$ 和 $(j,i)$ 各枚举一次。

枚举两个二维点组成的无序点对时，只能按一个固定的全序去重，例如限制 `id1 < id2`，或按 $(x,y)$ 的字典序限制第二个点更大。不能同时要求 $x_2\ge x_1$ 且 $y_2\ge y_1$：点 $(0,1)$ 与 $(1,0)$ 无论交换为哪一种顺序都不满足这两个条件，会被完全漏掉。只有题目本身要求坐标支配关系时，才能使用这样的偏序筛选。

dfs 搜索时，可以在递归的过程中顺带计算信息，而非在递归边界从头算一遍信息。

## 位运算

调用优秀实现的位运算库函数，把 $O(w)$ 的计算优化到 $O(1)$。

## 局部变量

缩小变量作用域通常有利于可读性，也可能帮助编译器进行别名分析和寄存器分配，但局部变量并不保证比全局变量更快。

例如局部的 `res` 没有逃逸且寄存器压力较小时，开启优化的编译器往往能把它长期保存在寄存器中；但局部变量也可能被溢出到栈上，编译器能够证明没有外部修改的全局变量也可能得到相同优化。是否更快取决于生成代码和运行环境，应通过可靠 benchmark 验证。

## lambda 表达式

lambda 的调用运算符通常在使用处可见，因此经常能够被内联；定义在同一翻译单元内的普通函数同样可能被内联，是否成功由编译器、函数大小、调用方式和优化选项决定。捕获对象以及用 `std::function` 做类型擦除还可能引入额外开销，所以不能把“lambda 更容易内联”当作无条件结论。
