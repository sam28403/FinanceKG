<template>
  <div id="network" style="width:100%; height:100%; border:1px solid #ddd;"></div>
</template>

<script setup>
import { defineEmits, onMounted, defineExpose, ref } from "vue" // 引入 ref
import { Network } from "vis-network"
import Papa from "papaparse"

const emit = defineEmits(["node-clicked"])

// 关键修正：使用 ref() 声明 network 和 nodes，使其具备响应性
let network = ref(null)
let nodes = ref([])

// 读取 CSV 文件
async function loadCSV(path) {
  return new Promise((resolve) => {
    Papa.parse(path, {
      download: true,
      header: true,
      complete: (results) => resolve(results.data)
    })
  })
}

async function renderGraph() {
  const nodesCSV = await loadCSV("/node-export.csv")
  const edgesCSV = await loadCSV("/relationship-export.csv")

  // 更新 ref 值时，使用 .value
  nodes.value = nodesCSV.map((n, index) => ({
    id: index,
    label: n.name || n.label || `Node ${index}`,
  }))

  // 解析关系中的 ID
  const extractId = (v) => parseInt(v.split(":").pop())

  const edges = edgesCSV.map((e) => ({
    from: extractId(e["~start_node_id"]),
    to: extractId(e["~end_node_id"]),
    label: e["~relationship_type"],
    arrows: "to"
  }))

  const container = document.getElementById("network")

  const data = { nodes: nodes.value, edges } // vis-network 只需要普通数组
  const options = {
    interaction: {
      hover: true,
      tooltipDelay: 300,
      select: true
    },
    edges: { smooth: true },
    physics: { enabled: true }
  }

  // 更新 network ref 的值
  network.value = new Network(container, data, options)

  // 点击事件中，访问 ref 值时也要使用 .value
  network.value.on("click", function (params) {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0]
      // 访问 nodes.value
      const nodeData = nodes.value.find(n => n.id === nodeId)
      emit("node-clicked", nodeData)
    }
  })
}

onMounted(() => {
  renderGraph()
})

// 暴露 ref 对象。App.vue 访问 graphRef.value.nodes 时将自动获取最新的值
defineExpose({
  network,
  nodes
});
</script>

<style scoped>
#network {
  width: 100%;
  height: 100%;
}
</style>