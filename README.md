# TODO App

高機能なTODOアプリケーション。React + TypeScript + Vite + Supabaseで構築されています。

## 機能

- タスクの追加・編集・削除
- 期日設定と残り日数表示
- カテゴリ分類（仕事、個人、買い物、健康、その他）
- 優先度設定（低、中、高）
- 検索・フィルター機能
- 進捗バー表示
- レスポンシブデザイン
- ユーザー認証（Supabase）

## Supabase Configuration for Deployment

**⚠️ IMPORTANT**: When deploying to production, you must update the Supabase dashboard configuration:

1. Navigate to your Supabase project dashboard
2. Go to **Authentication → URL Configuration**
3. Update the **Site URL** from `http://localhost:3000` to your deployed app URL (e.g., `https://your-app.devinapps.com`)
4. Add your deployed app URL to the **Redirect URLs** allow list

**Why this is needed**: The Site URL in Supabase dashboard overrides the `emailRedirectTo` parameter in your frontend code. If left as localhost, confirmation emails will redirect users to localhost instead of your deployed app, breaking the authentication flow.

## ローカル開発環境（Docker Database）

### 前提条件

- Node.js 18以上
- Docker & Docker Compose
- npm または yarn

### セットアップ

1. 依存関係をインストール:
   ```bash
   npm install
   ```

2. 環境変数を設定:
   ```bash
   cp .env.example .env
   # .envファイルを編集してデータベース認証情報を設定
   ```

3. ローカルPostgreSQLデータベースを起動:
   ```bash
   docker-compose up -d
   ```

4. ローカルAPIサーバーの依存関係をインストール:
   ```bash
   cd server
   npm install
   cd ..
   ```

5. ローカルAPIサーバーを起動（別ターミナル）:
   ```bash
   cd server
   npm start
   ```

6. 開発サーバーを起動（別ターミナル）:
   ```bash
   npm run dev
   ```

7. ブラウザで http://localhost:5173 にアクセス

**注意**: ローカル開発では以下の3つのサービスが必要です：
- PostgreSQL データベース (Docker, port 5432)
- ローカルAPIサーバー (Express.js, port 3001)  
- フロントエンド開発サーバー (Vite, port 5173)

### 環境設定

`.env`ファイルで環境を切り替えできます：

- `VITE_USE_LOCAL_DB=true`: ローカルDockerデータベースを使用
- `VITE_USE_LOCAL_DB=false`: 本番Supabaseデータベースを使用

### データベース管理

```bash
# データベースを起動
docker-compose up -d

# データベースを停止
docker-compose down

# データベースとボリュームを削除（データも削除されます）
docker-compose down -v

# データベースの状態を確認
docker-compose ps
```

## 本番環境

本番環境では自動的にSupabaseデータベースが使用されます。

## トラブルシューティング

### 認証メールのリダイレクトURL問題

**症状**: 確認メールのリンクがlocalhostにリダイレクトされる

**解決方法**: 
1. Supabaseダッシュボードの「Authentication → URL Configuration」で Site URL を本番URLに更新
2. Redirect URLs リストに本番URLを追加
3. 変更を保存

### データベース接続エラー

**症状**: ローカル開発でデータベース接続エラー

**解決方法**:
1. Docker Composeが起動していることを確認: `docker-compose ps`
2. 環境変数が正しく設定されていることを確認
3. ローカルAPIサーバーが起動していることを確認

## 開発ワークフロー

1. ローカルでDockerデータベースを使用して開発
2. 機能テスト後、本番Supabaseでも動作確認
3. デプロイ

## 技術スタック

- **フロントエンド**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui, Lucide Icons
- **データベース**: 
  - 開発: PostgreSQL (Docker)
  - 本番: Supabase PostgreSQL
- **認証**: Supabase Auth
- **デプロイ**: Devin Apps Platform
