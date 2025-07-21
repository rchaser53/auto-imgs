#!/bin/bash
# JavaScript版 Stable Diffusion画像生成バッチ実行スクリプト

set -e

# カラー出力用
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Stable Diffusion WebUI API 画像生成バッチ (JavaScript版)${NC}"
echo "============================================"

# Node.js環境チェック
if ! command -v node &> /dev/null; then
    echo -e "${RED}エラー: Node.jsがインストールされていません${NC}"
    echo "Node.js 16以上をインストールしてください"
    exit 1
fi

# Node.jsバージョンチェック
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="16.0.0"

if ! node -e "process.exit(process.versions.node.split('.')[0] >= 16 ? 0 : 1)"; then
    echo -e "${RED}エラー: Node.js 16以上が必要です (現在: v${NODE_VERSION})${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js環境: v${NODE_VERSION}${NC}"

# package.jsonチェック
if [ ! -f "package.json" ]; then
    echo -e "${RED}エラー: package.jsonが見つかりません${NC}"
    exit 1
fi

# 依存関係インストール
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 依存関係をインストールしています...${NC}"
    npm install
else
    echo -e "${GREEN}✅ 依存関係: インストール済み${NC}"
fi

# .envファイルのチェック
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .envファイルが見つかりません。.env.exampleからコピーしています...${NC}"
    cp .env.example .env
fi

# 出力ディレクトリの作成
if [ ! -d "output" ]; then
    mkdir output
    echo -e "${GREEN}📁 出力ディレクトリを作成しました: output/${NC}"
fi

# スクリプトファイルの実行権限チェック
chmod +x generate-images.js batch-generate.js test-api.js

# 引数に応じて実行
case "${1:-}" in
    "--help"|"-h")
        echo "使用方法:"
        echo "  $0                              # 内蔵プロンプトで実行"
        echo "  $0 config.json                  # 設定ファイルを指定して実行"
        echo "  $0 --validate config.json       # 設定ファイルの検証のみ"
        echo "  $0 --test                       # API接続テスト"
        echo "  $0 --install                    # 依存関係の再インストール"
        echo "  $0 --help                       # このヘルプを表示"
        ;;
    "--test")
        echo -e "${BLUE}🧪 API接続テストを実行します...${NC}"
        node test-api.js
        ;;
    "--validate")
        if [ $# -lt 2 ]; then
            echo -e "${RED}エラー: 検証する設定ファイルを指定してください${NC}"
            exit 1
        fi
        echo -e "${BLUE}🔍 設定ファイルを検証しています: $2${NC}"
        node batch-generate.js "$2" --validate-only
        ;;
    "--install")
        echo -e "${YELLOW}📦 依存関係を再インストールしています...${NC}"
        rm -rf node_modules package-lock.json
        npm install
        echo -e "${GREEN}✅ 再インストール完了${NC}"
        ;;
    "")
        echo -e "${GREEN}🎨 内蔵プロンプトで画像生成を開始します...${NC}"
        node generate-images.js
        ;;
    *)
        if [[ "$1" == *.json ]]; then
            echo -e "${GREEN}🎨 設定ファイルで画像生成を開始します: $1${NC}"
            node batch-generate.js "$1" "${@:2}"
        else
            echo -e "${RED}エラー: 不明なオプション: $1${NC}"
            echo "使用方法については $0 --help を参照してください"
            exit 1
        fi
        ;;
esac

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 処理が完了しました！${NC}"
else
    echo -e "${RED}❌ 処理中にエラーが発生しました${NC}"
    exit 1
fi
