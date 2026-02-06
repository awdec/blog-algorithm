<style>
 body {
  font-family: "楷体"
}
</style>

<h1><center>字符串处理</center></h1>

## append

1. 追加 string

```cpp
string s1 = "Hello";
string s2 = " World";
s1.append(s2); // 追加s2的全部内容
cout << s1; // 输出：Hello World
```

2. 追加 string 子串

```cpp
string s1 = "Hello";
string s2 = "123456789";
s1.append(s2, 2, 4);// 从s2的第2个位置（字符'3'）开始，截取4个字符（3,4,5,6）
cout << s1; // 输出：Hello3456
```

3. 追加 $n$ 个相同的字符

```cpp
string s1 = "XXX";
s1.append(5, '!'); // 追加5个'!'
cout << s1; // 输出：XXX!!!!!
```

4. 追加迭代器范围的字符

```cpp
string s1 = "abc";
vector<char> v = {'d','e','f','g'};
s1.append(v.begin(), v.end()-1);// 追加 v 中从 begin() 到 end() - 1 的字符（d, e, f）
cout << s1; // 输出：abcdef
```

## substr

提取字符串中的部分内容

```cpp
string s = "2026-02-05";
string year = s.substr(0, 4);  // "2026"
string month = s.substr(5, 2); // "02"
string day = s.substr(8);      // "05"（到末尾）
```

## 查找、替换

```cpp
string s = "C++11 is good, C++11 is powerful";

// C++98查找
size_t pos = s.find("11");          // 3（首次出现的位置）
size_t rpos = s.rfind("11");        // 18（最后一次出现的位置）

// C++20易用查找
bool is_prefix = s.starts_with("C++"); // true
bool is_suffix = s.ends_with("powerful"); // true

// C++23 contains
bool has_11 = s.contains("11");     // true

// 替换
s.replace(pos, 2, "23");            // 把第一个"11"替换为"23"
cout << s << endl;                  // "C++23 is good, C++11 is powerful"
```

## 字符串-整数转换

|函数|作用|
|---|---|
|stoi()/stol()/stoll()|字符串转 int/long/long long|
|stof()/stod()/stold()|字符串转 float/double/long double|
|to_string()|数值转字符串（支持 int、float、double 等）|

stoi 完整版参数可指定整数进制：

```cpp
string bin = "1010";    // 二进制
string oct = "12";      // 八进制
string hex1 = "0xFF";   // 十六进制（带0x）
string hex2 = "a3";     // 十六进制（小写，无0x）
string base36 = "z";    // 36进制，z表示35（a=10, ..., z=35）

int b = stoi(bin, nullptr, 2);    // 二进制转int → 10
int o = stoi(oct, nullptr, 8);    // 八进制转int → 10
int h1 = stoi(hex1, nullptr, 16); // 十六进制转int → 255
int h2 = stoi(hex2, nullptr, 16); // 十六进制转int → 163
int b36 = stoi(base36, nullptr,36);//36进制转int →35

cout << b << " " << o << " " << h1 << " " << h2 << " " << b36;
// 输出：10 10 255 163 35
```

第二个参数作用略。

## 字符分类函数

|函数|作用|
|isupper|判断是否是大写字母|
|islower()|判断是否是小写字母|
|isalpha()|判断是否是字母|
|isdigit()|判断是否是数字|
|isalnum()|判断是否是字母或数字|
|isspace()|判断是否是空白字符|
|ispunct()|判断是否是标点符号|
|isxdigit()|判断是否是十六进制数字|

## 字符转换函数

|函数|作用|
|toupper()|小写转大写|
|tolower()|大写转小写|