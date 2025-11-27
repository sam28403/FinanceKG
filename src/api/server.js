import 'global-agent/bootstrap.js';
import express from "express";
import fetch from "node-fetch"; // 如果 node 版本 > 18，这行其实可以删掉
import dotenv from "dotenv";
import cors from "cors";


dotenv.config();

const app = express();
app.use(cors()); // 允许跨域，防止浏览器拦截
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 1. 打印日志，确认请求是否到达
app.use((req, res, next) => {
    console.log(`收到请求: ${req.method} ${req.url}`);
    next();
});

// 2. 路由定义 (注意这里只处理 POST)
app.post("/api/gemini/generate", async (req, res) => {
    const { keyword } = req.body;

    // cURL: url
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    // cURL: body
    const requestBody = {
        contents: [{
            parts: [{
                text: `请用中文：用简洁、专业的语言介绍金融知识图谱中的实体 “${keyword}”。适配阅读对象为金融与数据分析初学者，长度控制在 150～300 字。`
            }]
        }]
    };

    console.log("正在向 Gemini 发送请求...");

    try {
        const r = await fetch(url, {
            method: "POST",
            headers: {
                // cURL: -H 'Content-Type: application/json'
                "Content-Type": "application/json",
                // cURL: -H 'X-goog-api-key: *****'
                "X-goog-api-key": GEMINI_API_KEY
            },
            body: JSON.stringify(requestBody)
        });

        const data = await r.json();

        if (!r.ok) {
            console.error("Gemini 报错:", data);
            return res.status(r.status).json(data);
        }

        console.log("Gemini 请求成功!");
        return res.json(data);

    } catch (err) {
        console.error("服务器内部错误:", err);
        res.status(500).json({ error: err.message });
    }
});

const port = 3000;
app.listen(port, () => console.log(`后端服务已启动: http://localhost:${port}`));