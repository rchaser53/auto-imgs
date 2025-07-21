# 🔧 使用前の確認事項チェックリスト

画像生成バッチを使用する前に、以下の項目を確認してください。

## 📋 必須要件

### 1. Node.js環境の準備
- [ ] **Node.js 16以上がインストールされている**
  ```bash
  node --version
  # v16.0.0以上であることを確認
  ```
- [ ] **npm が使用可能**
  ```bash
  npm --version
  ```

### 2. Stable Diffusion WebUI の準備
- [ ] **Stable Diffusion WebUI がインストールされている**
- [ ] **WebUI が正常に起動できる**
- [ ] **モデルファイル（.safetensors/.ckpt）がロードされている**

### 3. API有効化での起動
- [ ] **WebUIを `--api` オプション付きで起動している**
  ```bash
  # 起動例
  python launch.py --api
  # または
  ./webui.sh --api
  ```

### 4. 接続確認
- [ ] **WebUIが http://127.0.0.1:7860 でアクセス可能**
- [ ] **ブラウザでWebUIの画面が表示される**
- [ ] **手動でテスト画像生成ができる**

## 🚀 JavaScript環境セットアップ

### 5. プロジェクトセットアップ
- [ ] **package.jsonファイルが存在する**
- [ ] **依存関係をインストール済み**
  ```bash
  npm install
  ```
- [ ] **インストールが正常に完了**
  ```bash
  # エラーなく完了することを確認
  ls node_modules
  ```

### 6. 実行権限設定
- [ ] **JavaScriptファイルに実行権限が付与されている**
  ```bash
  chmod +x generate-images.js batch-generate.js test-api.js
  ```
- [ ] **シェルスクリプトに実行権限が付与されている**
  ```bash
  chmod +x run-batch-js.sh
  ```

## ⚙️ 設定ファイル

### 7. 環境設定
- [ ] **`.env`ファイルが存在する**
- [ ] **WebUIのURLが正しく設定されている**
  ```
  WEBUI_URL=http://127.0.0.1:7860
  ```
- [ ] **出力ディレクトリが設定されている**
  ```
  OUTPUT_DIR=./output
  ```

### 8. プロンプト設定
- [ ] **`prompts.json`ファイルを確認済み**
- [ ] **JSON形式が正しい**
- [ ] **プロンプト内容が適切に設定されている**

## 🔍 動作テスト

### 9. API接続テスト
- [ ] **API接続テストが成功**
  ```bash
  npm run test
  # または
  node test-api.js
  # または
  ./run-batch-js.sh --test
  ```
- [ ] **APIレスポンスが正常**

### 10. 設定ファイル検証
- [ ] **設定ファイルの構文チェック**
  ```bash
  npm run validate prompts.json
  # または
  node batch-generate.js prompts.json --validate-only
  # または
  ./run-batch-js.sh --validate prompts.json
  ```

### 11. テスト実行
- [ ] **少ないプロンプトでテスト実行**
- [ ] **出力ディレクトリに画像が生成される**
- [ ] **メタデータファイル（.json）も生成される**

## ⚠️ よくある問題と対処法

### Node.jsバージョンエラー
- **症状**: "Node.js 16以上が必要です" エラー
- **対処**: 
  - https://nodejs.org/ から最新版をダウンロード
  - nvm使用の場合: `nvm install 18 && nvm use 18`

### 依存関係インストールエラー
- **症状**: `npm install` でエラーが発生
- **対処**:
  ```bash
  # キャッシュクリア
  npm cache clean --force
  
  # node_modules削除して再インストール
  rm -rf node_modules package-lock.json
  npm install
  ```

### モジュール読み込みエラー
- **症状**: "Cannot use import statement outside a module" エラー
- **対処**: package.jsonに `"type": "module"` が設定されていることを確認

### API接続エラー
- **症状**: "APIに接続できません" エラー
- **対処**: 
  - WebUIが起動しているか確認
  - `--api` オプション付きで起動しているか確認
  - ファイアウォール設定を確認

## 📁 JavaScript版ディレクトリ構成確認

### 12. ファイル配置
```
auto-imgs/
├── package.json              # Node.jsプロジェクト設定
├── generate-images.js        # メインスクリプト
├── batch-generate.js         # 設定ファイル対応版
├── test-api.js              # API接続テスト
├── prompts.json             # プロンプト設定
├── .env                     # 環境設定
├── run-batch-js.sh          # JavaScript実行スクリプト
├── node_modules/            # 依存関係（自動生成）
├── output/                  # 出力ディレクトリ（自動作成）
├── README-JS.md             # JavaScript版使用方法
└── SETUP_CHECKLIST_JS.md    # このファイル
```

## ✅ JavaScript版 初回実行推奨手順

1. **Node.js確認**
   ```bash
   node --version  # v16.0.0以上
   npm --version
   ```

2. **依存関係インストール**
   ```bash
   cd /Users/rchaser53/Desktop/auto-imgs
   npm install
   ```

3. **WebUI起動**
   ```bash
   cd /path/to/stable-diffusion-webui
   python launch.py --api
   ```

4. **API接続テスト**
   ```bash
   npm run test
   ```

5. **設定確認**
   ```bash
   npm run validate prompts.json
   ```

6. **テスト実行**
   ```bash
   npm start
   ```

## 🎯 推奨実行方法

```bash
# 1. 簡単実行（シェルスクリプト使用）
./run-batch-js.sh

# 2. NPMスクリプト使用
npm start

# 3. 直接実行
node generate-images.js
```

---

**🎯 すべてのチェックが完了したら、JavaScript版バッチ処理を安全に実行できます！**

最終更新: 2025年7月21日
