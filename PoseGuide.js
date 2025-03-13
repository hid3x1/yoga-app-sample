// PoseGuide.js - 視覚的ガイド生成クラスの実装サンプル

class PoseGuide {
  constructor(targetPose) {
    if (!targetPose) {
      throw new Error('TargetPose must be provided to PoseGuide');
    }
    
    this.targetPose = targetPose;
    this.userKeyPoints = null;
    this.alignmentStatus = {}; // ポイントごとの合わせ状態
    this.guideOpacity = 0.6;   // ガイドの透明度
    this.lastFrameTime = 0;    // フレームレート制御用
    this.lastWidth = 0;        // キャンバスサイズキャッシュ
    this.lastHeight = 0;       // キャンバスサイズキャッシュ
    
    // 色定義 - 色覚異常対応のため高コントラストに調整
    this.colors = {
      silhouette: '#4FC3F7',
      correct: '#4CAF50',       // 緑色
      needsAdjustment: '#FFC107', // 黄色
      incorrect: '#F44336'      // 赤色
    };
    
    // 色覚異常モード用の代替色セット
    this.accessibleColors = {
      silhouette: '#4FC3F7',
      correct: '#4CAF50',       // 緑色はそのまま
      needsAdjustment: '#E040FB', // 紫色に変更
      incorrect: '#2196F3'      // 青色に変更
    };
    
    this.useAccessibleColors = false; // デフォルトは標準色
    
    // エラー状態
    this.errorState = null;
    
    // シルエット画像の読み込み
    this.silhouetteImage = new Image();
    this.silhouetteImage.onerror = () => {
      this.errorState = 'silhouette-load-failed';
      console.error('Failed to load silhouette image:', targetPose.silhouetteUrl);
    };
    this.silhouetteImage.src = targetPose.silhouetteUrl;
    
    // 最適化: 計算結果のキャッシュ
    this.cachedCalculations = {};
  }
  
  // ユーザーの姿勢データを更新
  updateUserKeyPoints(detectedKeyPoints) {
    if (!detectedKeyPoints || !Array.isArray(detectedKeyPoints)) {
      console.warn('Invalid keypoints data provided to updateUserKeyPoints');
      return;
    }
    
    // パフォーマンス最適化: フレームレート制限
    const now = Date.now();
    if (now - this.lastFrameTime < 30) { // 約30FPSに制限
      return; // スキップ
    }
    this.lastFrameTime = now;
    
    this.userKeyPoints = detectedKeyPoints;
    this.updateAlignmentStatus();
  }
  
  // アクセシビリティ: 色覚異常モードの切り替え
  toggleAccessibleColors(enabled) {
    this.useAccessibleColors = enabled;
  }
  
  // アライメント状態を更新（内部計算）
  updateAlignmentStatus() {
    if (!this.userKeyPoints) {
      return;
    }
    
    if (!this.targetPose.guidancePoints || !Array.isArray(this.targetPose.guidancePoints)) {
      console.error('Target pose has no valid guidance points');
      this.errorState = 'invalid-target-pose';
      return;
    }
    
    try {
      // 各ガイダンスポイントについて状態を評価
      this.targetPose.guidancePoints.forEach(point => {
        if (!point || !point.keypoint) {
          console.warn('Invalid guidance point found in target pose');
          return;
        }
        
        const keypoint = point.keypoint;
        const userPoint = this.userKeyPoints.find(p => p && p.name === keypoint);
        const targetPoint = this.targetPose.keyPoints?.find(p => p && p.name === keypoint);
        
        if (userPoint && targetPoint && targetPoint.targetPosition) {
          // キャッシュキーの作成（高速ルックアップ用）
          const cacheKey = `${keypoint}_${userPoint.position[0]}_${userPoint.position[1]}`;
          
          // キャッシュされた結果があれば使用
          if (this.cachedCalculations[cacheKey]) {
            this.alignmentStatus[keypoint] = this.cachedCalculations[cacheKey];
            return;
          }
          
          // 位置の差異を計算
          const distance = this.calculateDistance(userPoint.position, targetPoint.targetPosition);
          
          // 重要度に基づいた許容範囲
          const tolerance = point.importance === 'high' ? 0.05 : 
                            point.importance === 'medium' ? 0.1 : 0.15;
          
          // 状態判定
          let status;
          if (distance < tolerance) {
            status = 'correct';
          } else if (distance < tolerance * 2) {
            status = 'needsAdjustment';
          } else {
            status = 'incorrect';
          }
          
          this.alignmentStatus[keypoint] = status;
          
          // 結果をキャッシュ（最適化）
          this.cachedCalculations[cacheKey] = status;
          
          // キャッシュサイズの制限（メモリ最適化）
          if (Object.keys(this.cachedCalculations).length > 100) {
            // 最も古いエントリを削除
            const oldestKey = Object.keys(this.cachedCalculations)[0];
            delete this.cachedCalculations[oldestKey];
          }
        }
      });
    } catch (error) {
      console.error('Error updating alignment status:', error);
      this.errorState = 'alignment-calculation-error';
    }
  }
  
  // エラー状態のリセット
  resetError() {
    this.errorState = null;
  }
  
  // エラー状態の取得
  getErrorState() {
    return this.errorState;
  }
  
  // 二点間の距離を計算
  calculateDistance(point1, point2) {
    if (!point1 || !point2 || point1.length < 2 || point2.length < 2) {
      console.warn('Invalid points provided to calculateDistance');
      return Infinity; // エラー時は大きな値を返す
    }
    
    try {
      const dx = point1[0] - point2[0];
      const dy = point1[1] - point2[1];
      return Math.sqrt(dx * dx + dy * dy);
    } catch (error) {
      console.error('Error calculating distance:', error);
      return Infinity;
    }
  }
  
  // バッテリー消費を抑えるためのパフォーマンスモード設定
  setPerformanceMode(mode) {
    // mode: 'high', 'balanced', 'powersave'
    switch (mode) {
      case 'powersave':
        // バッテリー節約モード
        this.frameLimitMs = 100; // 約10FPS
        break;
      case 'balanced':
        // バランスモード
        this.frameLimitMs = 50;  // 約20FPS
        break;
      case 'high':
      default:
        // 高パフォーマンスモード
        this.frameLimitMs = 30;  // 約30FPS
    }
  }
  
  // キャンバスに視覚的ガイドを描画
  drawVisualGuide(ctx, width, height) {
    if (!ctx) {
      console.error('Canvas context is required for drawVisualGuide');
      return;
    }
    
    // エラー状態チェック
    if (this.errorState) {
      this._drawErrorState(ctx, width, height);
      return;
    }
    
    // パフォーマンス最適化：サイズ変更があった場合のみ特定の計算を行う
    const sizeChanged = this.lastWidth !== width || this.lastHeight !== height;
    this.lastWidth = width;
    this.lastHeight = height;
    
    // 使用する色セットを選択
    const colorSet = this.useAccessibleColors ? this.accessibleColors : this.colors;
    
    // 1. シルエットを描画
    ctx.globalAlpha = this.guideOpacity;
    ctx.drawImage(this.silhouetteImage, 0, 0, width, height);
    
    // 2. アライメントポイントを描画（ユーザーの骨格は描画しない）
    if (this.userKeyPoints && this.targetPose.guidancePoints) {
      this.targetPose.guidancePoints.forEach(point => {
        if (!point || !point.keypoint) return;
        
        const keypoint = point.keypoint;
        const userPoint = this.userKeyPoints.find(p => p && p.name === keypoint);
        const targetPoint = this.targetPose.keyPoints?.find(p => p && p.name === keypoint);
        
        if (userPoint && targetPoint && targetPoint.targetPosition) {
          // 目標位置にポイントを描画
          const status = this.alignmentStatus[keypoint] || 'needsAdjustment';
          const color = colorSet[status];
          const size = point.visualSize || 15;
          
          const x = targetPoint.targetPosition[0] * width;
          const y = targetPoint.targetPosition[1] * height;
          
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
          
          // 方向矢印の表示（状態が「incorrect」の場合のみ）
          if (status === 'incorrect' && userPoint.position) {
            this.drawDirectionArrow(
              ctx, 
              userPoint.position[0] * width, 
              userPoint.position[1] * height,
              x, y, 
              color,
              size
            );
          }
        }
      });
    }
    
    ctx.globalAlpha = 1.0; // 透明度をリセット
  }
  
  // エラー状態の表示
  _drawErrorState(ctx, width, height) {
    // エラー表示の背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, width, height);
    
    // エラーメッセージ
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    
    let message = '問題が発生しました。もう一度お試しください。';
    switch (this.errorState) {
      case 'silhouette-load-failed':
        message = 'ポーズの画像読み込みに失敗しました。ネットワーク接続を確認してください。';
        break;
      case 'invalid-target-pose':
        message = 'ポーズデータが無効です。別のポーズをお試しください。';
        break;
      case 'alignment-calculation-error':
        message = '姿勢分析中にエラーが発生しました。もう一度お試しください。';
        break;
    }
    
    ctx.fillText(message, width / 2, height / 2);
  }
  
  // 修正方向を示す矢印を描画
  drawDirectionArrow(ctx, fromX, fromY, toX, toY, color, size) {
    if (!ctx) return;
    
    try {
      // 方向と距離を計算
      const dx = toX - fromX;
      const dy = toY - fromY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 距離が近すぎる場合は矢印を描画しない
      if (distance < size * 2) return;
      
      // 矢印の長さと方向を正規化
      const arrowLength = Math.min(distance * 0.5, 40);
      const dirX = dx / distance;
      const dirY = dy / distance;
      
      // 矢印の先端位置
      const tipX = fromX + dirX * arrowLength;
      const tipY = fromY + dirY * arrowLength;
      
      // 矢印を描画
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(tipX, tipY);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // 矢印の先端
      const headSize = 10;
      const angle = Math.atan2(dy, dx);
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(
        tipX - headSize * Math.cos(angle - Math.PI / 6),
        tipY - headSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        tipX - headSize * Math.cos(angle + Math.PI / 6),
        tipY - headSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    } catch (error) {
      console.error('Error drawing direction arrow:', error);
    }
  }
  
  // ガイドの透明度を設定
  setOpacity(opacity) {
    this.guideOpacity = Math.max(0, Math.min(1, opacity));
  }
  
  // リソース解放（メモリリーク防止）
  dispose() {
    // キャッシュのクリア
    this.cachedCalculations = {};
    // 参照の解放
    this.userKeyPoints = null;
    this.alignmentStatus = {};
    // 画像参照の解放
    this.silhouetteImage.src = '';
    this.silhouetteImage.onload = null;
    this.silhouetteImage.onerror = null;
  }
}

export default PoseGuide;
