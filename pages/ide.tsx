// pages/ide.tsx
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// 动态导入 Monaco Editor 以避免 SSR 问题
const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-800 flex items-center justify-center text-white">加载编辑器中...</div>
});

// 动态导入 ReactMarkdown 和数学公式支持
const ReactMarkdown = dynamic(() => import('react-markdown'), {
  ssr: false,
  loading: () => <div className="text-white">加载题目中...</div>
});

// 主组件
const CodeEditorPage = () => {
  const router = useRouter();
  const [code, setCode] = useState<string>('// 开始编写您的代码...\n\n');
  const [language, setLanguage] = useState<string>('cpp');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const editorRef = useRef<any>(null);

  // 支持的编程语言
  const languages = [
    { value: 'cpp', label: 'C++' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
  ];

  // 初始化代码模板
  const codeTemplates: { [key: string]: string } = {
    cpp: `#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nstruct Element {\n    int a, b, c;\n};\n\nint main() {\n    int n, k;\n    cin >> n >> k;\n    \n    vector<Element> elements(n);\n    for (int i = 0; i < n; i++) {\n        cin >> elements[i].a >> elements[i].b >> elements[i].c;\n    }\n    \n    // 在这里实现三维偏序的解决方案\n    // 可以使用CDQ分治、树状数组等方法\n    \n    return 0;\n}`,
    python: `# 三维偏序（陌上花开）解决方案\n\ndef main():\n    import sys\n    n, k = map(int, sys.stdin.readline().split())\n    elements = []\n    for _ in range(n):\n        a, b, c = map(int, sys.stdin.readline().split())\n        elements.append((a, b, c))\n    \n    # 在这里实现三维偏序的解决方案\n    # 可以使用CDQ分治、树状数组等方法\n\nif __name__ == \"__main__\":\n    main()`,
    java: `import java.util.*;\n\npublic class Main {\n    static class Element {\n        int a, b, c;\n        Element(int a, int b, int c) {\n            this.a = a;\n            this.b = b;\n            this.c = c;\n        }\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int k = sc.nextInt();\n        \n        Element[] elements = new Element[n];\n        for (int i = 0; i < n; i++) {\n            elements[i] = new Element(sc.nextInt(), sc.nextInt(), sc.nextInt());\n        }\n        \n        // 在这里实现三维偏序的解决方案\n        // 可以使用CDQ分治、树状数组等方法\n    }\n}`,
    javascript: `// 三维偏序（陌上花开）解决方案\n\nfunction main() {\n    // 在Node.js环境中，可以使用以下方式读取输入\n    const readline = require('readline');\n    const rl = readline.createInterface({\n        input: process.stdin,\n        output: process.stdout\n    });\n    \n    let n, k;\n    const elements = [];\n    \n    rl.on('line', (line) => {\n        const data = line.trim().split(' ').map(Number);\n        if (!n) {\n            n = data[0];\n            k = data[1];\n        } else {\n            elements.push({ a: data[0], b: data[1], c: data[2] });\n        }\n    });\n    \n    rl.on('close', () => {\n        // 在这里实现三维偏序的解决方案\n        console.log(\"三维偏序解决方案\");\n    });\n}\n\nmain();`,
    typescript: `// 三维偏序（陌上花开）解决方案\n\ninterface Element {\n    a: number;\n    b: number;\n    c: number;\n}\n\nfunction main(): void {\n    // 在Node.js环境中，可以使用以下方式读取输入\n    const readline = require('readline');\n    const rl = readline.createInterface({\n        input: process.stdin,\n        output: process.stdout\n    });\n    \n    let n: number, k: number;\n    const elements: Element[] = [];\n    \n    rl.on('line', (line: string) => {\n        const data = line.trim().split(' ').map(Number);\n        if (!n) {\n            n = data[0];\n            k = data[1];\n        } else {\n            elements.push({ a: data[0], b: data[1], c: data[2] });\n        }\n    });\n    \n    rl.on('close', () => {\n        // 在这里实现三维偏序的解决方案\n        console.log(\"三维偏序解决方案\");\n    });\n}\n\nmain();`,
    csharp: `using System;\nusing System.Collections.Generic;\n\nclass Program {\n    class Element {\n        public int a, b, c;\n        public Element(int a, int b, int c) {\n            this.a = a;\n            this.b = b;\n            this.c = c;\n        }\n    }\n    \n    static void Main() {\n        string[] firstLine = Console.ReadLine().Split();\n        int n = int.Parse(firstLine[0]);\n        int k = int.Parse(firstLine[1]);\n        \n        List<Element> elements = new List<Element>();\n        for (int i = 0; i < n; i++) {\n            string[] data = Console.ReadLine().Split();\n            elements.Add(new Element(\n                int.Parse(data[0]),\n                int.Parse(data[1]),\n                int.Parse(data[2])\n            ));\n        }\n        \n        // 在这里实现三维偏序的解决方案\n        // 可以使用CDQ分治、树状数组等方法\n    }\n}`,
    go: `package main\n\nimport (\n\t\"fmt\"\n)\n\ntype Element struct {\n\ta, b, c int\n}\n\nfunc main() {\n\tvar n, k int\n\tfmt.Scan(&n, &k)\n\t\n\telements := make([]Element, n)\n\tfor i := 0; i < n; i++ {\n\t\tfmt.Scan(&elements[i].a, &elements[i].b, &elements[i].c)\n\t}\n\t\n\t// 在这里实现三维偏序的解决方案\n\t// 可以使用CDQ分治、树状数组等方法\n}`,
    rust: `use std::io;\n\nstruct Element {\n    a: i32,\n    b: i32,\n    c: i32,\n}\n\nfn main() {\n    let mut input = String::new();\n    io::stdin().read_line(&mut input).unwrap();\n    let mut iter = input.split_whitespace();\n    let n: usize = iter.next().unwrap().parse().unwrap();\n    let k: i32 = iter.next().unwrap().parse().unwrap();\n    \n    let mut elements = Vec::with_capacity(n);\n    for _ in 0..n {\n        let mut input = String::new();\n        io::stdin().read_line(&mut input).unwrap();\n        let mut iter = input.split_whitespace();\n        let a: i32 = iter.next().unwrap().parse().unwrap();\n        let b: i32 = iter.next().unwrap().parse().unwrap();\n        let c: i32 = iter.next().unwrap().parse().unwrap();\n        elements.push(Element { a, b, c });\n    }\n    \n    // 在这里实现三维偏序的解决方案\n    // 可以使用CDQ分治、树状数组等方法\n}`,
  };

  useEffect(() => {
    // 模拟加载延迟
    const timer = setTimeout(() => {
      setIsLoading(false);
      // 设置题目内容
      setMarkdownContent(`# P3810 【模板】三维偏序（陌上花开）

## 题目背景

这是一道模板题，可以使用 bitset，CDQ 分治，KD-Tree 等方式解决。

## 题目描述

有 $ n $ 个元素，第 $ i $ 个元素有 $ a_i,b_i,c_i $ 三个属性，设 $ f(i) $ 表示满足 $ a_j \\leq a_i $ 且 $ b_j \\leq b_i $ 且 $ c_j \\leq c_i $ 且 $ j \\ne i $ 的 $j$ 的数量。

对于 $ d \\in [0, n) $，求 $ f(i) = d $ 的数量。

## 输入格式

第一行两个整数 $ n,k $，表示元素数量和最大属性值。

接下来 $ n $ 行，每行三个整数 $ a_i ,b_i,c_i $，分别表示三个属性值。

## 输出格式

$ n $ 行，第 $ d + 1 $ 行表示 $ f(i) = d $ 的 $ i $ 的数量。

## 输入输出样例 #1

### 输入 #1

\`\`\`
10 3
3 3 3
2 3 3
2 3 1
3 1 1
3 1 2
1 3 1
1 1 2
1 2 2
1 3 2
1 2 1
\`\`\`

### 输出 #1

\`\`\`
3
1
3
0
1
0
1
0
0
1
\`\`\`

## 说明/提示

$ 1 \\leq n \\leq 10^5$，$1 \\leq a_i, b_i, c_i \\le k \\leq 2 \\times 10^5 $。

## 解题思路

### 方法一：CDQ分治

CDQ分治是解决三维偏序问题的经典方法，时间复杂度为 $O(n \\log^2 n)$。

**算法步骤：**

1. 首先按照 $a$ 属性排序
2. 对 $b$ 属性进行分治  
3. 使用树状数组维护 $c$ 属性

### 方法二：树套树

使用二维线段树或树状数组套平衡树，但实现较复杂。

### 方法三：bitset

对于某些特殊情况，可以使用bitset优化，但空间复杂度较高。`);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // 当语言改变时更新代码模板
    setCode(codeTemplates[language] || '// 开始编写您的代码...\n\n');
  }, [language]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleRunCode = () => {
    console.log('运行代码:', code);
    // 这里可以添加代码执行的API调用
  };

  const handleSubmitCode = () => {
    console.log('提交代码:', code);
    // 这里可以添加代码提交的API调用
  };

  // 获取文件扩展名的辅助函数
  const getFileExtension = (lang: string): string => {
    const extensions: { [key: string]: string } = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      csharp: 'cs',
      go: 'go',
      rust: 'rs',
      php: 'php',
      ruby: 'rb',
    };
    return extensions[lang] || 'txt';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-blue-400 text-lg">加载代码编辑器中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-6">
      {/* 头部导航 */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300 text-blue-400"
          >
            ← 返回
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI面试官 - 三维偏序问题
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-blue-400">语言:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/10 border border-cyan-400/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
        {/* 左侧：题目展示 */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-blue-400">题目描述</h2>
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-400 text-sm">
                困难
              </span>
              <span className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-lg text-purple-400 text-sm">
                分治
              </span>
              <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded-lg text-cyan-400 text-sm">
                模板题
              </span>
            </div>
          </div>
          
          <div className="prose prose-invert max-w-none markdown-body">
            {markdownContent && (
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-blue-400 border-b border-cyan-400/30 pb-2 text-2xl font-bold mt-4 mb-6">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-purple-300 mt-8 mb-4 text-xl font-semibold">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-cyan-300 mt-6 mb-3 text-lg font-medium">{children}</h3>,
                  code: ({ children, inline }) => 
                    inline ? (
                      <code className="bg-white/10 px-2 py-1 rounded border border-white/20 text-cyan-300 font-mono text-sm">
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-white/10 p-4 rounded-lg border border-white/20 text-gray-300 my-4 overflow-x-auto font-mono text-sm">
                        {children}
                      </code>
                    ),
                  pre: ({ children }) => <div className="my-4">{children}</div>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-cyan-400 pl-4 my-4 text-gray-300 italic bg-white/5 py-2 rounded-r-lg">
                      {children}
                    </blockquote>
                  ),
                  p: ({ children }) => <p className="my-3 text-gray-300 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="my-3 text-gray-300 list-disc list-inside space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="my-3 text-gray-300 list-decimal list-inside space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="pl-2">{children}</li>,
                  table: ({ children }) => <table className="w-full my-4 border-collapse border border-white/20">{children}</table>,
                  th: ({ children }) => <th className="border border-white/20 px-4 py-2 bg-white/10 text-blue-400 font-semibold">{children}</th>,
                  td: ({ children }) => <td className="border border-white/20 px-4 py-2 text-gray-300">{children}</td>,
                }}
              >
                {markdownContent}
              </ReactMarkdown>
            )}
          </div>
        </div>

        {/* 右侧：代码编辑器 */}
        <div className="flex flex-col bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {/* 编辑器头部 */}
          <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-blue-400 ml-2 font-mono">solution.{getFileExtension(language)}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-400 font-mono">
                {language.toUpperCase()}
              </span>
            </div>
          </div>

          {/* 代码编辑器 */}
          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
                tabSize: 2,
                glyphMargin: true,
                lineNumbers: 'on',
                folding: true,
                bracketPairColorization: { enabled: true },
                renderLineHighlight: 'all',
              }}
            />
          </div>

          {/* 底部操作栏 */}
          <div className="p-4 border-t border-white/10 bg-white/5">
            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                <button
                  onClick={handleRunCode}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium flex items-center space-x-2"
                >
                  <span>▶</span>
                  <span>运行代码</span>
                </button>
                
                <button
                  onClick={handleSubmitCode}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 font-medium flex items-center space-x-2"
                >
                  <span>✓</span>
                  <span>提交答案</span>
                </button>

                <button
                  onClick={() => setCode(codeTemplates[language] || '// 开始编写您的代码...\n\n')}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300 text-gray-300"
                >
                  重置代码
                </button>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <span>行数:</span>
                  <span className="text-blue-400 font-mono">{code.split('\n').length}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>字符:</span>
                  <span className="text-purple-400 font-mono">{code.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 装饰性元素 */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 left-3/4 w-1 h-1 bg-cyan-400/50 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-purple-400/20 rounded-full animate-pulse"></div>
      </div>

      {/* 添加数学公式支持的样式 */}
      <style jsx global>{`
        .markdown-body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        
        .markdown-body math {
          font-size: 1.1em;
        }
        
        .markdown-body mrow {
          display: inline;
        }
        
        .markdown-body mfrac {
          display: inline-block;
          vertical-align: -0.5em;
          text-align: center;
        }
        
        .markdown-body mfrac > * {
          display: block;
        }
        
        .markdown-body mfrac numer {
          padding: 0 0.2em;
          border-bottom: 1px solid;
        }
        
        .markdown-body mfrac denom {
          padding: 0 0.2em;
        }
      `}</style>
    </div>
  );
};

// 确保默认导出组件
export default CodeEditorPage;