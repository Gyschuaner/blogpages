---
title: RAG 检索增强生成
date: 2025-11-15
---

## What is RAG?

RAG（Retrieval Augmented Generation，检索增强生成），是一种结合了信息检索和文本生成的技术。

## 传统LLM的局限性，Why RAG？

当通用LLM被训练完成后，它通常会出现两个缺陷：
* 知识截止日期：截止到训练数据的日期
* 领域专业知识的缺乏

## How RAG?

RAG的核心思想是在回答问题前，先从专有知识库中检索相关信息，然后让LLM根据这些信息回答。

## RAG架构

![[Pasted image 20251104155311.png]]
一个完整的RAG系统由三个阶段构成：
* 索引阶段（indexing）
  目标：准备知识库，将文档转换为可搜索的向量格式
  步骤：文档加载->文本分块->向量化->存储
* 检索阶段（Retrieval）
  目标：根据用户查询找到最相关的文档片段（chunk）
  步骤：查询向量化->相似度计算->结果排序
* 生成阶段（Generation）
  目标：基于检索到的信息生成准确答案
  步骤：构建提示词->LLM生成->答案返回


## 从零开始构建一个检索增强生成系统

### 1 环境准备

```python
import os  
  
from astropy.table.notebook_backends import classic  
from dotenv import load_dotenv  
  
# 加载环境变量  
load_dotenv()  
  
# 导入LangChain核心组件  
from langchain_openai import ChatOpenAI, OpenAIEmbeddings # 语言模型和嵌入模型  
from langchain_community.vectorstores import Chroma # 矢量数据库  
from langchain_community.document_loaders import WebBaseLoader # 文档加载器  
from langchain_text_splitters import RecursiveCharacterTextSplitter # 文本分割器  
from langchain_classic.chains import RetrievalQA # 检索问答链  
from langchain_core.prompts import ChatPromptTemplate # 提示模板
```

导入必要的库，并且创建.env文件，里面配置环境变量如base_url、api_key等

### 2 索引Indexing

索引部分是RAG的基础，我们会将原始文档转换为LLM可以理解可以搜索的格式，构建一个完整的知识库

#### 加载文档

这里我们使用`langchain_community.document_loaders`。LangChain支持多种文档源
```python
from langchain_community.document_loaders import (  
    WebBaseLoader, # 网页  
    PyPDFLoader, # PDF  
    TextLoader, # 文本文件  
    DirectoryLoader, # 目录  
    CSVLoader, # CSV文件  
    UnstructuredWordDocumentLoader, # Word文档  
    UnstructuredMarkdownLoader, # Markdown文件  
    JSONLoader # JSON文件  
)
  
# 示例：加载网页  
loader = WebBaseLoader("https://lilianweng.github.io/posts/2023-06-23-agent/")  
docs = loader.load()  # .load() 方法返回一个包含文档的列表
  
print(f"加载了 {len(docs)} 个文档")  
print(f"第一个文档长度: {len(docs[0].page_content)} 字符")
```
运行结果：
![[Pasted image 20251104193153.png]]
#### 文本分块

文本分块有助于：
* 提高检索的精度，避免不需要的信息
* 降低成本：只检索处理相关部分
* 减少token消耗，匹配LLM的token限制
```python
# 文本分块  
text_splitter = RecursiveCharacterTextSplitter(  
    chunk_size=1000, # 每个块的最大字符数  
    chunk_overlap=200, # 块之间的重叠字符数  
    separators=["\n\n", "\n", " ", ""], # 优先按段落分割，段落>行>空格>字符  
    length_function = len,  # 长度计算函数  
    is_separator_regex = False, # 分隔符不是正则表达式  
)  
  
splits = text_splitter.split_documents(docs)  
  
print(f"原始文档: {len(docs)} 个")  
print(f"分块后: {len(splits)} 个")  
print(f"\n第一个分块示例:\n{splits[0].page_content[:200]}...")
```

#### 向量化

将文本转换为数学向量，这里我们使用免费的all-MiniLM-L6-v2模型，它可以将词嵌入到一个384维的向量，这里需要库`langchain_huggingface`
```python
# 嵌入模型 使用all-MiniLM-L6-v2  
from langchain_huggingface.embeddings import HuggingFaceEmbeddings  
embedding_model = HuggingFaceEmbeddings(model='all-MiniLM-L6-v2') # 加载预训练模型，模型在文件夹下
text = "RAG是一种强大的AI技术"  
vector = embedding_model.encode(text)  
print(f"文本: {text}")  
print(f"向量维度: {len(vector)}")  
print(f"向量前5个值: {vector[:5]}")
```
运行结果![[Pasted image 20251104201918.png]]
#### 储存向量

将向量化后的文档永久的储存在本地数据库中
```python
# 存储向量到Chroma矢量数据库  
vectorstore = Chroma.from_documents(  
    documents=splits, # 文档块  
    embedding=embedding_model, # 嵌入模型  
    persist_directory="./chroma_db", # 持久化存储目录  
)  
  
print(f"✅ 向量数据库创建成功！")  
print(f"   存储了 {len(splits)} 个文档块")  
print(f"   持久化路径: ./chroma_db")
```
运行结果
![[Pasted image 20251104210045.png]]
完整索引流程代码
```python
from langchain_huggingface.embeddings import HuggingFaceEmbeddings  
# 完整索引流程代码  
def create_vectorstore(url: str, chunk_size: int = 1000, chunk_overlap: int = 200, persist_directory: str = "./chroma_db"):  
    # 加载文档  
    loader = WebBaseLoader(url)  
    docs = loader.load()  
  
    # 文本分块  
    text_splitter = RecursiveCharacterTextSplitter(  
        chunk_size=chunk_size,  
        chunk_overlap=chunk_overlap,  
        separators=["\n\n", "\n", " ", ""],  
        length_function = len,  
        is_separator_regex = False,  
    )  
    splits = text_splitter.split_documents(docs)  
  
    # 嵌入模型  
    embedding_model = HuggingFaceEmbeddings(model='all-MiniLM-L6-v2')  
  
    # 创建向量数据库  
    vectorstore = Chroma.from_documents(  
        documents=splits,  
        embedding=embedding_model,  
        persist_directory=persist_directory,  
    )  
  
    return vectorstore
```

### 3 检索

#### 相似度检索

相似度检索有很多判别相似度的方式，如similarity相似度、mmr最大边际相关性、similarity_score_threshold相似度阈值，亦可自定义检索方法。

**基础检索**
```python
# 创建检索器
retriever = vectorstore.as_retriever(
    search_type="similarity",  # 相似度搜索
    search_kwargs={"k": 3}     # 返回前3个结果
)

# 执行检索
query = "什么是Agent？"
docs = retriever.get_relevant_documents(query)

# 查看结果
for i, doc in enumerate(docs, 1):
    print(f"\n📄 结果 {{i}}:")
    print(f"内容: {doc.page_content[:200]}...")
    print(f"来源: {doc.metadata.get('source', 'N/A')}")
```

**检索函数**
```python
# 创建检索器  
def create_retriever(vectorstore, k: int = 4):  
    retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": k})  
    return retriever
```

这里使用的是相似度策略，返回前`k=4`个相似度最高的结果。

**检索策略对比**

| 策略        | 优势   | 劣势     | 使用场景      |
| --------- | ---- | ------ | --------- |
| Similarty | 简单快速 | 可能重复   | 默认选择      |
| MMR       | 结果多样 | 稍慢     | 需要不同角度的信息 |
| Thershold | 质量保证 | 可能没有结果 | 严格匹配需求    |
### 4 生成

基于检索到的文档，让LLM生成答案

```python
# llm使用本地的qwen3:4b  
llm = ChatOpenAI(  
    model="qwen3:4b",  
    api_key=os.getenv("OPENAI_API_KEY"),  
    base_url=os.getenv("OPENAI_API_URL"),  
    temperature=0,  
    max_tokens=1000  
)

# 创建检索问答链  
qa_chain = RetrievalQA.from_chain_type(  
    llm=llm,  
    chain_type="stuff", # 将所有文档"填充"到提示词中  
    retriever=retriever,  
    return_source_documents=True # 返回源文档  
)  
  
# 提问  
query = "什么是Agent？它有什么能力？"  
result = qa_chain({"query": query})  
print("问题:", result["query"])  
print("\n答案:", result["result"])  
print("\n来源文档数量:", len(result["source_documents"]))
```

LangChain一共提供了4中不同的链类型来处理检索到的文档
* `stuff`：填充，直接所有放入prompt中
* `map_reduce`：适合处理大量文档，分为两个阶段
	* ①Map阶段：LLM对每个文档分别提问。
	* ②Reduce阶段：合并所有部分答案，通过LLM生成最终答案。
* `refine`：迭代改进答案。LLM对文档1提问，生成初始答案；用初始答案和文档2一起，用LLM提问生成改进答案，以此类推，生成最终答案。
* `map_rerank`：找最匹配答案。LLM通过每个文档提问，得到不同的答案，之后通过计算置信度，取最高置信度的答案。

运行结果
![[Pasted image 20251104223150.png]]

### 自定义提示词

要用到`PromptTemplate`这个函数。
```python
from langchain_core.prompts import PromptTemplate

# 定义自定义提示词
template = """你是一个AI助手，请基于以下文档回答问题。

要求：
1. 只使用提供的文档内容
2. 如果文档中没有相关信息，明确说明
3. 引用具体的文档片段
4. 用简洁清晰的语言回答

文档：
{{context}}

问题：{{question}}

答案："""

prompt = PromptTemplate(
    template=template,
    input_variables=["context", "question"]
)

# 使用自定义提示词
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=retriever,
    chain_type_kwargs={"prompt": prompt}
)
```

### 流式输出

需要用到`StreamingStdOutCallbackHandler`
直接在创建llm的地方加入一个参数`callbacks=[StreamingStdOutCallbackHandler()]`即可。

## 完整代码 简易RAG
```python
import os  
from dotenv import load_dotenv  
# 导入LangChain核心组件  
from anaconda_navigator.api.external_apps.bundle.installers import retrieve  
from langchain_openai import ChatOpenAI, OpenAIEmbeddings # 语言模型和嵌入模型  
from langchain_community.vectorstores import Chroma # 矢量数据库  
from langchain_community.document_loaders import WebBaseLoader # 文档加载器  
from langchain_text_splitters import RecursiveCharacterTextSplitter # 文本分割器  
from langchain_classic.chains import RetrievalQA # 检索问答链  
from langchain_core.prompts import ChatPromptTemplate # 提示模板  
from langchain_huggingface.embeddings import HuggingFaceEmbeddings  
  
load_dotenv()  
  
class RAGSystem:  
    def __init__(self, urls: list[str], model: str = "all-MiniLM-L6-v2"):  
        """  
        初始化RAG系统  
        :param urls:要加载的网页URL列表  
        :param model:要使用的模型  
        """        self.urls = urls  
        self.model = model  
        self.vectorstore = None  
        self.qa_chain = None  
  
    def build_index(self, chunk_size: int = 1000):  
        """  
        构建向量索引  
        :param chunk_size:对文本分块的大小  
        """        # 加载文档  
        all_docs = []  
        for url in self.urls:  
            loader = WebBaseLoader(url)  
            docs = loader.load()  
            all_docs.extend(docs)  
        print("加载了 {} 个文档".format(len(all_docs)))  
  
        # 文本分块  
        text_splitter = RecursiveCharacterTextSplitter(  
            chunk_size=chunk_size,  
            chunk_overlap=int(chunk_size*0.1)  
        )  
        splits = text_splitter.split_documents(all_docs)  
        print("分块后: {} 个".format(len(splits)))  
  
        # 创建向量库  
        self.vectorstore = Chroma.from_documents(  
            documents=splits,  
            embedding=HuggingFaceEmbeddings(model_name=self.model)  
        )  
        print("向量索引构建完成")  
  
    def setup_qa_chain(self, search_type: str = "similarity", k: int = 3):  
        """  
        设置检索问答链  
        :param search_type:检索类型，similarity或mmr  
        :param k:返回的文档数量  
        """        if self.vectorstore is None:  
            raise ValueError("请先构建向量索引")  
  
        # 创建检索器  
        retriever = self.vectorstore.as_retriever(  
            search_type=search_type,  
            search_kwargs={"k": k}  
        )  
  
        # llm使用本地的qwen3:4b  
        llm = ChatOpenAI(  
            model="qwen3:4b",  
            api_key=os.getenv("LLM_API_KEY"),  
            base_url=os.getenv("LLM_BASE_URL"),  
            temperature=0,  
            max_tokens= 1000  
        )  
        # 创建问答链  
        self.qa_chain = RetrievalQA.from_chain_type(  
            llm = llm,  
            chain_type="stuff",  
            retriever=retriever,  
            return_source_documents=True  
        )  
        print("检索问答链设置完成")  
  
    def query(self, question: str, show_sources: bool = True) -> str:  
        """  
        进行查询  
        :param question:用户问题  
        :param show_sources:是否返回源文档  
        :return:回答和源文档（如果return_sources为True）  
        """        if self.qa_chain is None:  
            raise ValueError("请先设置检索问答链")  
  
        result = self.qa_chain({"query": question})  
        answer = result["result"]  
  
        if show_sources:  
            sources = [doc.metadata.get("source", "N/A") for doc in result["source_documents"]]  
  
        unique_sources = list(set(sources)) # 去重  
        answer += f"\n\n来源文档:{',' .join(unique_sources)}"  
  
        return answer  
  
# 使用实例  
if __name__ == "__main__":  
    rag = RAGSystem(  
        urls=["https://lilianweng.github.io/posts/2023-06-23-agent/",  
             "https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/"  
    ])  
    rag.build_index(chunk_size=1000)  
    rag.setup_qa_chain(search_type="mmr", k=5)  
    response = rag.query("什么是Agent？", show_sources=True)  
    print(response)
```

*****
## 性能优化技巧

### 缓存嵌入结果

```python
from langchain.embeddings import CacheBackedEmbeddings
from langchain.storage import LocalFileStore

# 创建缓存存储
store = LocalFileStore("./embedding_cache")

# 包装嵌入模型
cached_embeddings = CacheBackedEmbeddings.from_bytes_store(
    underlying_embeddings=OpenAIEmbeddings(),
    document_embedding_cache=store,
    namespace="openai_embeddings"
)

# 使用缓存的嵌入
vectorstore = Chroma.from_documents(
    documents=splits,
    embedding=cached_embeddings
)
```

* 这段代码的目的就是**省钱和加速**。
* 它通过建立一个本地缓存（`embedding_cache` 文件夹），让你**第一次运行时**会正常调用 API 并保存结果，但从**第二次运行开始**，只要文档内容不变，它就会直接从本地硬盘读取结果。
* 传统的`embedding`阶段，当原始文档有改动时，就要重新将所有文档编码，再组成vector_store。而缓存嵌入结果则是创建一个`cached_embedding`助手，将之前编码过的split记录下来，下一次遇到一模一样的就不会再翻译，而是直接去储存的地址拿；遇到没见过的时，就会去求助编码模型去编码新的内容。![[Pasted image 20251108194011.png]]

### 批量处理

```python
# 批量嵌入（更快）
embeddings.embed_documents([doc.page_content for doc in splits])

# vs 逐个嵌入（慢）
for doc in splits:
    embeddings.embed_query(doc.page_content)
```

### 异步处理

这个优化是针对一个或多个用户提了多个问题，减少回答问题的时间，可以做到一次回答多个问题。

```python
import asyncio
from langchain.schema import Document

async def async_rag_query(question: str):
    """异步RAG查询"""
    # 异步检索
    docs = await vectorstore.asimilarity_search(question, k=3)
    
    # 异步生成
    response = await llm.apredict(
        f"基于以下文档回答问题：\n{{docs}}\n\n问题：{{question}}"
    )
    
    return response

# 并发查询多个问题
questions = ["问题1", "问题2", "问题3"]
answers = await asyncio.gather(*[async_rag_query(q) for q in questions])
```

* `import asyncio`导入异步处理的库
* `async def async_rag_query(question: str):`中的`async def`和`def`不一样，`async def`表示定义一个异步协程，可以理解为定义一个“可以被暂停和恢复的任务”。
* `await`只能在`async def`中使用，表示程序可以在这里等待。
* `asimilarity_search`和`apredict`是`similarity`和`predict`的异步版本。
* `await asyncio.gather(*[async_rag_query(q) for q in questions])`
	* 首先，`[async_rag_query(q) for q in questions]`会生成`[async_rag_query("问题1"), async_rag_query("问题2"), async_rag_query("问题3")]`
	* 之后，`asyncio.gather(*[...])`表示解包列表，这就变成了`asyncio.gather(任务1, 任务2, 任务3)`。

### 选择合适的向量数据库

```python
# 小规模（<100K文档）：Chroma（嵌入式）
vectorstore = Chroma(...)

# 中规模（100K-1M文档）：Pinecone（云服务）
from langchain_pinecone import Pinecone
vectorstore = Pinecone(...)

# 大规模（>1M文档）：Weaviate（自建）
from langchain_weaviate import Weaviate
vectorstore = Weaviate(...)
```

下面是这三种向量数据库的

|**特性**|**🧠 Chroma (记事本)**|**☁️ Pinecone (云托管)**|**🏗️ Weaviate (自建宫殿)**|
|---|---|---|---|
|**部署方式**|嵌入式 (本地文件)|云服务 (SaaS)|自建 (Docker / K8s) *|
|**启动难度**|⭐️ (极简单)|⭐️⭐️ (简单, 需注册)|⭐️⭐️⭐️⭐️⭐️ (非常复杂)|
|**运维难度**|零 (无运维)|零 (全托管)|极高 (需要专业团队)|
|**扩展性**|低 (受限于单机)|高 (按需付费)|极高 (受限于你的预算)|
|**数据位置**|**本地** (隐私性最好)|**云端** (隐私性需考虑)|**自有服务器** (隐私性好)|
|**最佳场景**|开发、原型、个人项目|中型项目、生产环境|大型企业、超大规模、数据敏感|