<template>
  <el-container class="full-container">
    <el-aside width="400px" class="aside-box">
      <h2 class="title">金融知识图谱</h2>

      <el-input
          v-model="input"
          placeholder="请输入查询内容"
          size="large"
          clearable
          class="search-input"
          @keyup.enter="searchKeyword"
      />
      <el-button type="primary" style="margin-top: 10px" @click="searchKeyword">
        搜索
      </el-button>

      <el-card v-if="selectedNode" class="node-info">
        <h3>{{ selectedNode.label }}</h3>
        <div v-html="nodeDescription"></div>
      </el-card>
    </el-aside>

    <el-main class="main-box">
      <GraphViewer ref="graphRef" @node-clicked="handleNodeClick"/>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref } from "vue"
import GraphViewer from "./components/GraphViewer.vue"
import { getNodeInfo } from "./api/ai.js" // 假设 ai.js 和 server.js 已经解决了网络和代理问题

const input = ref("")
const selectedNode = ref(null)
const nodeDescription = ref("")
const graphRef = ref(null)


async function handleNodeClick(node) {
  selectedNode.value = node;
  nodeDescription.value = "正在查询 AI 信息...";
  try {
    // 调用已修复的 AI 接口
    const text = await getNodeInfo(node.label || node.id);
    nodeDescription.value = text;
  } catch (e) {
    // 失败时的错误信息（已解决）
    nodeDescription.value =
        `AI 查询失败，请稍后重试。尝试在 <a href="https://www.google.com/search?q=${encodeURIComponent(selectedNode.value.label)}" target="_blank" style="color: #409EFF; text-decoration: underline;">Google</a> 上搜寻。`;
  }
}

// 搜索功能 (修正后使用 vis-network API)
const searchKeyword = () => {
  const keyword = input.value.trim().toLowerCase();
  if (!keyword) return;

  const { network, nodes } = graphRef.value || {};

  if (!network || !nodes || nodes.length === 0) {
    nodeDescription.value = `图谱数据尚未加载完成，请稍后重试。`;
    return;
  }

  // 1. 查找匹配的节点数据
  const foundNodeData = nodes.find((n) => {
    return n?.label?.toLowerCase().includes(keyword);
  });

  if (foundNodeData) {
    const nodeId = foundNodeData.id;

    // --- 调试点 1: 确认节点已找到 ---
    console.log(`[Search] 找到节点: ${foundNodeData.label}, ID: ${nodeId}`);

    // --- 使用 vis-network API 进行定位和高亮 (健壮性检查) ---
    try {
      // a. 取消所有选择
      network.unselectAll();

      // b. 高亮显示找到的节点
      // 简化 selectNodes 调用，移除不需要的参数
      network.selectNodes([nodeId]);

      // c. 移动摄像机聚焦到该节点
      network.focus(
          { nodes: [nodeId], animation: true },
          {
            scale: 0.8,
            animation: {
              duration: 800,
              easingFunction: 'easeInOutQuad'
            }
          }
      );
      // 调试点 2: 确认 vis-network 交互完成
      console.log(`[Search] vis-network 交互完成 (高亮/聚焦)`);

    } catch (e) {
      // 如果 vis-network 交互失败，至少保证 AI 查询能被触发
      console.error("[Search] vis-network 交互失败，可能图谱未完全稳定:", e);
    }

    // 2. 触发节点信息查询 (这是最关键的一步)
    // 调试点 3: 确认 handleNodeClick 被调用
    console.log("[Search] 触发 handleNodeClick...");
    handleNodeClick(foundNodeData);

  } else {
    nodeDescription.value = `未找到相关节点：${keyword}`;
  }
};


</script>

<style scoped>
.full-container {
  width: 100vw;
  height: 100vh;
  display: flex;
}

.aside-box {
  background: #f5f7fa;
  padding: 20px;
  border-right: 1px solid #dcdfe6;
}

.title {
  margin-bottom: 20px;
  font-size: 20px;
}

.search-input {
  width: 100%;
  margin-bottom: 20px;
}

.node-info {
  margin-top: 15px;
  padding: 15px;
}

.main-box {
  padding: 10px;
  background: #ffffff;
}
</style>