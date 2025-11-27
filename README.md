# 金融知识图谱

## 创建Google API Key

前往Google AI Studio，生成自己的API Key。将其复制到记事本中，格式如下：

```
GEMINI_API_KEY=*******
```

然后保存文件名为`.env`，将其保存至项目根目录中。

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### 启用后端

```sh
node src/api/server.js
```

### Compile and Minify for Production

```sh
npm run build
```
