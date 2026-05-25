---
title: RAG 高级索引和检索策略
date: 2025-11-15
---

在RAG中，文档存储的组织形式和文档的索引质量也决定着RAG检索的质量。

在普通的RAG索引中，经常会出现如下的问题：
* 文档过长：嵌入Prompt的字数过多，语义信息过于粗糙。
* 上下文丢失：将文档分成小块之后，丢失了上下块之间的联系，导致检索不完全。
* 多语义内容：一个文档包含多个主题，单一向量无法理解所有的语义。
* 检索冗余：检索到大量重复内容的文档。

## 智能文档分块策略 Chunking

文档分块（Chunking）是将长文档切分成更小片段的过程。好的分块策略能显著提升检索质量。

#### 固定长度分块

```python
def fixed_length_split(text: str, chunk_size: int = 500) -> List[str]: 
	"""简单但可能切断语义""" 
	return [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]
```


#### 按句子分块

```python
def sentence_split(text: str, max_sentences: int = 5) -> List[str]:
    """保持语义完整但长度不均"""
    sentences = text.split('。')
    chunks = []
    current_chunk = []
    
    for sent in sentences:
        current_chunk.append(sent)
        if len(current_chunk) >= max_sentences:
            chunks.append('。'.join(current_chunk))
            current_chunk = []
    
    if current_chunk:
        chunks.append('。'.join(current_chunk))
    
    return chunks
```

* 完全按照句子`。`来分块，当`current_chunk`里的句子数目达到`max_sentences`（默认为5）时，划分为一个`chunk`。

#### 语义分块

```python
from langchain_openai import OpenAIEmbeddings
import numpy as np
from typing import List, Tuple

class SemanticChunker:
    """基于语义相似度的分块器"""
    
    def __init__(self, embeddings, similarity_threshold: float = 0.75):
        self.embeddings = embeddings
        self.similarity_threshold = similarity_threshold
    
    def cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """计算余弦相似度"""
        return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
    
    def split_text(self, text: str) -> List[str]:
        """基于语义相似度分块"""
        # 1. 按句子分割
        sentences = [s.strip() + '。' for s in text.split('。') if s.strip()]
        
        if len(sentences) <= 1:
            return [text]
        
        # 2. 计算每个句子的嵌入
        embeddings = [
            np.array(self.embeddings.embed_query(sent))
            for sent in sentences
        ]
        
        # 3. 计算相邻句子的相似度
        similarities = []
        for i in range(len(embeddings) - 1):
            sim = self.cosine_similarity(embeddings[i], embeddings[i+1])
            similarities.append(sim)
        
        # 4. 在相似度低的地方切分
        chunks = []
        current_chunk = [sentences[0]]
        
        for i, sim in enumerate(similarities):
            if sim < self.similarity_threshold:
                # 相似度低，开始新块
                chunks.append(''.join(current_chunk))
                current_chunk = [sentences[i+1]]
            else:
                # 相似度高，添加到当前块
                current_chunk.append(sentences[i+1])
        
        # 添加最后一块
        if current_chunk:
            chunks.append(''.join(current_chunk))
        
        return chunks

# 使用示例
embeddings = OpenAIEmbeddings()
semantic_chunker = SemanticChunker(embeddings, similarity_threshold=0.7)

text = """
机器学习是人工智能的一个分支。它使计算机能够从数据中学习。
深度学习是机器学习的一个子领域。它使用神经网络来建模复杂模式。

Python是一种流行的编程语言。它广泛用于数据科学和机器学习。
Python有丰富的库生态系统。NumPy和Pandas是常用的数据处理库。
"""

chunks = semantic_chunker.split_text(text)

print(f"语义分块结果: {len(chunks)} 块")
for i, chunk in enumerate(chunks):
    print(f"\n块 {i+1}:\n{chunk}")
```

* `sentences = [s.strip() + '。' for s in text.split('。') if s.strip()]`：
	- `text.split('。')`：使用“。”作为**分隔符** 来分割字符串。
	- `if s.strip()`：这是一个**过滤器**。`.strip()` 移除首尾空白符。如果结果是一个**空字符串**（在布尔上下文中为 `False`），`if` 条件不满足，该条目将被**丢弃**。这能有效防止**空条目** 进入列表。
	- `s.strip() + '。'`：这是映射操作。对于通过了过滤器的**非空**字符串 `s`，它首先被 `.strip()` 清理，然后使用字符串**连接**操作，将作为分隔符的“。”重新追加回句末。这对于保留句子的原始结构至关重要。
* `chunks.append(''.join(current_chunk))`：
	* `current_chunk` 是一个**字符串列表**（比如 `['你好。', '我很好。']`）。
	- `''.join(iterable)` 是一个**字符串方法**，它以调用它的字符串（这里是 `''`，一个空字符串）作为**连接符**，将 `iterable`（可迭代对象，这里是 `current_chunk` 列表）中的所有元素**连接** 成一个**单一的字符串**。
	- 结果（比如 `'你好。我很好。'`）被 `append` **方法**添加到了 `chunks` 列表中，作为一个**完整的块**。”

![[SemanticChunker.excalidraw.png]]

#### RecursiveCharacterTextSplitter 递归分块

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

# 创建文本分割器
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,        # 每块的目标大小
    chunk_overlap=200,      # 块之间的重叠
    length_function=len,    # 长度计算函数
    separators=[            # 分隔符优先级
        "\n\n",             # 段落
        "\n",               # 行
        " ",                # 单词
        ""                  # 字符
    ]
)

# 示例文档
document = """
# Python编程基础

## 变量和数据类型

Python是一种动态类型语言，这意味着你不需要声明变量的类型。
Python支持多种数据类型，包括整数、浮点数、字符串等。

## 控制流

Python使用缩进来定义代码块。
if语句用于条件判断，for循环用于迭代。

## 函数

函数是可重用的代码块。
使用def关键字定义函数。
"""

# 分块
chunks = text_splitter.split_text(document)

print(f"文档被分成 {len(chunks)} 块")
for i, chunk in enumerate(chunks):
    print(f"\n块 {i+1}:")
    print(chunk[:100] + "...")
```

* 这一段代码的核心分块策略是：递归分块。
	* `separators=[ "\n\n", "\n", " ", "" ]`：表示分块优先级从段、单行、空格（单词）、字符分。意思是，若一段中少于1000个字，则这一段完整的分割下来；若是这一段大于1000字，则不能完整的分割下来，而是试着对行分，若一行没超过1000字，则按行分。反之继续按词分。

## 多向量索引 Multi-Vector Indexing

核心思想：为单个文档生成多个向量，每个向量代表文档的不同方面或部分，这样可以更全面的表示文档的语义。

### 对原文档分割成更小块

```python
from langchain.retrievers.multi_vector import MultiVectorRetriever  
from langchain.storage import InMemoryStore  
from langchain_openai import OpenAIEmbeddings  
from langchain.vectorstores import Chroma  
from langchain.schema import Document  
import uuid  
  
  
class MultiVectorIndexer:  
    """多向量索引器"""  
  
    def __init__(self, embeddings):  
        self.embeddings = embeddings  
  
        # 向量存储：存储小块的向量  
        self.vectorstore = Chroma(  
            collection_name="multi_vector",  
            embedding_function=embeddings  
        )  
  
        # 文档存储：存储完整文档  
        self.docstore = InMemoryStore() # InMemoryStore为简单的内存存储  
  
        # 多向量检索器  
        self.retriever = MultiVectorRetriever(  
            vectorstore=self.vectorstore, # 向量存储  
            docstore=self.docstore, # 文档存储  
            id_key="doc_id"  # 用于关联向量和文档的键  
        )  
  
    def index_documents(self, documents: List[str], doc_ids: List[str] = None):  
        """索引文档（为每个文档创建多个向量）"""  
        if doc_ids is None:  
            doc_ids = [str(uuid.uuid4()) for _ in documents] # uuid生成唯一文档ID  
  
        # 1. 存储完整文档  
        for doc_id, doc in zip(doc_ids, documents):  
            self.docstore.mset([(doc_id, doc)]) # mset将doc_id和doc按键值对存储到docstore中  
  
        # 2. 将每个文档分成小块  
        text_splitter = RecursiveCharacterTextSplitter(  
            chunk_size=400,  
            chunk_overlap=50  
        )  
  
        sub_docs = []  
        for doc_id, doc in zip(doc_ids, documents):  
            chunks = text_splitter.split_text(doc)  
  
            # 为每个小块创建Document对象，关联到父文档ID  
            for chunk in chunks:  
                sub_docs.append(  
                    Document(  
                        page_content=chunk,  
                        metadata={"doc_id": doc_id}  
                    )  
                )  
  
        # 3. 将小块向量化并存储  
        self.vectorstore.add_documents(sub_docs)  
  
        print(f"✅ 索引了 {len(documents)} 个文档，生成 {len(sub_docs)} 个向量")  
  
    def retrieve(self, query: str, k: int = 4):  
        """检索文档"""  
        # 检索小块，返回完整文档  
        docs = self.retriever.get_relevant_documents(query, k=k)  
        return docs  
  
  
# 使用示例  
embeddings = OpenAIEmbeddings()  
multi_indexer = MultiVectorIndexer(embeddings)  
  
# 准备文档  
documents = [  
    """  
    Python编程基础教程  
  
    第一章：变量和数据类型  
    Python是动态类型语言，支持整数、浮点数、字符串等多种数据类型。  
  
    第二章：控制流  
    Python使用if、for、while等关键字进行流程控制。  
  
    第三章：函数    函数是可重用的代码块，使用def关键字定义。  
    """,  
  
    """  
    机器学习入门  
  
    监督学习：使用标记数据训练模型。    无监督学习：从无标记数据中发现模式。    强化学习：通过奖励机制学习最优策略。  
    """]  
  
# 索引文档  
multi_indexer.index_documents(documents)  
  
# 检索  
results = multi_indexer.retrieve("什么是函数？", k=2)  
  
print("\n检索结果:")  
for i, doc in enumerate(results):  
    print(f"\n文档 {i + 1}:")  
    print(doc.page_content[:200] + "...")
```

* `self.retriever = MultiVectorRetriever()`：创建一个多向量检索器
	* `vectorstore`：被指定为**搜索**的入口（它在**向量空间**中搜索）。
    * `docstore`：被指定为**查找**的仓库（它在**键空间**中查找）。
    * `id_key="doc_id"`：这是一个**关键配置**。它告诉检索器，在从 `vectorstore` 找到的**子文档**（小块）的**元数据**中，应该查找哪个‘键’（`doc_id`）来获取父文档的标识符。”
* `self.docstore.mset([(doc_id, doc)])`：`mset`将`doc_id`和`doc`按键值对存储到`docstore`中。

### 原文摘要向量+原文

```python
from langchain_openai import ChatOpenAI  
  
  
class SummaryMultiVectorIndexer:  
    """使用摘要作为向量，但返回原文"""  
  
    def __init__(self, embeddings, llm):  
        self.embeddings = embeddings  
        self.llm = llm  
  
        self.vectorstore = Chroma(  
            collection_name="summary_vectors",  
            embedding_function=embeddings  
        )  
  
        self.docstore = InMemoryStore()  
  
        self.retriever = MultiVectorRetriever(  
            vectorstore=self.vectorstore,  
            docstore=self.docstore,  
            id_key="doc_id"  
        )  
  
    def _generate_summary(self, text: str) -> str:  
        """生成文档摘要"""  
        from langchain_core.prompts import PromptTemplate  
  
        prompt = PromptTemplate(  
            input_variables=["text"],  
            template="请用一段话总结以下内容:\n\n{text}\n\n摘要:"  
        )  
  
        chain = prompt | self.llm  
        summary = chain.invoke({"text": text})  
  
        return summary.strip() # 去掉多余空白  
  
    def index_documents(self, documents: List[str]):  
        """索引文档：生成摘要向量，保存原文"""  
        doc_ids = [str(uuid.uuid4()) for _ in documents]  
  
        # 1. 存储完整文档  
        for doc_id, doc in zip(doc_ids, documents):  
            self.docstore.mset([(doc_id, doc)])  
  
        # 2. 生成摘要并创建向量  
        summaries = []  
        for doc_id, doc in zip(doc_ids, documents):  
            summary = self._generate_summary(doc)  
  
            summaries.append(  
                Document(  
                    page_content=summary,  
                    metadata={"doc_id": doc_id}  
                )  
            )  
  
            print(f"📝 文档摘要: {summary[:100]}...")  
  
        # 3. 存储摘要向量  
        self.vectorstore.add_documents(summaries)  
  
        print(f"✅ 索引了 {len(documents)} 个文档")  
  
    def retrieve(self, query: str, k: int = 3):  
        """检索：用摘要向量搜索，返回原文"""  
        docs = self.retriever.get_relevant_documents(query, k=k)  
        return docs  
  
  
# 使用示例  
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)  
summary_indexer = SummaryMultiVectorIndexer(embeddings, llm)  
  
# 索引（会生成摘要）  
summary_indexer.index_documents(documents)  
  
# 检索（搜索摘要，返回原文）  
results = summary_indexer.retrieve("Python的控制流语句", k=1)  
  
print("\n检索到的完整文档:")  
print(results[0].page_content)
```