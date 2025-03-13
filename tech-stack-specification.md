# ヨガアプリ技術スタック仕様書

## 開発プラットフォーム
- **対象OS**: iOS / Android
- **開発フレームワーク**: React Native または Flutter（選定理由を記載）
- **最小サポートバージョン**: iOS 14以上、Android 9.0以上

## フロントエンド技術
- **UI Framework**: React Native Elements / Flutter Material Components
- **状態管理**: Redux / Provider パターン
- **ローカルストレージ**: AsyncStorage + SQLite / Hive + SQLite
- **カメラ処理**: react-native-camera / camera パッケージ

## ポーズ検出技術
- **姿勢検出エンジン**: MediaPipe Pose（バージョン: 0.8.10以上）
  - 代替選択肢: TensorFlow Lite / Fritz AI（必要に応じて）
- **検出パラメータ**:
  - 最小検出信頼度: 0.7
  - モデル複雑度: 1（0-2の範囲、値が大きいほど精度が高いが処理が重い）
  - 検出タイムアウト: 500ms

## パフォーマンス要件
- **フレームレート目標**: 最低15FPS（理想は30FPS）
- **メモリ使用量上限**: 200MB
- **バッテリー消費**: 1時間の連続使用で20%以下

## データモデル要件
- **データ形式**: JSON / Protocol Buffers
- **クラウド同期形式**: REST API / GraphQL（フェーズ2）

## セキュリティ要件
- **ローカルデータ暗号化**: AES-256
- **通信暗号化**: TLS 1.3（フェーズ2）

## バックエンド技術（MVPフェーズ2向け）
- **サーバー**: Node.js / Firebase
- **データベース**: MongoDB / Firestore
- **認証**: Firebase Authentication / Auth0

## テスト要件
- **ユニットテスト**: Jest / XCTest / JUnit
- **UI自動テスト**: Detox / Appium
- **手動テスト項目リスト**: 別途提供

## CI/CD
- **ビルド自動化**: GitHub Actions / Bitrise
- **コード品質**: ESLint / Dart Analyzer
- **テスト配布**: TestFlight / Firebase App Distribution
