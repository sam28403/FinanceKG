// src/api/ai.js （前端调用后端代理）
export async function getNodeInfo(keyword) {
    const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword })
    });
    if (!res.ok) {
        const t = await res.text();
        throw new Error("后端代理调用失败: " + t);
    }
    const data = await res.json();
    // data 是 Gemini 原始响应（或后端可加工后的精简字段）
    // 若后端直接返回 Gemini 原始响应，客户端需要解析候选文本：
    const candidateText =
        data?.candidates?.[0]?.content?.[0]?.text ||
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        data?.candidates?.[0]?.output?.[0]?.content?.[0]?.text ||
        JSON.stringify(data).slice(0, 1000);

    return candidateText;
}
