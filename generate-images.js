#!/usr/bin/env node
/**
 * Stable Diffusion WebUI API を使用して画像を生成するバッチスクリプト (JavaScript版)
 */

import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ES modules での __dirname 取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env ファイルを読み込み
dotenv.config();

class StableDiffusionAPI {
    constructor() {
        this.baseUrl = process.env.WEBUI_URL || 'http://127.0.0.1:7860';
        this.apiEndpoint = process.env.API_ENDPOINT || '/sdapi/v1/txt2img';
        this.outputDir = path.resolve(process.env.OUTPUT_DIR || './output');
        this.imagePrefix = process.env.IMAGE_PREFIX || 'generated_';
        
        // HTTPクライアントの設定
        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: 300000, // 5分のタイムアウト
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        this.ensureOutputDir();
    }
    
    async ensureOutputDir() {
        try {
            await fs.ensureDir(this.outputDir);
        } catch (error) {
            console.error('出力ディレクトリの作成に失敗:', error.message);
        }
    }
    
    async checkApiStatus() {
        try {
            const response = await this.client.get('/sdapi/v1/options');
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }
    
    async getAvailableModels() {
        try {
            const response = await this.client.get('/sdapi/v1/sd-models');
            return response.data;
        } catch (error) {
            console.error('モデル一覧の取得に失敗:', error.message);
            return [];
        }
    }
    
    async getCurrentModel() {
        try {
            const response = await this.client.get('/sdapi/v1/options');
            return response.data.sd_model_checkpoint;
        } catch (error) {
            console.error('現在のモデルの取得に失敗:', error.message);
            return null;
        }
    }
    
    async setModel(modelName) {
        try {
            const response = await this.client.post('/sdapi/v1/options', {
                sd_model_checkpoint: modelName
            });
            console.log(`モデルを変更しました: ${modelName}`);
            return true;
        } catch (error) {
            console.error('モデルの変更に失敗:', error.message);
            return false;
        }
    }
    
    async generateImage(prompt, negativePrompt = '', customParams = {}) {
        // デフォルトパラメータ
        const defaultParams = {
            prompt: prompt,
            negative_prompt: negativePrompt,
            steps: 20,
            sampler_name: "DPM++ 2M Karras",
            cfg_scale: 7,
            width: 512,
            height: 512,
            batch_size: 1,
            n_iter: 1,
            seed: -1,
            restore_faces: false,
            tiling: false,
            enable_hr: false,
        };
        
        // カスタムパラメータで上書き（modelパラメータは除外）
        const { model, ...apiParams } = customParams;
        const params = { ...defaultParams, ...apiParams };
        
        // モデルが指定されている場合は変更
        if (model && model !== await this.getCurrentModel()) {
            console.log(`モデルを切り替え中: ${model}`);
            await this.setModel(model);
            // モデル変更後は少し待機
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        // デバッグ用ログ
        console.log('=== 画像生成パラメータ ===');
        console.log(`プロンプト: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`);
        console.log(`ネガティブプロンプト: ${negativePrompt.substring(0, 50)}${negativePrompt.length > 50 ? '...' : ''}`);
        console.log(`ステップ数: ${params.steps}`);
        console.log(`CFGスケール: ${params.cfg_scale}`);
        console.log(`サイズ: ${params.width}x${params.height}`);
        console.log(`サンプラー: ${params.sampler_name}`);
        
        try {
            console.log(`画像生成中: ${prompt.substring(0, 50)}...`);
            const response = await this.client.post(this.apiEndpoint, params);
            
            // レスポンスの詳細チェック
            if (response.data) {
                console.log('✓ API応答受信');
                if (response.data.images && response.data.images.length > 0) {
                    console.log(`✓ 生成画像数: ${response.data.images.length}`);
                    console.log(`画像データサイズ: ${response.data.images[0].length} 文字`);
                } else {
                    console.log('⚠ 画像データが空です');
                }
            }
            
            return response.data;
        } catch (error) {
            console.error('API呼び出しエラー:', error.message);
            if (error.response) {
                console.error('レスポンス:', error.response.status, error.response.data);
            }
            return null;
        }
    }
    
    async saveImage(imageData, prompt, metadata = null) {
        try {
            console.log('=== 画像保存処理 ===');
            console.log(`受信データサイズ: ${imageData.length} 文字`);
            
            // Base64デコード
            const imageBuffer = Buffer.from(imageData, 'base64');
            console.log(`デコード後バッファサイズ: ${imageBuffer.length} バイト`);
            
            // 画像フォーマットチェック
            const header = imageBuffer.slice(0, 8);
            const isPNG = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47;
            const isJPEG = header[0] === 0xFF && header[1] === 0xD8;
            const isWebP = header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46;
            
            console.log(`画像フォーマット: ${isPNG ? 'PNG' : isJPEG ? 'JPEG' : isWebP ? 'WebP' : '不明'}`);
            
            if (!isPNG && !isJPEG && !isWebP) {
                console.warn('⚠ 認識できない画像フォーマットです');
                console.log(`ヘッダー: ${Array.from(header).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ')}`);
            }
            
            // ファイル名生成（より読みやすい形式）
            const now = new Date();
            const timestamp = now.toISOString()
                .slice(0, 19)
                .replace(/[-:]/g, '')
                .replace('T', '_');
            
            // プロンプトから安全なファイル名を生成
            const safePrompt = prompt
                .replace(/[^a-zA-Z0-9\s\-_]/g, '')
                .substring(0, 30)
                .replace(/\s+/g, '_')
                .trim();
            
            const filename = `${this.imagePrefix}${timestamp}_${safePrompt}.png`;
            const filepath = path.join(this.outputDir, filename);
            
            console.log(`保存先: ${filepath}`);
            
            // 画像を保存
            await fs.writeFile(filepath, imageBuffer);
            
            // メタデータを保存
            if (metadata) {
                const metadataPath = filepath.replace('.png', '.json');
                await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
                console.log(`メタデータ保存: ${metadataPath}`);
            }
            
            console.log(`✓ 画像を保存しました: ${filepath}`);
            return filepath;
            
        } catch (error) {
            console.error('画像保存エラー:', error.message);
            return null;
        }
    }
}

class ImageGenerationBatch {
    constructor() {
        this.api = new StableDiffusionAPI();
    }
    
    async listAvailableModels() {
        const models = await this.api.getAvailableModels();
        console.log('\n=== 利用可能なモデル ===');
        models.forEach((model, index) => {
            console.log(`${index + 1}. ${model.title} (${model.model_name})`);
        });
        return models;
    }
    
    async runBatch(promptsConfig) {
        // API接続チェック
        if (!(await this.api.checkApiStatus())) {
            console.error('エラー: Stable Diffusion WebUI APIに接続できません');
            console.error(`URL: ${this.api.baseUrl}`);
            console.error('WebUIが起動していることを確認してください');
            return;
        }
        
        console.log('Stable Diffusion WebUI APIに接続しました');
        console.log(`出力ディレクトリ: ${this.api.outputDir}`);
        
        // 現在のモデルを表示
        const currentModel = await this.api.getCurrentModel();
        if (currentModel) {
            console.log(`現在のモデル: ${currentModel}`);
        }
        
        let totalImages = 0;
        let successfulImages = 0;
        
        for (let i = 0; i < promptsConfig.length; i++) {
            const config = promptsConfig[i];
            console.log(`\n--- ${i + 1}/${promptsConfig.length} ---`);
            
            const prompt = config.prompt || '';
            const negativePrompt = config.negative_prompt || '';
            const params = config.params || {};
            
            if (!prompt) {
                console.log('プロンプトが設定されていません。スキップします。');
                continue;
            }
            
            // 画像生成
            const result = await this.api.generateImage(prompt, negativePrompt, params);
            
            if (result && result.images) {
                for (let j = 0; j < result.images.length; j++) {
                    const imageData = result.images[j];
                    totalImages++;
                    
                    // メタデータ準備
                    const currentModel = await this.api.getCurrentModel();
                    const metadata = {
                        prompt: prompt,
                        negative_prompt: negativePrompt,
                        parameters: params,
                        model: currentModel,
                        generation_time: new Date().toISOString(),
                        batch_index: i + 1,
                        image_index: j + 1
                    };
                    
                    // 画像保存
                    if (await this.api.saveImage(imageData, prompt, metadata)) {
                        successfulImages++;
                    }
                    
                    // 連続生成の場合は少し待機
                    if (j < result.images.length - 1) {
                        await this.sleep(1000);
                    }
                }
            } else {
                console.log('画像生成に失敗しました');
            }
            
            // バッチ間の待機時間
            if (i < promptsConfig.length - 1) {
                await this.sleep(2000);
            }
        }
        
        console.log('\n=== バッチ処理完了 ===');
        console.log(`総生成数: ${totalImages}`);
        console.log(`成功数: ${successfulImages}`);
        console.log(`出力先: ${this.api.outputDir}`);
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// メイン実行部分
async function main() {
    // サンプルプロンプト設定
    const samplePrompts = [
        {
            prompt: 'a beautiful landscape with mountains and a lake, sunset, digital art',
            negative_prompt: 'blurry, low quality, distorted',
            params: {
                steps: 25,
                cfg_scale: 8,
                width: 768,
                height: 512
            }
        },
        {
            prompt: 'cute cat sitting on a windowsill, soft lighting, photography',
            negative_prompt: 'blurry, low quality',
            params: {
                steps: 20,
                cfg_scale: 7,
                width: 512,
                height: 512
            }
        },
        {
            prompt: 'futuristic city skyline at night, neon lights, cyberpunk style',
            negative_prompt: 'blurry, low quality, distorted',
            params: {
                steps: 30,
                cfg_scale: 9,
                width: 768,
                height: 512,
                sampler_name: 'Euler a'
            }
        }
    ];
    
    try {
        const batch = new ImageGenerationBatch();
        await batch.runBatch(samplePrompts);
    } catch (error) {
        console.error('バッチ処理でエラーが発生しました:', error.message);
        process.exit(1);
    }
}

// スクリプトが直接実行された場合のみメイン関数を実行
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { StableDiffusionAPI, ImageGenerationBatch };
