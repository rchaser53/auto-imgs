#!/usr/bin/env node
/**
 * 外部設定ファイルからプロンプトを読み込んで画像を生成するスクリプト (JavaScript版)
 */

import { program } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { ImageGenerationBatch } from './generate-images.js';

async function loadPromptsFromFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`エラー: ファイルが見つかりません: ${filePath}`);
        } else if (error instanceof SyntaxError) {
            console.error(`エラー: JSONファイルの解析に失敗しました: ${error.message}`);
        } else {
            console.error(`エラー: ファイル読み込みに失敗しました: ${error.message}`);
        }
        return null;
    }
}

function validatePromptsConfig(promptsConfig) {
    if (!Array.isArray(promptsConfig)) {
        console.error('エラー: 設定ファイルは配列形式である必要があります');
        return false;
    }
    
    for (let i = 0; i < promptsConfig.length; i++) {
        const config = promptsConfig[i];
        
        if (typeof config !== 'object' || config === null) {
            console.error(`エラー: プロンプト${i + 1}は辞書形式である必要があります`);
            return false;
        }
        
        if (!config.prompt || typeof config.prompt !== 'string') {
            console.error(`エラー: プロンプト${i + 1}にpromptが設定されていません`);
            return false;
        }
    }
    
    return true;
}

async function main() {
    program
        .name('batch-generate')
        .description('外部設定ファイルから画像を生成')
        .argument('[config-file]', 'プロンプト設定ファイル', 'prompts.json')
        .option('--validate-only', '設定ファイルの検証のみ実行')
        .option('--verbose', '詳細な出力を表示')
        .version('1.0.0');
    
    program.parse();
    
    const options = program.opts();
    const configFile = program.args[0] || 'prompts.json';
    const configPath = path.resolve(configFile);
    
    // ファイル存在チェック
    if (!(await fs.pathExists(configPath))) {
        console.error(`エラー: 設定ファイルが見つかりません: ${configPath}`);
        process.exit(1);
    }
    
    // プロンプト設定を読み込み
    const promptsConfig = await loadPromptsFromFile(configPath);
    
    if (promptsConfig === null) {
        process.exit(1);
    }
    
    console.log(`設定ファイル: ${configPath}`);
    console.log(`プロンプト数: ${promptsConfig.length}`);
    
    // 設定の検証
    if (!validatePromptsConfig(promptsConfig)) {
        process.exit(1);
    }
    
    console.log('設定ファイルの検証: OK');
    
    if (options.validateOnly) {
        console.log('検証のみ実行しました');
        return;
    }
    
    try {
        // バッチ処理実行
        const batch = new ImageGenerationBatch();
        await batch.runBatch(promptsConfig);
    } catch (error) {
        console.error('バッチ処理でエラーが発生しました:', error.message);
        if (options.verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// スクリプトが直接実行された場合のみメイン関数を実行
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('予期しないエラーが発生しました:', error.message);
        process.exit(1);
    });
}
