# Stable Diffusion WebUI API 画像生成バッチ

このプロジェクトは、Stable Diffusion WebUIのAPIを使用して複数の画像を自動生成するNode.jsスクリプトです。

## 🚀 前提条件

1. **Node.js 16以上**がインストールされていること
2. **Stable Diffusion WebUI**が起動していること
   - デフォルトでは `http://127.0.0.1:7860` で動作していることを想定
   - WebUIを起動する際は `--api` オプションが必要

## 📦 セットアップ

### 1. 依存関係をインストール
```bash
npm install
```

### 2. 設定ファイルをコピー（必要に応じて編集）
```bash
cp .env.example .env
```

### 3. API接続テスト
```bash
npm run test
# または
node test-api.js
```

## 🎯 使用方法

### 方法1: NPMスクリプトを使用
```bash
# 内蔵プロンプトで実行
npm start

# 外部設定ファイルで実行
npm run batch prompts.json

# 設定ファイルの検証
npm run validate prompts.json
```

### 方法2: 直接Node.jsで実行
```bash
# 内蔵プロンプトで実行
node generate-images.js

# 外部設定ファイルで実行
node batch-generate.js prompts.json

# 設定ファイルの検証のみ
node batch-generate.js prompts.json --validate-only
```

### 方法3: シェルスクリプトで実行（推奨）
```bash
# 内蔵プロンプトで実行
./run-batch-js.sh

# 設定ファイルを指定して実行
./run-batch-js.sh prompts.json

# API接続テスト
./run-batch-js.sh --test

# 設定ファイルの検証
./run-batch-js.sh --validate prompts.json

# ヘルプ表示
./run-batch-js.sh --help
```

## ⚙️ 設定ファイル

### .env ファイル
```env
WEBUI_URL=http://127.0.0.1:7860
API_ENDPOINT=/sdapi/v1/txt2img
OUTPUT_DIR=./output
IMAGE_PREFIX=generated_
```

### プロンプト設定ファイル (JSON)
```json
[
  {
    "prompt": "画像生成のプロンプト",
    "negative_prompt": "除外したい要素",
    "params": {
      "steps": 25,
      "cfg_scale": 8,
      "width": 768,
      "height": 512,
      "sampler_name": "DPM++ 2M Karras"
    }
  }
]
```

## 📋 利用可能なパラメータ

| パラメータ | 説明 | デフォルト値 |
|----------|------|------------|
| `prompt` | 画像生成のプロンプト（必須） | - |
| `negative_prompt` | ネガティブプロンプト | "" |
| `steps` | サンプリングステップ数 | 20 |
| `cfg_scale` | CFGスケール | 7 |
| `width` | 画像幅 | 512 |
| `height` | 画像高さ | 512 |
| `sampler_name` | サンプラー名 | "DPM++ 2M Karras" |
| `batch_size` | バッチサイズ | 1 |
| `n_iter` | 反復回数 | 1 |
| `seed` | シード値 | -1 (ランダム) |
| `restore_faces` | 顔修復 | false |
| `enable_hr` | 高解像度生成 | false |

## 📁 出力

- **画像ファイル**: `output/generated_YYYYMMDDTHHMMSS_prompt.png`
- **メタデータ**: `output/generated_YYYYMMDDTHHMMSS_prompt.json`

メタデータには生成時のプロンプトとパラメータが記録されます。

## 🔧 開発・デバッグ

### API接続テスト
```bash
node test-api.js
```

### 詳細出力でバッチ実行
```bash
node batch-generate.js prompts.json --verbose
```

### 依存関係の再インストール
```bash
./run-batch-js.sh --install
```

## ❗ エラー対処

### Node.jsバージョンエラー
```bash
# Node.jsのバージョン確認
node --version

# 16以上でない場合は更新が必要
# https://nodejs.org/ からダウンロード
```

### API接続エラー
1. Stable Diffusion WebUIが起動していることを確認
2. WebUIが `--api` オプション付きで起動されていることを確認
3. `.env`ファイルのURLが正しいことを確認
4. API接続テストを実行: `npm run test`

### 依存関係エラー
```bash
# node_modulesとpackage-lock.jsonを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

## 📝 実行例

```bash
# 基本実行
./run-batch-js.sh

# カスタム設定で実行
./run-batch-js.sh my_prompts.json

# API テスト
./run-batch-js.sh --test

# 設定ファイル検証
./run-batch-js.sh --validate prompts.json

# 詳細出力で実行
node batch-generate.js prompts.json --verbose
```

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。
