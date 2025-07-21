#!/usr/bin/env node
/**
 * Stable Diffusion WebUI API 接続テストスクリプト
 */

import { StableDiffusionAPI } from './generate-images.js';

async function testApiConnection() {
    console.log('=== Stable Diffusion WebUI API 接続テスト ===\n');
    
    const api = new StableDiffusionAPI();
    
    console.log('設定情報:');
    console.log(`- WebUI URL: ${api.baseUrl}`);
    console.log(`- API Endpoint: ${api.apiEndpoint}`);
    console.log(`- 出力ディレクトリ: ${api.outputDir}\n`);
    
    // API接続テスト
    console.log('API接続チェック中...');
    try {
        const isConnected = await api.checkApiStatus();
        
        if (isConnected) {
            console.log('✅ API接続: 成功');
            
            // オプション情報取得
            try {
                const response = await api.client.get('/sdapi/v1/options');
                console.log('✅ API応答: 正常');
                console.log(`📊 利用可能な機能数: ${Object.keys(response.data).length}`);
            } catch (error) {
                console.log('⚠️  API応答: エラー', error.message);
            }
            
            // モデル情報取得
            try {
                const modelsResponse = await api.client.get('/sdapi/v1/sd-models');
                console.log(`🎨 利用可能なモデル数: ${modelsResponse.data.length}`);
                if (modelsResponse.data.length > 0) {
                    console.log(`📝 現在のモデル: ${modelsResponse.data[0].model_name || 'Unknown'}`);
                }
            } catch (error) {
                console.log('⚠️  モデル情報取得: エラー', error.message);
            }
            
            // サンプラー情報取得
            try {
                const samplersResponse = await api.client.get('/sdapi/v1/samplers');
                console.log(`🔧 利用可能なサンプラー数: ${samplersResponse.data.length}`);
            } catch (error) {
                console.log('⚠️  サンプラー情報取得: エラー', error.message);
            }
            
        } else {
            console.log('❌ API接続: 失敗');
            console.log('\n対処方法:');
            console.log('1. Stable Diffusion WebUIが起動していることを確認');
            console.log('2. WebUIが --api オプション付きで起動されていることを確認');
            console.log('3. ファイアウォール設定を確認');
            console.log('4. .envファイルのWEBUI_URLが正しいことを確認');
        }
        
    } catch (error) {
        console.log('❌ API接続テスト中にエラー:', error.message);
    }
    
    console.log('\n=== テスト完了 ===');
}

// 簡単な画像生成テスト
async function testImageGeneration() {
    console.log('\n=== 簡単な画像生成テスト ===\n');
    
    const api = new StableDiffusionAPI();
    
    // API接続チェック
    if (!(await api.checkApiStatus())) {
        console.log('❌ APIに接続できないため、画像生成テストをスキップします');
        return;
    }
    
    console.log('テスト画像生成中...');
    
    const testPrompt = 'a simple red circle on white background, minimal, clean';
    const testParams = {
        steps: 10,
        width: 256,
        height: 256,
        cfg_scale: 5
    };
    
    try {
        const result = await api.generateImage(testPrompt, '', testParams);
        
        if (result && result.images && result.images.length > 0) {
            console.log('✅ テスト画像生成: 成功');
            
            // 画像保存テスト
            const metadata = {
                prompt: testPrompt,
                parameters: testParams,
                test: true,
                generation_time: new Date().toISOString()
            };
            
            const savedPath = await api.saveImage(result.images[0], 'test_image', metadata);
            
            if (savedPath) {
                console.log('✅ 画像保存: 成功');
                console.log(`📁 保存先: ${savedPath}`);
            } else {
                console.log('❌ 画像保存: 失敗');
            }
            
        } else {
            console.log('❌ テスト画像生成: 失敗');
        }
        
    } catch (error) {
        console.log('❌ 画像生成テスト中にエラー:', error.message);
    }
}

async function main() {
    await testApiConnection();
    
    // ユーザーに画像生成テストを実行するか確認
    console.log('\n画像生成テストを実行しますか？ (y/N):');
    
    // 簡単な入力処理
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', async (key) => {
        if (key === 'y' || key === 'Y') {
            process.stdin.setRawMode(false);
            process.stdin.pause();
            await testImageGeneration();
            process.exit(0);
        } else {
            console.log('\n画像生成テストをスキップしました');
            process.exit(0);
        }
    });
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('テスト実行中にエラーが発生しました:', error.message);
        process.exit(1);
    });
}
