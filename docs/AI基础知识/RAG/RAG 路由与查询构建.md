---
title: RAG 路由与查询构建
date: 2025-11-15
---

当面对多个数据源或要结构化查询时，如何智能地选择合适的数据源和构建合适的查询，这是这篇笔记想要探讨的内容

### 实际场景中的例子

多个数据源
```
# 场景1: 多个数据源

数据源1: 技术文档数据库
数据源2: 用户手册数据库  
数据源3: FAQ知识库
数据源4: API参考文档

用户查询: "如何使用Python SDK连接数据库？"

# 应该查询哪个数据源？
→ 单一数据源可能不够
→ 查询所有数据源效率低
→ 需要智能路由机制
```

结构化查询
```
# 场景2: 复杂查询条件

向量数据库包含:
- 文档内容 (embedding)
- 元数据: 
  - 作者
  - 发布日期
  - 文档类型
  - 标签

用户查询: "找出2023年发布的关于机器学习的文章"

# 需要同时考虑:
→ 语义相似度 (机器学习)
→ 结构化条件 (日期 >= 2023-01-01)
→ 需要查询构建技术
```

## 1 逻辑路由 Logical Routing

逻辑路由使用**基于规则**的方法来决定将查询发送到哪个数据源。它通过LLM理解查询内容，然后根据预定义的规则选择合适的数据源。

### 工作原理

![[Logical Routing1.excalidraw.png]]

### 代码实现-简单测试调用数据源

```python
from langchain_openai import ChatOpenAI  
from langchain_core.prompts import ChatPromptTemplate  
from langchain_core.output_parsers import StrOutputParser  
from typing import Literal  
  
import os  
from dotenv import load_dotenv  
  
# 加载环境变量  
load_dotenv()  
  
# 定义路由提示词  
route_prompt = ChatPromptTemplate.from_messages([  
    ("system", """你是一个路由助手，负责将用户查询发送到正确的数据源。  
可用的数据源:  
- python_docs: Python编程相关的技术文档  
- web_search: 需要实时信息或一般性问题  
- database: 数据库相关的查询  
请分析用户查询，返回最合适的数据源名称(只返回名称，不要其他内容)。"""),  
    ("human", "{question}")  
])  
  
# 定义模型  
llm = ChatOpenAI(  
    model="qwen3:4b",  
    api_key=os.getenv("LLM_API_KEY"),  
    base_url=os.getenv("LLM_BASE_URL"),  
    temperature=0,  
)  
  
# 创建路由链  
route_chain = route_prompt| llm | StrOutputParser()  
  
# 测试路由链  
question1 = "如何在Python中创建虚拟环境？"  
route1 = route_chain.invoke({"question": question1})  
print(f"查询: {question1}\n路由到: {route1}\n")  
  
question2 = "最新的AI技术发展趋势是什么？"  
route2 = route_chain.invoke({"question": question2})  
print(f"查询: {question2}\n路由到: {route2}\n")
```

#### output
```
查询: 如何在Python中创建虚拟环境？
路由到: python_docs

查询: 最新的AI技术发展趋势是什么？
路由到: web_search
```

### 代码完整实现

```python
from langchain_core.runnables import RunnableLambda
from langchain.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

class LogicalRouter:
    """逻辑路由器"""
    
    def __init__(self, llm):
        self.llm = llm
        self.routes = {}
        self.route_chain = self._create_route_chain()
    
    def add_route(self, name: str, retriever):
        """添加路由"""
        self.routes[name] = retriever
        
    def _create_route_chain(self):
        """创建路由链"""
        route_prompt = ChatPromptTemplate.from_messages([
            ("system", """基于以下数据源描述，选择最合适的数据源:

{route_descriptions}

只返回数据源名称。"""),
            ("human", "{question}")
        ])
        
        return route_prompt | self.llm | StrOutputParser()
    
    def _get_route_descriptions(self) -> str:
        """获取路由描述"""
        descriptions = []
        for name, retriever in self.routes.items():
            desc = getattr(retriever, 'description', f'{name}数据源')
            descriptions.append(f"- {name}: {desc}")
        return "\n".join(descriptions)
    
    def route(self, question: str):
        """执行路由"""
        # 获取路由决策
        route_descriptions = self._get_route_descriptions()
        route_name = self.route_chain.invoke({
            "question": question,
            "route_descriptions": route_descriptions
        }).strip()
        
        # 清理路由名称，这里只找一个route
        route_name = route_name.lower().strip()
        
        # 检查路由是否存在
        if route_name not in self.routes:
            # 尝试模糊匹配
            for name in self.routes.keys():
                if name in route_name or route_name in name:
                    route_name = name
                    break
            else:
                raise ValueError(f"未找到路由: {route_name}")
        
        return route_name, self.routes[route_name]
    
    def query(self, question: str):
        """执行完整查询"""
        # 路由到正确的数据源
        route_name, retriever = self.route(question)
        print(f"📍 路由到: {route_name}")
        
        # 执行检索
        docs = retriever.get_relevant_documents(question)
        
        return {
            "route": route_name,
            "documents": docs,
            "question": question
        }

# 使用示例
embeddings = OpenAIEmbeddings()

# 创建不同的向量存储
python_docs = Chroma(
    collection_name="python_docs",
    embedding_function=embeddings
)
python_docs.description = "Python编程语言的官方文档"

web_docs = Chroma(
    collection_name="web_search",
    embedding_function=embeddings
)
web_docs.description = "实时网络搜索结果和一般性知识"

# 创建路由器
router = LogicalRouter(llm)
router.add_route("python_docs", python_docs.as_retriever())
router.add_route("web_search", web_docs.as_retriever())

# 测试路由
result = router.query("如何在Python中处理异常？")
print(f"找到 {len(result['documents'])} 个文档")
```

* `self.routes = {}`：`self.routes`被初始化为一个空**字典 (Dictionary)**，它将用作一个**映射 (Map)**，存储‘路由名称’（`name`，字符串）到‘检索器对象’（`retriever`）的对应关系。
* `self.route_chain = self._create_route_chain()`：它在构造函数中立即调用另一个“私有”方法 `_create_route_chain()`，用于**预先构建 (Pre-build)** 那个专门负责“路由决策”的 **LCEL (LangChain 表达式语言) 链**。
* `def add_route(self, name: str, retriever):`：这是一个**公共配置方法 (Public Configuration Method)**。它允许外部调用者向 `LogicalRouter` **注册**新的路由，即**填充 (Populate)** `self.routes` 字典。
* `def _get_route_descriptions(self) -> str:`：这是一个**私有辅助方法 (Private Helper Method)**。它**迭代** `self.routes` 字典，并使用 `getattr` 函数**安全地**（带默认值）获取每个 `retriever` 对象的 `description` **属性 (Attribute)**。这个 `description` **元数据 (Metadata)** 是路由决策的关键依据。
* `def route(self, question: str):`：这是一个核心的**路由方法**。它编排了“决定”路由的完整逻辑。
	* `route_name = self.route_chain.invoke(...)`：**执行路由链 (Chain Invocation)**。这里调用了预先构建的 `route_chain`，将_动态生成_的 `route_descriptions` 和当前的 `question` **注入 (Inject)** 到提示模板中。LLM 的输出（一个字符串）被捕获为 `route_name`。
	* `return route_name, self.routes[route_name]`：**返回结果**。该方法返回一个**元组 (Tuple)**，包含被选中的`route_name`（字符串，用于日志/调试）和`retriever`（**对象引用**，用于后续执行）。
* `router.add_route("python_docs", python_docs.as_retriever())`：加入路由。

#### 具体流程

![[Logical Routing2.excalidraw.png]]

#### 常见问题

1.如果说可以选择数据源，那是不是一定要多个Vectorstore？
   
答：不是。
在多数据源的情况下Vectorstore有两种方案

**多Vectorstore**：`LogicalRouter` 在**多个 `retriever` 对象**之间选择。
```python
# 接待员的名录：
self.routes = {
  "python": python_retriever,  # 指向“Python楼”
  "web": web_retriever       # 指向“Web楼”
}
# 接待员的指路结果：
return self.routes["python"]
```

**单Vectorstore**：`LogicalRouter` **选择** `filter` **参数**，用在同一个 `retriever` 上。
```python
# 接待员的名录：
self.filters = {
  "python": {"source": "python"},  # 指向“Python货架”的标签
  "web": {"source": "web"}       # 指向“Web货架”的标签
}

# 接待员的指路结果：
selected_filter = self.filters["python"]

# 客户（你）必须拿着这个“标签”，去找“沃尔玛”的“总管理员”
docs = giant_store.as_retriever(
    search_kwargs={"filter": selected_filter}
).get_relevant_documents(question)
```

## 2 语义路由 Semantic Routing

语义路由使用**嵌入向量**来路由查询。它为每个路由创建描述性文本的嵌入，然后将查询嵌入与路由嵌入进行相似度比较。

#### 完整代码

```python
from langchain_openai import OpenAIEmbeddings
import numpy as np
from typing import Dict, List, Tuple

class SemanticRouter:
    """语义路由器"""
    
    def __init__(self, embeddings):
        self.embeddings = embeddings
        self.routes = {}
        self.route_embeddings = {}
    
    def add_route(self, name: str, description: str, retriever):
        """添加路由
        
        Args:
            name: 路由名称
            description: 路由描述（将被嵌入）
            retriever: 检索器
        """
        self.routes[name] = {
            'description': description,
            'retriever': retriever
        }
        
        # 计算描述的嵌入
        self.route_embeddings[name] = self.embeddings.embed_query(description)
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """计算余弦相似度"""
        vec1 = np.array(vec1)
        vec2 = np.array(vec2)
        
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        return dot_product / (norm1 * norm2)
    
    def route(self, question: str, threshold: float = 0.7) -> Tuple[str, float]:
        """执行语义路由
        
        Args:
            question: 用户查询
            threshold: 相似度阈值
            
        Returns:
            (路由名称, 相似度分数)
        """
        # 计算查询嵌入
        query_embedding = self.embeddings.embed_query(question)
        
        # 计算与所有路由的相似度
        similarities = {}
        for name, route_embedding in self.route_embeddings.items():
            similarity = self._cosine_similarity(query_embedding, route_embedding)
            similarities[name] = similarity
        
        # 找到最相似的路由
        best_route = max(similarities, key=similarities.get)
        best_score = similarities[best_route]
        
        # 检查阈值
        if best_score < threshold:
            print(f"⚠️ 最佳路由分数 {best_score:.3f} 低于阈值 {threshold}")
        
        return best_route, best_score
    
    def route_with_scores(self, question: str) -> Dict[str, float]:
        """返回所有路由及其分数"""
        query_embedding = self.embeddings.embed_query(question)
        
        similarities = {}
        for name, route_embedding in self.route_embeddings.items():
            similarity = self._cosine_similarity(query_embedding, route_embedding)
            similarities[name] = similarity
        
        # 按分数排序
        return dict(sorted(similarities.items(), key=lambda x: x[1], reverse=True))
    
    def query(self, question: str):
        """执行完整查询"""
        # 路由
        route_name, score = self.route(question)
        print(f"📍 路由到: {route_name} (相似度: {score:.3f})")
        
        # 检索
        retriever = self.routes[route_name]['retriever']
        docs = retriever.get_relevant_documents(question)
        
        return {
            "route": route_name,
            "score": score,
            "documents": docs,
            "question": question
        }

# 使用示例
embeddings = OpenAIEmbeddings()

# 创建语义路由器
semantic_router = SemanticRouter(embeddings)

# 添加路由
semantic_router.add_route(
    name="python_programming",
    description="Python编程语言，包括语法、数据结构、函数、类、模块等",
    retriever=python_docs.as_retriever()
)

semantic_router.add_route(
    name="machine_learning",
    description="机器学习、深度学习、神经网络、模型训练、数据科学",
    retriever=ml_docs.as_retriever()
)

semantic_router.add_route(
    name="web_development",
    description="Web开发、前端、后端、API、数据库、服务器",
    retriever=web_docs.as_retriever()
)

# 测试路由
result = semantic_router.query("如何训练一个神经网络？")

# 查看所有路由得分
scores = semantic_router.route_with_scores("如何训练一个神经网络？")
print("\n所有路由得分:")
for route, score in scores.items():
    print(f"  {route}: {score:.3f}")
```

#### 流程示意

![[Semantic Router.excalidraw.png]]

#### 混合路由器

在语义路由匹配的分数过低时（未达到最低阈值），可以切换为逻辑路由。即语义路由为主，逻辑路由为备用。


# 3 查询构建 Query Construction

查询构建是将自然语言查询转换为**结构化查询**的过程。它允许我们结合**语义搜索**和**结构化过滤。**

![[Query Construction1.excalidraw.png]]

#### 完整代码 基础版默认AND

```python
from typing import Dict, Any, Optional  
from langchain_core.prompts import ChatPromptTemplate  
from langchain_openai import ChatOpenAI  
import os  
from dotenv import load_dotenv  
# 加载环境变量  
load_dotenv()  
  
  
class QueryConstructor:  
    """查询构建器"""  
  
    def __init__(self, llm):  
        self.llm = llm  
        self.prompt = self._create_prompt()  
  
    def _create_prompt(self):  
        """创建查询构建提示词"""  
        return ChatPromptTemplate.from_messages([  
            ("system", """你是一个查询构建助手。将用户的自然语言查询转换为结构化查询。  
  
可用的元数据字段:  
- author (string): 作者名称  
- date (string): 发布日期，格式YYYY-MM-DD  
- category (string): 文档类别  
- views (integer): 浏览次数  
- tags (list): 标签列表  
  
请返回JSON格式:  
{{  
    "semantic_query": "语义搜索内容",  
    "filters": {{        
	    "field_name": {{            
		    "operator": "==|!=|>|<|>=|<=|in",            
		    "value": "value"        
	    }}    
    }}
}}  
  
例如：  
用户查询: 找出张三在2023年写的浏览量超过1000的文章  
返回:  
{{  
    "semantic_query": "张三 文章",  
    "filters": {{        
	    "author": {{"operator": "==", "value": "张三"}},  
        "date": {{"operator": ">=", "value": "2023-01-01"}},        
        "date": {{"operator": "<=", "value": "2023-12-31"}},        
        "views": {{"operator": ">", "value": 1000}}    
    }}
}}   
如果没有过滤条件，filters可以为空对象。"""),  
            ("human", "{question}")  
        ])  
  
    def construct(self, question: str) -> Dict[str, Any]:  
        """构建查询  
  
        Returns:            
        {                
        "semantic_query": str,                
        "filters": dict            
        }        
        """        
        chain = self.prompt | self.llm  
        response = chain.invoke({"question": question})  
  
        # 解析响应  
        import json  
        try:  
            query_dict = json.loads(response.content)  
            return query_dict  
        except json.JSONDecodeError:  
            # 如果解析失败，返回原始查询  
            return {  
                "semantic_query": question,  
                "filters": {}  
            }  
  
    def construct_filter(self, filters: Dict[str, Any]) -> str:  
        """将过滤器转换为向量数据库查询格式  
  
        不同的向量数据库有不同的过滤语法:  
        - Chroma: {"field": {"$op": value}}        
        - Pinecone: {"field": {"$op": value}}        
        - Weaviate: where filter        
        """        
        # 这里以Chroma为例  
        if not filters:  
            return None  
  
        chroma_filter = {}  
        for field, condition in filters.items():  
            operator = condition.get("operator", "==")  
            value = condition["value"]  
  
            # 映射操作符  
            op_map = {  
                "==": "$eq",  
                "!=": "$ne",  
                ">": "$gt",  
                "<": "$lt",  
                ">=": "$gte",  
                "<=": "$lte",  
                "in": "$in"  
            }  
  
            chroma_op = op_map.get(operator, "$eq")  
            chroma_filter[field] = {chroma_op: value}  
  
        return chroma_filter  
  
  
# 使用示例  
  
# llm使用本地的qwen3:4b  
llm = ChatOpenAI(  
    model="qwen3:4b",  
    api_key=os.getenv("LLM_API_KEY"),  
    base_url=os.getenv("LLM_BASE_URL"),  
    temperature=0,  
    max_tokens=1000  
)  
  
constructor = QueryConstructor(llm)  
  
# 构建查询  
question = "找出在2022年的哈基米类别中浏览量超过500的文章"  
query = constructor.construct(question)  
  
print("语义查询:", query["semantic_query"])  
print("过滤条件:", query["filters"])  
  
# 转换为向量数据库格式  
chroma_filter = constructor.construct_filter(query["filters"])  
print("Chroma过滤器:", chroma_filter)
```

* `def construct_filter(self, filters: Dict[str, Any]) -> str:`：这个函数是一个适配器，它通过将LLM的通用语言（如`==、>=`等）转换为只有`chroma`才懂的语言（`$eq、$gte`），再能在`chroma`中检索相应的内容。
	* `op_map = { ... }`：这是一个“静态映射” (Static Map 或“查找表” (Lookup Table, LUT)。这是此函数“最核心”的“业务逻辑”。它将“抽象的操作符”（`==`，`>=`）**“映射” (Maps) 到“**Chroma DB 的“具体实现”**”（`$eq`，`$gte`）。
	* `operator = condition.get("operator", "==")`和`chroma_op = op_map.get(operator, "$eq") `中的`==`和`$eq`都是默认default的，若是operator中没有指明，则默认使用`==` ，若有指明，则使用指明的操作符。

#### 具体流程

![[Query Construction2.excalidraw.png]]
#### 另一个版本 支持AND/OR逻辑

```python
class AdvancedQueryConstructor(QueryConstructor):
    """高级查询构建器"""
    
    def construct_complex_filter(self, question: str) -> Dict[str, Any]:
        """构建复杂过滤器（支持AND/OR逻辑）"""
        query = self.construct(question)
        filters = query.get("filters", {})
        
        if not filters:
            return None
        
        # 支持多个条件的AND逻辑，这里也可以改成OR逻辑
        and_conditions = []
        for field, condition in filters.items():
            operator = condition.get("operator", "==")
            value = condition["value"]
            
            # Chroma格式
            if operator == "==":
                and_conditions.append({field: {"$eq": value}})
            elif operator == ">":
                and_conditions.append({field: {"$gt": value}})
            elif operator == ">=":
                and_conditions.append({field: {"$gte": value}})
            elif operator == "<":
                and_conditions.append({field: {"$lt": value}})
            elif operator == "<=":
                and_conditions.append({field: {"$lte": value}})
        
        # 组合多个条件
        if len(and_conditions) > 1:
            return {"$and": and_conditions} # $or
        elif len(and_conditions) == 1:
            return and_conditions[0]
        else:
            return None
    
    def query_with_filter(self, question: str, vectorstore):
        """执行带过滤的查询"""
        # 构建查询
        query = self.construct(question)
        semantic_query = query["semantic_query"]
        
        # 构建过滤器
        filter_dict = self.construct_complex_filter(question)
        
        print(f"🔍 语义查询: {semantic_query}")
        print(f"📋 过滤条件: {filter_dict}")
        
        # 执行查询
        if filter_dict:
            docs = vectorstore.similarity_search(
                semantic_query,
                k=5,
                filter=filter_dict
            )
        else:
            docs = vectorstore.similarity_search(semantic_query, k=5)
        
        return docs

# 使用示例
advanced_constructor = AdvancedQueryConstructor(llm)

# 复杂查询
results = advanced_constructor.query_with_filter(
    "找出2023年机器学习类别的热门文章",
    vectorstore
)

for doc in results:
    print(f"\n内容: {doc.page_content[:100]}...")
    print(f"元数据: {doc.metadata}")
```

* 这一部分的代码区别就是最后的`chroma`中条件过滤可以选择`AND`或`OR`逻辑，filter条件为：
	*  `{"$and": [{"A": 1}, {"B": 2}]}`
	*  `{"$or": [{"A": 1}, {"B": 2}]}`
	*  `{"A": 1, "B": 2}` 是基础版

# 4 自查询检索器 Self-Query Retriever

这个部分其实就是结合了第二板块的语义搜索和第三板块的结构化查询。

自查询检索器是LangChain提供的高级工具，它能够**自动**将自然语言查询分离为：**语义搜索部分、结构化过滤部分**。

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import ChatOpenAI
from langchain.vectorstores import Chroma

# 1. 定义元数据字段
metadata_field_info = [
    AttributeInfo(
        name="author",
        description="文章作者",
        type="string"
    ),
    AttributeInfo(
        name="published_date",
        description="发布日期，格式: YYYY-MM-DD",
        type="string"
    ),
    AttributeInfo(
        name="word_count",
        description="文章字数",
        type="integer"
    ),
    AttributeInfo(
        name="category",
        description="文章类别，如: 技术、生活、旅游等",
        type="string"
    ),
    AttributeInfo(
        name="tags",
        description="文章标签列表",
        type="list[string]"
    ),
]

# 2. 文档内容描述
document_content_description = "博客文章集合"

# 3. 创建LLM
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

# 4. 创建自查询检索器
self_query_retriever = SelfQueryRetriever.from_llm(
    llm=llm,
    vectorstore=vectorstore,
    document_contents=document_content_description,
    metadata_field_info=metadata_field_info,
    verbose=True,  # 显示内部过程
    enable_limit=True  # 启用结果数量限制
)

# 5. 使用自查询检索器
query = "找出李四在2023年写的关于Python的文章"
results = self_query_retriever.get_relevant_documents(query)

print(f"找到 {len(results)} 个结果:")
for doc in results:
    print(f"\n标题: {doc.page_content[:50]}...")
    print(f"作者: {doc.metadata.get('author')}")
    print(f"日期: {doc.metadata.get('published_date')}")
```

* 提供这个方法的是`SelfQueryRetriever.from_llm`，配置完里面的`document_contents`和`metadata_field_info`就能自动完成语义搜索和结构化搜索了。
* 在使用这类搜索时，注意Prompt中的构建，要使用限定语句或者条件语句为佳。


## 参考资料

[RAG路由与查询构建：智能检索的核心技术 | Deeptoai RAG系列教程](https://rag.deeptoai.com/docs/brag-tutorial/3-routing-query-construction)