# ヨガアプリ機能仕様書

## MVPフェーズ1の必須機能

### 1. ポーズライブラリ
- **内容**: プリインストールされた基本ポーズ（初級レベル10種類）
- **表示情報**: 名前、説明、難易度、参考画像
- **優先度**: 最高（P0）

### 2. カメラキャプチャと姿勢検出
- **機能**: リアルタイムでユーザーの姿勢を検出
- **処理フロー**:
  1. 15FPS以上でカメラから画像キャプチャ
  2. MediaPipeで姿勢検出（33キーポイント）
  3. キーポイントの座標を抽出
- **エラー処理**:
  - 顔や体の一部が見切れている場合の警告表示
  - 光量不足の場合の警告表示
  - 検出失敗時の再試行（最大3回）
- **優先度**: 最高（P0）

### 3. ポーズ分析エンジン
- **分析方法**:
  1. 関節角度の計算（肘、膝、肩など主要8関節）
  2. 基準ポーズとの角度差を算出
  3. 0-100点のスコアに変換
- **判定基準**:
  - 90-100点: 優秀（緑色表示）
  - 70-89点: 良好（青色表示）
  - 50-69点: 改善の余地あり（黄色表示）
  - 0-49点: 要修正（赤色表示）
- **優先度**: 最高（P0）

### 4. 視覚的ガイド表示
- **表示方法**:
  1. カメラプレビュー上に理想的なポーズのシルエットをオーバーレイ表示
  2. ユーザーの骨格線は表示せず、アライメントポイントのみ表示
  3. ポイントが合っているかどうかを色で示す（緑：良好、黄：要調整、赤：大きく調整）
- **方向ガイド**:
  - 必要に応じて簡単な矢印で調整方向を示す
  - 最小限のテキスト指示（オプションで表示/非表示切替可能）
- **優先度**: 最高（P0）

### 5. レッスンモード
- **構成**: 3-5つのポーズを組み合わせたシンプルなフロー
- **内容**: 初級者向けレッスン3種類をプリインストール
- **進行**: ポーズごとに30秒〜1分のホールド、音声ガイド付き
- **優先度**: 高（P1）

### 6. 基本統計
- **記録**: セッション日時、実施レッスン、各ポーズのスコア
- **表示**: 過去7日間の練習履歴、平均スコア
- **優先度**: 中（P2）

## MVPフェーズ2で追加予定の機能

### 1. ユーザーアカウント
- **機能**: 会員登録、ログイン、プロフィール管理
- **認証方法**: メール/パスワード、SNS連携
- **優先度**: 高（P1）

### 2. クラウド同期
- **機能**: ユーザーデータのクラウド保存と同期
- **同期項目**: 練習履歴、お気に入りポーズ、カスタム設定
- **優先度**: 中（P2）

### 3. 拡張レッスンライブラリ
- **追加内容**: 中級者向けレッスン5種類、上級者向け2種類
- **カスタマイズ**: お気に入りレッスンの保存
- **優先度**: 中（P2）

## 将来実装予定の機能（参考）

### 1. 実績システム
- **内容**: 継続練習や目標達成による実績バッジ
- **優先度**: 低（P3）

### 2. ソーシャル機能
- **内容**: 友達との進捗共有、チャレンジ機能
- **優先度**: 低（P3）

### 3. 高度な分析
- **内容**: 長期的な上達度グラフ、ヒートマップ
- **優先度**: 低（P3）
